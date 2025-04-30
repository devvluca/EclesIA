import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatMessage, { Message } from '@/components/ChatMessage';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { v4 as uuidv4 } from 'uuid';

const suggestedQuestions = [
  "O que é a IECB?",
  "Quais os sacramentos da Igreja Episcopal?",
  "O que é o batismo na IECB?",
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou a EclesIA, assistente virtual da Igreja Episcopal Carismática do Brasil. Como posso ajudar com suas dúvidas sobre nossa igreja ou a tradição Anglicana?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  async function generateResponse(message: string, conversationHistory: Message[]) {
    try {
      const fullContext = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
        .join('\n') + `\nUsuário: ${message}`;

      const response = await fetch(import.meta.env.VITE_DIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: fullContext, // Inclui o histórico completo no campo query
          inputs: {},
          response_mode: 'streaming',
          user: 'unique-user-id',
          conversation_id: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Dify API Error:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';
      let finalAnswer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          result += decoder.decode(value, { stream: true });

          const lines = result.split('\n');
          result = lines.pop() || ''; // Mantém o último pedaço incompleto para a próxima iteração
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonString = line.replace('data: ', '').trim();
              if (jsonString && jsonString !== '[DONE]') {
                try {
                  const parsed = JSON.parse(jsonString);
                  if (parsed.answer) {
                    const plainText = parsed.answer.replace(/[*_~`>#-]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
                    finalAnswer += plainText;
                  }
                } catch (err) {
                  console.error('Error parsing streaming chunk:', err);
                }
              }
            }
          }
        }
      }

      return finalAnswer || 'Erro ao processar a resposta.';
    } catch (error) {
      console.error('Error calling Dify API:', error);
      throw error;
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      const aiResponseContent = await generateResponse(input, [...messages, userMessage]);

      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = aiResponseContent;
        }
        return updatedMessages;
      });

      scrollToBottom(); // Ensure scroll after response is updated
    } catch (error) {
      toast({
        title: "Erro ao processar mensagem",
        description: "Não foi possível obter uma resposta no momento. Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-cream-light">
      <Navbar onAuthModalToggle={() => console.log('Auth modal toggled')} />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto bg-cream rounded-2xl shadow-lg overflow-hidden border border-wood/10 h-[calc(100vh-200px)] flex flex-col">
          <div className="bg-wood p-4 text-cream-light flex items-center">
            <img src="/img/episcopal_logo.png" alt="EclesIA Logo" className="h-8 mr-3" />
            <div>
              <h2 className="font-serif text-lg text-cream">EclesIA</h2>
              <p className="text-xs text-cream/80">Assistente da Igreja Episcopal Carismática</p>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />

            {isLoading && (
              <div className="flex items-center space-x-2 text-wood-dark/60 pl-12">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-cream-light">
            <p className="text-sm text-wood-dark mb-2">Sugestões de perguntas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-3 py-1 bg-wood-light text-wood-dark rounded-lg text-sm hover:bg-wood-dark hover:text-cream-light"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-wood/10 p-4 bg-cream-light">
            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-grow border-wood/20 focus-visible:ring-wood"
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="bg-wood hover:bg-wood-dark text-cream-light"
                disabled={isLoading || !input.trim()}
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chat;