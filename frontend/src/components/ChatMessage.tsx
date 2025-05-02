import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp); // Certifique-se de que o timestamp é um objeto Date

  return (
    <div className={cn("flex w-full mb-4", 
      isUser ? "justify-end" : "justify-start")}>
      
      {!isUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src="/public/lovable-uploads/79404d9f-b067-4c31-96af-d8651754b8b9.png" />
          <AvatarFallback className="bg-wood-dark text-cream">IA</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "chat-message",
        isUser ? "chat-message user" : "chat-message bot"
      )}>
        <p>{message.content}</p>
        <div className={cn(
          "text-xs mt-1",
          isUser ? "text-cream/70" : "text-wood-dark/70"
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarFallback className="bg-wood text-cream">EU</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
