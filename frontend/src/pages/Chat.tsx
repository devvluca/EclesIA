import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Square, Plus, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash } from 'lucide-react'; // Import icons
import { useToast } from '@/hooks/use-toast';
import ChatMessage, { Message } from '@/components/ChatMessage';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { v4 as uuidv4 } from 'uuid';

const allSuggestedQuestions = [
  "O que é a IECB?",
  "Quais os sacramentos da Igreja Episcopal?",
  "O que é o batismo na IECB?",
  "Qual a história da Igreja Anglicana?",
  "O que significa ser um cristão anglicano?",
  "Como funciona a liturgia na IECB?",
  "Quais são os princípios da tradição Anglicana?",
  "O que é a Eucaristia?",
  "Como posso participar da IECB?",
  "Qual é o papel da Bíblia na vida cristã?",
  "O que Jesus ensinou sobre o amor ao próximo?",
  "Como posso me conectar mais com Deus?",
  "O que significa ter fé em tempos difíceis?",
  "Quais são os livros mais importantes da Bíblia?",
  "Como os jovens podem se envolver mais na igreja?",
  "O que é o Espírito Santo?",
  "Por que a oração é importante?",
  "Como a Bíblia pode me ajudar no dia a dia?",
  "O que significa ser salvo?",
  "Qual é o propósito da vida segundo a Bíblia?",
];

const Chat = ({ onAuthModalToggle }) => {
  const [chats, setChats] = useState<Record<string, { id: string; name: string; messages: Message[] }>>(() => {
    const savedChats = localStorage.getItem('chats');
    return savedChats ? JSON.parse(savedChats) : {};
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    const savedCurrentChatId = localStorage.getItem('currentChatId');
    return savedCurrentChatId || uuidv4();
  });
  const [messages, setMessages] = useState<Message[]>(chats[currentChatId]?.messages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Sidebar começa recolhida
  const [sidebarTypingTitle, setSidebarTypingTitle] = useState(''); // Estado para o efeito de digitação do título
  const [menuOpenChatId, setMenuOpenChatId] = useState<string | null>(null); // Controle para o menu de opções
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSuggestedQuestions(shuffleArray(allSuggestedQuestions).slice(0, 3));
  }, []);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('currentChatId', currentChatId);
  }, [chats, currentChatId]);

  useEffect(() => {
    setMessages(chats[currentChatId]?.messages || []);
  }, [currentChatId]);

  useEffect(() => {
    if (chats[currentChatId]?.name) {
      let index = 0;
      const title = chats[currentChatId].name;
      setSidebarTypingTitle('');
      const typingInterval = setInterval(() => {
        setSidebarTypingTitle((prev) => prev + title[index]);
        index++;
        if (index >= title.length) clearInterval(typingInterval);
      }, 50);
      return () => clearInterval(typingInterval);
    }
  }, [currentChatId, chats]);

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const createNewChat = () => {
    const newChatId = uuidv4();
    setChats((prev) => ({
      ...prev,
      [newChatId]: { id: newChatId, name: 'Novo Chat', messages: [] }, // Corrigido para evitar "undefined"
    }));
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const deleteChat = (chatId) => {
    const updatedChats = { ...chats };
    delete updatedChats[chatId];
    setChats(updatedChats);

    if (currentChatId === chatId) {
      const remainingChatIds = Object.keys(updatedChats);
      setCurrentChatId(remainingChatIds[0] ?? createNewChat());
    }
  };

  const renameChat = (chatId, newName) => {
    setChats((prev) => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        name: newName || 'Novo Chat',
      },
    }));
  };

  const handleMenuOption = (chatId, option) => {
    if (option === 'rename') {
      setMenuOpenChatId(chatId); // Abre o modo de edição diretamente
    } else if (option === 'delete') {
      deleteChat(chatId);
    }
    setMenuOpenChatId(null); // Fecha o menu após a ação
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMenuOpenChatId(null); // Fecha o menu
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  async function generateResponse(message: string, conversationHistory: Message[]) {
    try {
      const fullContext = conversationHistory
        .map((msg) => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
        .join('\n') + `\nUsuário: ${message}`;

      const response = await fetch(import.meta.env.VITE_DIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: fullContext,
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
          result = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonString = line.replace('data: ', '').trim();
              if (jsonString && jsonString !== '[DONE]') {
                try {
                  const parsed = JSON.parse(jsonString);
                  if (parsed.answer) {
                    const plainText = parsed.answer.replace(/[*_~`>#-]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
                    for (const char of plainText) {
                      finalAnswer += char;
                      setMessages((prev) => {
                        const updatedMessages = [...prev];
                        const lastMessage = updatedMessages[updatedMessages.length - 1];
                        if (lastMessage.role === 'assistant') {
                          lastMessage.content += char;
                        }
                        return updatedMessages;
                      });
                      await new Promise((resolve) => setTimeout(resolve, 10));
                    }
                  }
                } catch (err) {
                  console.error('Erro ao processar chunk de streaming:', err);
                }
              }
            }
          }
        }
      }

      if (messages.length === 0) {
        updateChatTitle(currentChatId, message); // Atualiza o título do chat com a primeira pergunta
      }

      return finalAnswer || 'Erro ao processar a resposta.';
    } catch (error) {
      console.error('Erro ao chamar a API Dify:', error);
      throw error;
    }
  }

  const updateChatTitle = (chatId: string, userMessage: string) => {
    // Usa uma abordagem para extrair o assunto principal da pergunta
    const keywords = userMessage
      .replace(/[^\w\s]/g, '') // Remove pontuações
      .split(' ') // Divide em palavras
      .filter((word) => word.length > 2 && !['que', 'é', 'na', 'os', 'das', 'um', 'uma', 'de', 'do', 'da'].includes(word.toLowerCase())) // Remove palavras comuns
      .slice(0, 4) // Limita a 4 palavras principais
      .join(' '); // Junta as palavras principais
  
    const newTitle = keywords.charAt(0).toUpperCase() + keywords.slice(1); // Capitaliza o título
    setChats((prev) => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        name: newTitle || 'Novo Chat',
      },
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (messages.length === 0) {
      updateChatTitle(currentChatId, input); // Atualiza o título do chat com base na primeira mensagem
    }

    const aiMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const aiResponseContent = await generateResponse(input, [...messages, userMessage]);

      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = aiResponseContent;
        }
        return updatedMessages;
      });

      setChats((prev) => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: [...messages, userMessage, { ...aiMessage, content: aiResponseContent }],
        },
      }));

      scrollToBottom();
    } catch (error) {
      toast({
        title: 'Erro ao processar mensagem',
        description: 'Não foi possível obter uma resposta no momento. Tente novamente mais tarde.',
        variant: 'destructive',
      });
      console.error('Error generating response:', error);
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
      <Navbar onAuthModalToggle={onAuthModalToggle} />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto bg-cream rounded-2xl shadow-lg overflow-hidden border border-wood/10 h-[calc(100vh-150px)] flex">
          {/* Sidebar */}
          <div
            className={`bg-wood text-cream-light flex flex-col transition-all duration-300 ${
              isSidebarCollapsed ? 'w-0' : 'w-64' // Ajusta a largura para 11 quando recolhida
            }`}
          >
            <div className="relative p-4 flex justify-between items-center"> {/* Adicionada posição relativa */}
              {!isSidebarCollapsed && <h2 className="text-lg font-serif text-lg text-cream/100">Histórico</h2>} 
              <Button                                 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`absolute -right-2.5 top-10 transform -translate-y-1/2 p-2 bg-wood-light text-wood-dark rounded-full shadow-md hover:bg-wood z-10`} // Ajustado -right-2.5 e p-1.5 para mais arredondado
              >
                {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />} {/* Ícone menor */}
              </Button>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-grow overflow-y-auto">
                {Object.values(chats).map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer transition-all duration-300 ${
                      chat.id === currentChatId
                        ? 'bg-wood-light text-cream-light shadow-inner'
                        : 'hover:bg-wood-light text-cream-light'
                    } flex items-center justify-between rounded-lg mx-2 my-1`}
                    onClick={() => setCurrentChatId(chat.id)}
                    onDoubleClick={() => setMenuOpenChatId(`rename-${chat.id}`)} // Permite renomear ao clicar duas vezes
                  >
                    <div className="flex items-center space-x-2">
                      {menuOpenChatId === `rename-${chat.id}` ? (
                        <input
                          type="text"
                          value={chats[chat.id].name}
                          onChange={(e) => renameChat(chat.id, e.target.value)}
                          onBlur={() => setMenuOpenChatId(null)} // Salva ao perder o foco
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setMenuOpenChatId(null); // Salva ao pressionar Enter
                          }}
                          className="bg-transparent border-b border-cream-light text-cream-light focus:outline-none focus:border-cream w-full"
                        />
                      ) : (
                        <span className="truncate font-serif text-sm">{chat.name}</span>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenChatId(menuOpenChatId === chat.id ? null : chat.id); // Alterna o menu
                        }}
                        className="text-cream-light hover:text-cream"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpenChatId === chat.id && (
                        <div className="absolute right-0 mt-2 bg-wood-light text-cream-light rounded-lg shadow-lg z-10 w-32"> {/* Ajustado w-40 para w-32 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenChatId(null); // Fecha o menu
                              setTimeout(() => setMenuOpenChatId(`rename-${chat.id}`), 0); // Ativa o modo de edição
                            }}
                            className="flex items-center px-3 py-2 hover:bg-wood text-sm w-full rounded-t-lg" // Ajustado px-4 para px-3
                          >
                            <Edit size={16} className="mr-2" /> Renomear
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id); // Exclui o chat
                            }}
                            className="flex items-center px-3 py-2 text-red-500 hover:bg-red-700 hover:text-white text-sm w-full rounded-b-lg" // Ajustado px-4 para px-3
                          >
                            <Trash size={16} className="mr-2" /> Deletar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isSidebarCollapsed && (
              <Button
                onClick={createNewChat}
                className="m-4 bg-wood-light text-wood-dark rounded-lg hover:bg-wood transition-all duration-300"
              >
                <Plus size={16} /> Novo Chat
              </Button>
            )}
          </div>

          {/* Chat Content */}
          <div className="flex-grow flex flex-col">
          <div className="bg-wood p-4 text-cream-light flex" style={{ paddingLeft: '3rem' }}> {/* Adicionado paddingLeft para deslocar */}
          <img src="/img/episcopal_logo.png" alt="EclesIA Logo" className="h-11 mr-3" />
                <div>
                  <h2 className="font-serif text-lg text-cream">{chats[currentChatId]?.name || 'Novo Chat'}</h2>
                  <p className="text-xs text-cream/80">Assistente da Igreja Episcopal Carismática</p>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
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
                  {isLoading ? <Square size={18} /> : <Send size={18} />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;

function updateChatTitle(currentChatId: string, message: string) {
  throw new Error('Function not implemented.');
}
