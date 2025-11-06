"use client";

import { AssistantRuntimeProvider, ChatModelRunResult, ChatModelAdapter, ChatModelRunOptions, useLocalRuntime } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { useMemo, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { fetchUserChats, Chat } from "@/lib/chat-api";

export const Assistant = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    setUser(userData);
    
    // Load or create user's single chat
    fetchUserChats()
      .then((chats) => {
        if (chats.length > 0) {
          // User has a chat, use it
          const userChat = chats[0];
          setCurrentChatId(userChat._id);
          chatIdRef.current = userChat._id;
        }
        // If no chat exists, it will be created on first message
      })
      .catch(console.error);
  }, [router]);

  // Keep ref in sync
  useEffect(() => {
    chatIdRef.current = currentChatId;
  }, [currentChatId]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const adapter = useMemo<ChatModelAdapter>(() => ({
    async *run({ messages, abortSignal }: ChatModelRunOptions): AsyncGenerator<ChatModelRunResult> {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      const userInput = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : (lastMessage.content.find((part) => part.type === 'text') as any)?.text || "";

      // Extract conversation history from UI thread (excluding current message)
      const conversationHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' 
          ? msg.content 
          : (msg.content.find((part: any) => part.type === 'text') as any)?.text || ""
      }));

      // Get token from localStorage
      const bearerToken = getToken();

      try {
        if (!bearerToken) {
          throw new Error("Not authenticated");
        }

        // Call your backend API with chatId and conversation history
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            input: userInput,
            chatId: chatIdRef.current, // Use ref to get latest value
            conversationHistory, // Send previous messages for context
          }),
          signal: abortSignal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend error:", errorText);
          throw new Error(`API call failed: ${response.status}`);
        }

        const data = await response.json();
        const agentResponse = data.output || data.text || "No response from agent";
        const newChatId = data.chatId;

        // Update chatId if we got a new one (first message)
        if (newChatId && newChatId !== chatIdRef.current) {
          chatIdRef.current = newChatId;
          setCurrentChatId(newChatId);
        }

        // Stream the response word by word for better UX
        const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
        let buffer = '';
        const words = agentResponse.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          if (abortSignal.aborted) return;

          buffer = buffer ? `${buffer} ${words[i]}` : words[i];
          
          yield {
            content: [{
              type: 'text',
              text: buffer,
            }],
          };

          // Small delay for natural typing effect
          await delay(30 + Math.random() * 20);
        }

        // Mark as complete
        yield {
          status: {
            type: 'complete',
            reason: 'stop',
          },
        };
      } catch (error) {
        console.error("Error calling agent:", error);
        yield {
          content: [{
            type: 'text',
            text: "Sorry, I encountered an error processing your request. Please try again.",
          }],
        };
        yield {
          status: {
            type: 'complete',
            reason: 'unknown',
          },
        };
      }
    },
  }), [setCurrentChatId])
  const runtime = useLocalRuntime(adapter)

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-col h-screen w-full">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6 bg-background">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">AI Insurance Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Welcome, </span>
                <span className="font-medium">{user.username}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </header>
        
        {/* Chat Thread */}
        <div className="flex-1 overflow-hidden">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
};
