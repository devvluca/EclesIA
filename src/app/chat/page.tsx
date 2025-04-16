"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { answerTheologicalQuestions } from "@/ai/flows/answer-theological-questions";
import Link from "next/link";
import { Icons } from "@/components/icons";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      text: "Olá! Bem-vindo à EclesIA. Como posso ajudar você hoje?",
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { text: newMessage, isUser: true }]);
      try {
        // Call the AI flow to get the response
        const aiResponse = await answerTheologicalQuestions({ question: newMessage });

        // Add the AI's response to the messages array
        setMessages(prevMessages => [
          ...prevMessages,
          { text: newMessage, isUser: true },
          { text: aiResponse.answer, isUser: false },
        ]);
      } catch (error) {
        console.error("Error calling AI flow:", error);
        // Display an error message to the user
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "Desculpe, ocorreu um erro ao obter a resposta da IA.", isUser: false },
        ]);
      }
      setNewMessage("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
    handleSendMessage();
  };

  const suggestedQuestions = [
    "O que é a IECB?",
    "Quais os sacramentos da Igreja Episcopal?",
    "O que é o batismo na IECB?",
  ];

  return (
    <div className="flex flex-col h-screen bg-warm-beige">
      {/* Chat Header */}
      <div className="bg-beige p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://picsum.photos/50/50" alt="EclesIA" />
              <AvatarFallback>EIA</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">EclesIA Chat</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <Link href="/" className="text-foreground hover:text-primary">
            <Button variant="outline" size="icon">
              <Icons.home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 ${
                message.isUser
                  ? "bg-primary text-white"
                  : "bg-secondary text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Questions */}
      <div className="p-4 bg-beige border-t border-gray-300">
        <div className="flex space-x-2 overflow-x-auto">
          {suggestedQuestions.map((question) => (
            <Button
              key={question}
              variant="secondary"
              onClick={() => handleSuggestionClick(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-beige border-t border-gray-300">
        <div className="flex space-x-4">
          <Input
            type="text"
            placeholder="Escreva sua mensagem..."
            className="flex-1 rounded-xl"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button className="rounded-xl" onClick={handleSendMessage}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
