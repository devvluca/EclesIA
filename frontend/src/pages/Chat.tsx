import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Square, Plus, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react'; // Adicionado AlertTriangle
import { useToast } from '@/hooks/use-toast';
import ChatMessage, { Message } from '@/components/ChatMessage';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [authModalOpened, setAuthModalOpened] = useState(false);

  const [chats, setChats] = useState<Record<string, { id: string; name: string; messages: Message[]; created_at?: string }>>({});
  const [currentChatId, setCurrentChatId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Sidebar começa recolhida
  const [sidebarTypingTitle, setSidebarTypingTitle] = useState(''); // Estado para o efeito de digitação do título
  const [menuOpenChatId, setMenuOpenChatId] = useState<string | null>(null); // Controle para o menu de opções
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(true); // Começa expandido para todos
  const [isDbLoading, setIsDbLoading] = useState(true); // Estado para controlar o carregamento inicial do banco de dados
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user && !authModalOpened) {
      setAuthModalOpened(true);
      onAuthModalToggle(); // Abre o modal de autenticação se o usuário não estiver logado
    }
  }, [user, loading, onAuthModalToggle, authModalOpened]);

  useEffect(() => {
    setSuggestedQuestions(shuffleArray(allSuggestedQuestions).slice(0, 3));
  }, []);

  // Carrega os chats do usuário do Supabase quando o usuário estiver autenticado
  useEffect(() => {
    const fetchUserChats = async () => {
      if (!user) return;
      
      setIsDbLoading(true);
      
      try {
        // Busca todos os chats do usuário
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (chatsError) throw chatsError;
        
        const userChats: Record<string, { id: string; name: string; messages: Message[]; created_at?: string }> = {};
        
        // Para cada chat, busca suas mensagens
        for (const chat of chatsData || []) {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('timestamp', { ascending: true });
            
          if (messagesError) throw messagesError;
          
          userChats[chat.id] = {
            id: chat.id,
            name: chat.name,
            created_at: chat.created_at,
            messages: (messagesData || []).map(msg => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              timestamp: new Date(msg.timestamp),
            })),
          };
        }
        
        setChats(userChats);
        
        // Se tiver chats, seleciona o primeiro, senão cria um novo
        if (Object.keys(userChats).length > 0) {
          const firstChatId = Object.keys(userChats)[0];
          setCurrentChatId(firstChatId);
          setMessages(Array.isArray(userChats[firstChatId].messages) ? userChats[firstChatId].messages : []);
        } else {
          const newChatId = await createNewChat();
          setCurrentChatId(newChatId);
          setMessages([]);
        }
      } catch (error) {
        console.error('Erro ao carregar chats do Supabase:', error);
        toast({
          title: 'Erro ao carregar conversas',
          description: 'Não foi possível recuperar suas conversas anteriores.',
          variant: 'destructive',
        });
      } finally {
        setIsDbLoading(false);
      }
    };
    
    fetchUserChats();
  }, [user]);

  useEffect(() => {
    if (currentChatId && chats[currentChatId]) {
      setMessages(Array.isArray(chats[currentChatId].messages) ? chats[currentChatId].messages : []);
    }
  }, [currentChatId, chats]);

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

  const createNewChat = async () => {
    if (!user) return '';
    
    try {
      const newChatId = uuidv4();
      
      // Insere o novo chat no Supabase
      const { error } = await supabase
        .from('chats')
        .insert({
          id: newChatId,
          user_id: user.id,
          name: 'Novo Chat',
        });
        
      if (error) throw error;
      
      // Atualiza o estado local
      setChats((prev) => ({
        ...prev,
        [newChatId]: { id: newChatId, name: 'Novo Chat', messages: [] },
      }));
      
      setCurrentChatId(newChatId);
      setMessages([]);
      return newChatId;
    } catch (error) {
      console.error('Erro ao criar novo chat:', error);
      toast({
        title: 'Erro ao criar nova conversa',
        description: 'Não foi possível iniciar uma nova conversa. Tente novamente.',
        variant: 'destructive',
      });
      return '';
    }
  };

  const deleteChat = async (chatId) => {
    if (!user) return;
    
    try {
      // Primeiro exclui todas as mensagens do chat
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);
        
      if (messagesError) throw messagesError;
      
      // Depois exclui o chat
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
        
      if (chatError) throw chatError;
      
      // Atualiza o estado local
      const updatedChats = { ...chats };
      delete updatedChats[chatId];
      setChats(updatedChats);
      
      // Garantir que o `currentChatId` seja atualizado após a exclusão
      if (currentChatId === chatId) {
        const remainingChatIds = Object.keys(updatedChats);
        if (remainingChatIds.length > 0) {
          setCurrentChatId(remainingChatIds[0]);
        } else {
          const newChatId = await createNewChat();
          setCurrentChatId(newChatId);
        }
      }
    } catch (error) {
      console.error('Erro ao excluir chat:', error);
      toast({
        title: 'Erro ao excluir conversa',
        description: 'Não foi possível excluir esta conversa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const renameChat = async (chatId, newName) => {
    if (!user) return;
    
    try {
      // Atualiza o nome do chat no Supabase
      const { error } = await supabase
        .from('chats')
        .update({ name: newName || 'Novo Chat' })
        .eq('id', chatId);
        
      if (error) throw error;
      
      // Atualiza o estado local
      setChats((prev) => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          name: newName || 'Novo Chat',
        },
      }));
    } catch (error) {
      console.error('Erro ao renomear chat:', error);
      toast({
        title: 'Erro ao renomear conversa',
        description: 'Não foi possível renomear esta conversa. Tente novamente.',
        variant: 'destructive',
      });
    }
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

  async function generateResponse(message: string, conversationHistory: Message[]): Promise<string> {
    try {
      // Verifica se o histórico de conversa existe antes de mapeá-lo
      const safeHistory = (conversationHistory || []).filter(
        (msg) => msg && typeof msg.role !== 'undefined' && typeof msg.content !== 'undefined'
      );
      
      const fullContext = safeHistory
        .map((msg) => {
          // Verificação de segurança para garantir que msg e msg.role existem
          if (!msg || typeof msg.role === 'undefined') {
            return '';
          }
          return `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`;
        })
        .filter(line => line !== '') // Remove linhas vazias
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
                    finalAnswer += plainText; // Adiciona o texto completo sem duplicação
                    setMessages((prev) => {
                      const updatedMessages = [...(Array.isArray(prev) ? prev : [])];
                      const lastMessage = updatedMessages[updatedMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'assistant') {
                        lastMessage.content = finalAnswer; // Atualiza o conteúdo completo
                      }
                      return updatedMessages;
                    });
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

  const updateChatTitle = async (chatId: string, userMessage: string) => {
    if (!user) return;
    
    // Usa uma abordagem para extrair o assunto principal da pergunta
    const keywords = userMessage
      .replace(/[^\w\s]/g, '') // Remove pontuações
      .split(' ') // Divide em palavras
      .filter((word) => word.length > 2 && !['que', 'é', 'na', 'os', 'das', 'um', 'uma', 'de', 'do', 'da'].includes(word.toLowerCase())) // Remove palavras comuns
      .slice(0, 4) // Limita a 4 palavras principais
      .join(' '); // Junta as palavras principais
  
    const newTitle = keywords.charAt(0).toUpperCase() + keywords.slice(1) || 'Novo Chat'; // Capitaliza o título
    
    try {
      // Atualiza o título no Supabase
      const { error } = await supabase
        .from('chats')
        .update({ name: newTitle })
        .eq('id', chatId);
        
      if (error) throw error;
      
      // Atualiza o estado local
      setChats((prev) => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          name: newTitle,
        },
      }));
    } catch (error) {
      console.error('Erro ao atualizar título do chat:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !user) return;

    // Verifica se currentChatId é válido, se não, cria um novo chat
    if (!currentChatId) {
      const newChatId = await createNewChat();
      if (!newChatId) {
        toast({
          title: 'Erro ao criar conversa',
          description: 'Não foi possível iniciar uma nova conversa. Tente novamente.',
          variant: 'destructive',
        });
        return;
      }
      setCurrentChatId(newChatId);
    }

    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    // Garante que messages é sempre um array antes de atualizar
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), userMessage]);
    setInput('');
    setIsLoading(true);

    // Verifica se messages existe e é um array antes de verificar length
    if (!messages || messages.length === 0) {
      await updateChatTitle(currentChatId, input);
    }

    const aiMessageId = uuidv4();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    
    // Garante que messages é sempre um array antes de atualizar
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), aiMessage]);

    try {
      // Salva a mensagem do usuário no Supabase
      const { error: userMsgError } = await supabase
        .from('messages')
        .insert({
          id: userMessageId,
          chat_id: currentChatId,
          content: input,
          role: 'user',
          timestamp: new Date().toISOString(),
        });
        
      if (userMsgError) throw userMsgError;
      
      // Certifica-se de que messages é um array válido antes de passá-lo
      const safeMessages = Array.isArray(messages) ? messages : [];
      
      // Gera a resposta do assistente
      const aiResponseContent = await generateResponse(input, [...safeMessages, userMessage]);

      // Atualiza o estado local com a resposta do assistente
      setMessages((prev) => {
        const updatedMessages = [...(Array.isArray(prev) ? prev : [])];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = aiResponseContent;
        }
        return updatedMessages;
      });

      // Salva a resposta do assistente no Supabase
      const { error: aiMsgError } = await supabase
        .from('messages')
        .insert({
          id: aiMessageId,
          chat_id: currentChatId,
          content: aiResponseContent,
          role: 'assistant',
          timestamp: new Date().toISOString(),
        });
        
      if (aiMsgError) throw aiMsgError;
      
      // Atualiza o estado local dos chats
      setChats((prev) => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: [...(Array.isArray(messages) ? messages : []), userMessage, { ...aiMessage, content: aiResponseContent }],
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

  const deleteAllChats = async () => {
    if (!user) return;
    
    if (window.confirm('Tem certeza que deseja apagar todos os chats?')) {
      try {
        // Primeiro exclui todas as mensagens dos chats do usuário
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .in('chat_id', Object.keys(chats));
          
        if (messagesError) throw messagesError;
        
        // Depois exclui todos os chats do usuário
        const { error: chatsError } = await supabase
          .from('chats')
          .delete()
          .eq('user_id', user.id);
          
        if (chatsError) throw chatsError;
        
        // Atualiza o estado local
        setChats({});
        // Cria um novo chat vazio após apagar todos
        const newChatId = await createNewChat();
        setCurrentChatId(newChatId);
      } catch (error) {
        console.error('Erro ao excluir todos os chats:', error);
        toast({
          title: 'Erro ao excluir conversas',
          description: 'Não foi possível excluir todas as conversas. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  // Adiciona uma função para limpar o localStorage se necessário
  const clearLocalStorage = () => {
    // Remove qualquer dado antigo do localStorage que possa estar causando conflitos
    localStorage.removeItem('currentChatId');
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.startsWith('chats_')) {
        localStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // Tentar limpar o localStorage ao iniciar para garantir uma experiência limpa
    clearLocalStorage();
  }, []);

  // Bloqueio de acesso se não estiver logado
  if (!loading && !user) {
    return (
      <div className="flex flex-col min-h-screen bg-cream-light">
        <Navbar onAuthModalToggle={onAuthModalToggle} />
        <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-16">
          <div className="bg-white border border-wood-light rounded-xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-serif text-wood-dark mb-4">Faça login para acessar o chat</h2>
            <p className="mb-6 text-wood-dark">Você precisa estar autenticado para conversar com o assistente.</p>
            <Button
              className="bg-wood text-cream-light hover:bg-wood-dark"
              onClick={() => {
                setAuthModalOpened(true);
                onAuthModalToggle();
              }}
            >
              Fazer login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Exibe um indicador de carregamento enquanto busca dados do banco
  if (isDbLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-cream-light">
        <Navbar onAuthModalToggle={onAuthModalToggle} />
        <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-16">
          <div className="bg-white border border-wood-light rounded-xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-serif text-wood-dark mb-4">Carregando suas conversas</h2>
            <p className="mb-6 text-wood-dark">Estamos buscando os seus chats anteriores...</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-wood-light border-t-wood rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Adiciona variáveis para agrupar chats por período
  const groupChatsByTime = (chats: Record<string, { id: string; name: string; messages: Message[]; created_at?: string }>) => {
    // Verifica se chats é um objeto vazio antes de continuar
    if (!chats || Object.keys(chats).length === 0) {
      return {
        today: [],
        week: [],
        month: [],
        older: [],
        aboutToDelete: []
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const fortyFiveDaysAgo = new Date(today);
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
    
    const groups = {
      today: [] as Array<{ id: string; name: string; messages: Message[]; created_at?: string }>,
      week: [] as Array<{ id: string; name: string; messages: Message[]; created_at?: string }>,
      month: [] as Array<{ id: string; name: string; messages: Message[]; created_at?: string }>,
      older: [] as Array<{ id: string; name: string; messages: Message[]; created_at?: string }>,
      aboutToDelete: [] as Array<{ id: string; name: string; messages: Message[]; created_at?: string }>,
    };
    
    Object.values(chats).forEach(chat => {
      const chatDate = chat.created_at ? new Date(chat.created_at) : new Date();
      
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        groups.week.push(chat);
      } else if (chatDate >= thirtyDaysAgo) {
        groups.month.push(chat);
      } else if (chatDate >= fortyFiveDaysAgo) {
        groups.older.push(chat);
      } else {
        groups.aboutToDelete.push(chat);
      }
    });
    
    return groups;
  };

  // Função para calcular dias restantes antes da exclusão
  const getDaysBeforeDeletion = (createdDate: string): number => {
    if (!createdDate) return 50; // Retorna um valor padrão se não houver data
    
    const today = new Date();
    const created = new Date(createdDate);
    const diff = today.getTime() - created.getTime();
    const diffDays = Math.floor(diff / (1000 * 3600 * 24));
    return 50 - diffDays; // 50 dias antes da exclusão automática
  };

  // Renderiza o sidebar com as seções de tempo
  const renderChatSidebar = () => {
    if (isSidebarCollapsed) return null;

    try {
      const chatGroups = groupChatsByTime(chats);
      
      return (
        <>
          <div className="flex-grow overflow-y-auto px-2">
            {chatGroups.today.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs text-cream-light/70 font-semibold px-2 mb-1">Hoje</h3>
                {chatGroups.today.map((chat) => renderChatItem(chat))}
              </div>
            )}
            
            {chatGroups.week.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs text-cream-light/70 font-semibold px-2 mb-1">7 Dias Anteriores</h3>
                {chatGroups.week.map((chat) => renderChatItem(chat))}
              </div>
            )}
            
            {chatGroups.month.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs text-cream-light/70 font-semibold px-2 mb-1">30 Dias Anteriores</h3>
                {chatGroups.month.map((chat) => renderChatItem(chat))}
              </div>
            )}
            
            {chatGroups.older.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs text-cream-light/70 font-semibold px-2 mb-1">Mais de 30 Dias</h3>
                {chatGroups.older.map((chat) => renderChatItem(chat))}
              </div>
            )}
            
            {chatGroups.aboutToDelete.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs text-red-400 font-semibold px-2 mb-1 flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  Serão excluídos em breve
                </h3>
                {chatGroups.aboutToDelete.map((chat) => renderChatItem(chat, true))}
              </div>
            )}
          </div>
          
          <div className="m-4">
            <Button
              onClick={createNewChat}
              className="w-full bg-wood-light text-wood-dark rounded-lg hover:bg-wood transition-all duration-300 mb-2"
            >
              <Plus size={16} /> Novo Chat
            </Button>
            <Button
              onClick={deleteAllChats}
              className="w-full bg-red-500 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
            >
              <Trash size={16} /> Apagar Todos
            </Button>
          </div>
        </>
      );
    } catch (error) {
      console.error("Erro ao renderizar sidebar:", error);
      return (
        <div className="flex-grow overflow-y-auto px-2 py-4">
          <p className="text-xs text-cream-light/80 px-2">Nenhuma conversa encontrada.</p>
          <div className="m-4">
            <Button
              onClick={createNewChat}
              className="w-full bg-wood-light text-wood-dark rounded-lg hover:bg-wood transition-all duration-300 mb-2"
            >
              <Plus size={16} /> Novo Chat
            </Button>
          </div>
        </div>
      );
    }
  };

  // Renderiza um item de chat individual
  const renderChatItem = (chat: { id: string; name: string; messages: Message[]; created_at?: string }, isAboutToDelete = false) => {
    const days = chat.created_at ? getDaysBeforeDeletion(chat.created_at) : null;
    
    return (
      <div
        key={chat.id}
        className={`py-3 px-3 cursor-pointer transition-all duration-300 ${
          chat.id === currentChatId
            ? 'bg-wood-light text-cream-light shadow-inner'
            : 'hover:bg-wood-light text-cream-light'
        } flex items-center justify-between rounded-lg my-1 ${isAboutToDelete ? 'border border-red-400/40' : ''}`}
        onClick={() => setCurrentChatId(chat.id)}
        onDoubleClick={() => setMenuOpenChatId(`rename-${chat.id}`)}
      >
        <div className="flex flex-col w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="truncate flex-1">
              {menuOpenChatId === `rename-${chat.id}` ? (
                <input
                  type="text"
                  value={chats[chat.id]?.name || ''}
                  onChange={(e) => renameChat(chat.id, e.target.value)}
                  onBlur={() => setMenuOpenChatId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setMenuOpenChatId(null);
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
                  setMenuOpenChatId(menuOpenChatId === chat.id ? null : chat.id);
                }}
                className="text-cream-light hover:text-cream ml-2"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpenChatId === chat.id && (
                <div className="absolute right-0 mt-2 bg-wood-light text-cream-light rounded-lg shadow-lg z-10 w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenChatId(null);
                      setTimeout(() => setMenuOpenChatId(`rename-${chat.id}`), 0);
                    }}
                    className="flex items-center px-3 py-2 hover:bg-wood text-sm w-full rounded-t-lg"
                  >
                    <Edit size={16} className="mr-2" /> Renomear
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="flex items-center px-3 py-2 text-red-500 hover:bg-red-700 hover:text-white text-sm w-full rounded-b-lg"
                  >
                    <Trash size={16} className="mr-2" /> Deletar
                  </button>
                </div>
              )}
            </div>
          </div>
          {isAboutToDelete && days !== null && (
            <span className="text-xs text-red-400 mt-1">
              Será excluído em {days} {days === 1 ? 'dia' : 'dias'}
            </span>
          )}
        </div>
      </div>
    );
  };

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
            {renderChatSidebar()}
          </div>

          {/* Chat Content */}
          <div className="flex-grow flex flex-col">
            <div className="bg-wood p-4 text-cream-light flex items-center" style={{ paddingLeft: '3rem' }}>
              <img src="/img/episcopal_logo.png" alt="EclesIA Logo" className="h-11 mr-3" />
              <div>
                <h2 className="font-serif text-lg text-cream">
                  {chats[currentChatId]?.name || 'Novo Chat'}
                </h2>
                <p className="text-xs text-cream/80">Assistente da Igreja Episcopal Carismática</p>
              </div>
            </div>

            {/* Revertendo para o estilo original da área de mensagens */}
            <div className="flex-grow overflow-y-auto p-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Revertendo para o padding original das sugestões */}
            <div className={`p-4 ${!isSuggestionsVisible ? 'bg-transparent' : 'bg-cream-light'}`}>
              <button
                type="button"
                onClick={() => setIsSuggestionsVisible((v) => !v)}
                className={`flex items-center gap-2 font-medium border-none outline-none focus:outline-none mb-2 transition-colors
                  ${isSuggestionsVisible
                    ? 'text-wood-dark bg-transparent'
                    : 'text-wood-dark bg-transparent w-full justify-start'}
                `}
                style={{ padding: 0 }}
              >
                {isSuggestionsVisible ? (
                  <>
                    <ChevronDown size={20} />
                    <span className="text-sm select-none">Ocultar</span>
                  </>
                ) : (
                  <>
                    <ChevronUp size={20} />
                    <span className="text-sm select-none">Expandir</span>
                  </>
                )}
              </button>
              {isSuggestionsVisible && (
                <div className="mt-1 max-h-32 overflow-y-auto">
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
              )}
            </div>

            {/* Revertendo para o padding original do formulário */}
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