"use client";

import { FC, useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { toast } from "sonner";

export const VoiceInput: FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());

  // Clear the silence detection timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  // Stop recording function
  const stopRecording = useCallback((isAutoStop: boolean = false) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Error stopping recording
      }
      
      setIsRecording(false);
      clearSilenceTimer();
      
      // Force update the composer state by re-triggering input event
      setTimeout(() => {
        const inputElement = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
        if (inputElement && inputElement.value.trim()) {
          inputElement.focus();
          
          // Use native setter to trigger React state update
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value'
          )?.set;
          
          const currentValue = inputElement.value;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(inputElement, currentValue);
          }
          
          // Dispatch React-compatible events
          const inputEvent = new Event('input', { bubbles: true, composed: true });
          Object.defineProperty(inputEvent, 'target', { writable: false, value: inputElement });
          inputElement.dispatchEvent(inputEvent);
          
          const changeEvent = new Event('change', { bubbles: true, composed: true });
          inputElement.dispatchEvent(changeEvent);
        }
      }, 100); // Small delay to ensure recognition has fully stopped
      
      if (isAutoStop) {
        toast.info('Recording stopped', {
          description: 'Auto-stopped due to silence',
          duration: 2000,
        });
      } else {
        toast.success('Recording stopped', {
          duration: 2000,
        });
      }
    }
  }, [clearSilenceTimer]);

  // Reset the silence detection timer (5 seconds of no speech = auto-stop)
  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    
    silenceTimeoutRef.current = setTimeout(() => {
      const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
      
      // If more than 5 seconds have passed without speech, stop recording
      if (timeSinceLastSpeech >= 5000) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            // Error stopping recording
          }
          
          setIsRecording(false);
          clearSilenceTimer();
          
          // Force update the composer state
          setTimeout(() => {
            const inputElement = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
            if (inputElement && inputElement.value.trim()) {
              inputElement.focus();
              
              // Use native setter to trigger React state update
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                'value'
              )?.set;
              
              const currentValue = inputElement.value;
              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(inputElement, currentValue);
              }
              
              // Dispatch React-compatible events
              const inputEvent = new Event('input', { bubbles: true, composed: true });
              Object.defineProperty(inputEvent, 'target', { writable: false, value: inputElement });
              inputElement.dispatchEvent(inputEvent);
              
              const changeEvent = new Event('change', { bubbles: true, composed: true });
              inputElement.dispatchEvent(changeEvent);
            }
          }, 100);
          
          toast.info('Recording stopped', {
            description: 'Auto-stopped due to silence',
            duration: 2000,
          });
        }
      }
    }, 5000); // Check after 5 seconds
  }, [clearSilenceTimer]);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let hasInterimResults = false;

        // Process results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            hasInterimResults = true;
          }
        }

        // Update last speech time when we detect any speech (interim or final)
        if (finalTranscript || hasInterimResults) {
          lastSpeechTimeRef.current = Date.now();
          resetSilenceTimer();
        }

        // Only update if we have final transcript
        if (finalTranscript) {
          const inputElement = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
          if (inputElement) {
            // Focus first to ensure React is tracking the input
            inputElement.focus();
            
            // Get current value
            const currentValue = inputElement.value;
            const newValue = currentValue ? currentValue + ' ' + finalTranscript.trim() : finalTranscript.trim();
            
            // Use modern input events that React 19 recognizes
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              'value'
            )?.set;
            
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(inputElement, newValue);
            } else {
              inputElement.value = newValue;
            }
            
            // Dispatch React-compatible input event
            const inputEvent = new Event('input', { bubbles: true, composed: true });
            Object.defineProperty(inputEvent, 'target', { writable: false, value: inputElement });
            inputElement.dispatchEvent(inputEvent);
            
            // Also dispatch change event
            const changeEvent = new Event('change', { bubbles: true, composed: true });
            inputElement.dispatchEvent(changeEvent);
          }
        }
      };

      recognition.onerror = (event: any) => {
        // Don't show error toast for 'no-speech' when auto-stopping
        if (event.error === 'no-speech') {
          // Auto-stop on no speech
          stopRecording();
          return;
        }
        
        setIsRecording(false);
        clearSilenceTimer();
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied', {
            description: 'Please allow microphone access in your browser settings',
            duration: 4000,
          });
        } else if (event.error !== 'aborted') {
          toast.error('Speech recognition error', {
            description: event.error,
            duration: 3000,
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        clearSilenceTimer();
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      clearSilenceTimer();
    };
  }, [resetSilenceTimer, stopRecording, clearSilenceTimer]);

  const toggleRecording = () => {
    if (!isSupported) {
      toast.error('Speech recognition not supported', {
        description: 'Your browser does not support speech recognition. Try Chrome or Edge.',
        duration: 4000,
      });
      return;
    }

    if (!recognitionRef.current) {
      return;
    }

    if (isRecording) {
      // Stop recording
      stopRecording(false);
    } else {
      // Start recording
      try {
        lastSpeechTimeRef.current = Date.now();
        recognitionRef.current.start();
        setIsRecording(true);
        
        // Start silence detection
        resetSilenceTimer();
        
        toast.success('Recording started', {
          description: 'Speak now...',
          duration: 2000,
        });
      } catch (error) {
        toast.error('Failed to start recording', {
          description: 'Please try again',
          duration: 3000,
        });
      }
    }
  };

  return (
    <TooltipIconButton
      tooltip={isRecording ? "Stop recording" : "Voice input"}
      side="bottom"
      variant="ghost"
      size="icon"
      className={`size-[34px] rounded-full p-1 text-xs font-semibold hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30 ${
        isRecording ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 animate-pulse' : ''
      }`}
      aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
      onClick={toggleRecording}
      disabled={!isSupported}
    >
      {isRecording ? (
        <MicOff className="size-5 stroke-[1.5px]" />
      ) : (
        <Mic className="size-5 stroke-[1.5px]" />
      )}
    </TooltipIconButton>
  );
};
