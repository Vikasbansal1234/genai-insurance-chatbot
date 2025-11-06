"use client";

import { MessageSquare, Trash2, Plus } from "lucide-react";
import { Chat, deleteChat, fetchChatById } from "@/lib/chat-api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChatHistoryListProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string, messages: Chat['messages']) => void;
  onNewChat: () => void;
  onChatsChange: () => void;
}

export function ChatHistoryList({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onChatsChange,
}: ChatHistoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleChatClick = async (chatId: string) => {
    try {
      const chat = await fetchChatById(chatId);
      onSelectChat(chatId, chat.messages);
    } catch (error) {
      // Failed to load chat
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    setDeletingId(chatId);
    try {
      await deleteChat(chatId);
      onChatsChange();
      
      // If deleting current chat, start a new one
      if (chatId === currentChatId) {
        onNewChat();
      }
    } catch (error) {
      alert('Failed to delete chat');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-2 border-b">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No chats yet</p>
              <p className="text-xs mt-1">Start a conversation!</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg transition-colors group relative cursor-pointer",
                  "hover:bg-accent/50",
                  currentChatId === chat._id
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                  deletingId === chat._id && "opacity-50 cursor-not-allowed"
                )}
              >
                <div 
                  className="flex items-start justify-between gap-2"
                  onClick={() => deletingId !== chat._id && handleChatClick(chat._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-70" />
                      <p className="text-sm font-medium truncate">
                        {chat.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {chat.messages.length} messages
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {formatDate(chat.lastMessageAt.toString())}
                      </span>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    disabled={deletingId === chat._id}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                      "flex-shrink-0"
                    )}
                    title="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

