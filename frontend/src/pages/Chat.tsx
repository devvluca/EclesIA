
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatMessage, { Message } from '@/components/ChatMessage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { v4 as uuidv4 } from 'uuid';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated AI response function
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // In a real implementation, this would call a backend API
    // For now, we'll simulate a response with some examples
    
    // Wait for 1-2 seconds to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const userMessageLower = userMessage.toLowerCase();
    
    if (userMessageLower.includes('anglicana') || userMessageLower.includes('anglican')) {
      return "A tradição Anglicana surgiu no século XVI durante a Reforma Inglesa. Combina elementos católicos e protestantes, valorizando a Escritura, Tradição e Razão. A Igreja Episcopal Carismática do Brasil segue essa tradição, mas também incorpora elementos do movimento carismático, enfatizando os dons do Espírito Santo.";
    } 
    else if (userMessageLower.includes('episcopal') || userMessageLower.includes('iecb')) {
      return "A Igreja Episcopal Carismática do Brasil (IECB) é uma denominação cristã que combina a rica liturgia e tradição episcopal anglicana com a espiritualidade carismática. Valorizamos a Bíblia como Palavra de Deus, os sacramentos, especialmente a Eucaristia, e cremos na ação presente do Espírito Santo com seus dons e manifestações.";
    }
    else if (userMessageLower.includes('carismática') || userMessageLower.includes('carismatico') || userMessageLower.includes('espírito santo') || userMessageLower.includes('dons')) {
      return "O aspecto carismático da IECB enfatiza a obra do Espírito Santo, incluindo os dons espirituais mencionados em 1 Coríntios 12, como profecia, cura, línguas e interpretação. Acreditamos que esses dons continuam ativos na igreja hoje, conforme 1 Coríntios 14:1 nos encoraja a 'seguir o amor e buscar com zelo os dons espirituais'.";
    }
    else if (userMessageLower.includes('sacramentos') || userMessageLower.includes('eucaristia') || userMessageLower.includes('batismo')) {
      return "Na tradição episcopal, reconhecemos sete sacramentos: Batismo, Eucaristia (Santa Comunhão), Confirmação, Reconciliação (Confissão), Matrimônio, Ordenação e Unção dos Enfermos. Os dois principais são o Batismo e a Eucaristia, instituídos diretamente por Cristo. Através deles, recebemos a graça de Deus por meio de sinais físicos e visíveis.";
    }
    else if (userMessageLower.includes('liturgia') || userMessageLower.includes('culto') || userMessageLower.includes('adoração')) {
      return "Nossa liturgia combina elementos tradicionais anglicanos, como o Livro de Oração Comum, com expressões contemporâneas de adoração. O culto geralmente inclui leituras bíblicas, orações, pregação e a celebração da Eucaristia. Também valorizamos momentos de louvor espontâneo, oração pelos dons do Espírito e ministração.";
    }
    else {
      return "Agradeço sua pergunta. Como EclesIA, estou aqui para ajudar com informações sobre a Igreja Episcopal Carismática do Brasil e a tradição Anglicana. Você pode perguntar sobre nossa história, crenças, práticas litúrgicas, sacramentos, ou qualquer outro aspecto de nossa fé. Como posso ajudá-lo melhor?";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Generate AI response
      const aiResponseContent = await generateAIResponse(input);
      
      // Add AI message
      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
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

  return (
    <div className="flex flex-col min-h-screen bg-cream-light">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto bg-cream rounded-2xl shadow-lg overflow-hidden border border-wood/10 h-[calc(100vh-200px)] flex flex-col">
          
          {/* Chat Header */}
          <div className="bg-wood p-4 text-cream-light flex items-center">
            <img src="/img/episcopal_logo.png" alt="EclesIA Logo" className="h-8 mr-3" />
            <div>
              <h2 className="font-serif text-lg">EclesIA</h2>
              <p className="text-xs text-cream/80">Assistente da Igreja Episcopal Carismática</p>
            </div>
          </div>
          
          {/* Chat Messages */}
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
          
          {/* Chat Input */}
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
