import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Adicione este import
import BottomNavBar from '@/components/BottomNavBar';

const Bible = ({ onAuthModalToggle }) => {
  const { user, loading } = useAuth(); // Adicione esta linha
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(1); // Predefinido para o capítulo 1
  const [verses, setVerses] = useState([]);
  const [showSelector, setShowSelector] = useState(false); // Controle para exibir o seletor de livros/capítulos
  const [isSelectingBook, setIsSelectingBook] = useState(true); // Controle para alternar entre livros e capítulos
  const [selectedText, setSelectedText] = useState(''); // Texto selecionado pelo usuário
  const [isBoxVisible, setIsBoxVisible] = useState(false); // Controle para exibir a mini box flutuante
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0 }); // Posição da mini box
  const [input, setInput] = useState(''); // Entrada do usuário na mini box
  const [response, setResponse] = useState(''); // Resposta da IA
  const [isLoading, setIsLoading] = useState(false); // Controle de carregamento da IA
  const [history, setHistory] = useState([]); // Histórico de consultas
  const [isHistoryVisible, setIsHistoryVisible] = useState(false); // Controle para exibir a box de histórico
  const [selectedVerse, setSelectedVerse] = useState(null); // Versículo selecionado no celular
  const [isPWA, setIsPWA] = useState(false);

  const API_URL = 'https://www.abibliadigital.com.br/api';
  const API_TOKEN = import.meta.env.VITE_BIBLIA_API_TOKEN; // Token da API

  // Adicione estes estados para controlar o toque
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchMoved, setTouchMoved] = useState(false);
  // Novo: estados para swipe horizontal de capítulos
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  // Novo: estado para bloquear seleção durante swipe
  const [isSwiping, setIsSwiping] = useState(false);

  // Corrigir bug de swipe fantasma e múltiplos fetches no Safari/iOS
  // 1. Use refs para garantir que o swipe só é considerado se for realmente swipe (não scroll, não tap)
  // 2. Bloqueie múltiplos fetches concorrentes de capítulos
  // 3. Garanta que o número de versículos não seja sobrescrito por requisições antigas

  const isFetchingChapter = useRef(false);
  const lastFetchId = useRef(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${API_URL}/books`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        setBooks(response.data);

        // Predefine Gênesis 1:1 ao carregar a página
        const genesis = response.data.find((book) => book.abbrev.pt === 'gn');
        if (genesis) {
          setSelectedBook(genesis);
          setChapters(Array.from({ length: genesis.chapters }, (_, i) => i + 1));
          fetchChapter(genesis.abbrev.pt, 1);
        }
      } catch (error) {
        console.error('Erro ao carregar os livros:', error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsBoxVisible(false); // Fecha a box ao pressionar Esc
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  useEffect(() => {
    // Deselect verse and close mini box on click/tap outside
    const handleClickOutside = (e) => {
      // Se o clique não for dentro de um versículo ou da mini box, deseleciona e fecha a mini box
      if (
        !e.target.closest('.bible-verse') &&
        !e.target.closest('.mini-box-flutuante')
      ) {
        setSelectedVerse(null);
        setIsBoxVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Corrigido: fetchChapter agora usa um id para garantir que só o último resultado é considerado
  const fetchChapter = async (bookAbbrev, chapter) => {
    lastFetchId.current += 1;
    const fetchId = lastFetchId.current;
    isFetchingChapter.current = true;
    try {
      const response = await axios.get(`${API_URL}/verses/nvi/${bookAbbrev}/${chapter}`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      // Só atualiza se for o fetch mais recente
      if (fetchId === lastFetchId.current) {
        setVerses(response.data.verses);
      }
    } catch (error) {
      if (fetchId === lastFetchId.current) {
        setVerses([]); // Limpa apenas se for o fetch mais recente
      }
      console.error('Erro ao carregar os versículos:', error);
    } finally {
      if (fetchId === lastFetchId.current) {
        isFetchingChapter.current = false;
      }
    }
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setChapters(Array.from({ length: book.chapters }, (_, i) => i + 1));
    setIsSelectingBook(false); // Alterna para a seleção de capítulos
  };

  const handleChapterSelect = (chapter) => {
    // Bloqueia seleção se estiver swipando no mobile
    if (isSwiping) return;
    setSelectedChapter(chapter);
    setShowSelector(false); // Fecha o seletor
    fetchChapter(selectedBook.abbrev.pt, chapter);
  };

  // Corrigido: handleChapterChange não dispara se já está carregando
  const handleChapterChange = (direction) => {
    if (isFetchingChapter.current) return;
    if (!selectedBook || !selectedChapter) return;

    const newChapter = selectedChapter + direction;
    if (newChapter > 0 && newChapter <= selectedBook.chapters) {
      setSelectedChapter(newChapter);
      fetchChapter(selectedBook.abbrev.pt, newChapter);
      setSelectedVerse(null); // Limpa seleção ao trocar capítulo
      setIsBoxVisible(false); // Fecha a box ao trocar capítulo
    }
  };

  const handleVerseTouchStart = (event) => {
    setTouchStartY(event.touches[0].clientY);
    setTouchMoved(false);
  };

  const handleVerseTouchMove = (event) => {
    const deltaY = Math.abs(event.touches[0].clientY - touchStartY);
    if (deltaY > 10) { // 10px de tolerância para considerar scroll
      setTouchMoved(true);
    }
  };

  // Corrige bug de seleção/desseleção instantânea no mobile
  const handleVerseTouchEnd = (verse, event) => {
    if (!touchMoved) {
      // Evita que o touch dispare também o click
      event.preventDefault();
      event.stopPropagation();
      if (selectedVerse === verse.number) {
        setSelectedVerse(null);
        setIsBoxVisible(false); // Fechar mini box ao deselecionar
      } else {
        setSelectedVerse(verse.number);
        setSelectedText(verse.text);
        const rect = event.target.getBoundingClientRect();
        setBoxPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY + 16 }); // 16px abaixo
        setIsBoxVisible(true);
        setResponse('');
      }
    }
  };

  // Corrige bug de click duplicado no desktop (event bubbling)
  const handleVerseClick = (verse, e) => {
    // Evita que o click duplo (após touch) aconteça
    if (e.detail > 1) return;
    if (selectedVerse === verse.number) {
      setSelectedVerse(null);
      setIsBoxVisible(false); // Fechar mini box ao deselecionar
    } else {
      setSelectedVerse(verse.number);
      setSelectedText(verse.text);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setBoxPosition({
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 16, // 16px abaixo
      });
      setIsBoxVisible(true);
      setResponse('');
    }
  };

  // Novo: handlers para swipe horizontal (capítulos)
  // Corrigido: bloqueia swipe enquanto está carregando capítulo
  const handleMainTouchStart = (event) => {
    if (isFetchingChapter.current) return;
    if (event.touches && event.touches.length === 1) {
      setTouchStartX(event.touches[0].clientX);
      setTouchEndX(event.touches[0].clientX);
      setIsSwiping(false);
    }
  };

  const handleMainTouchMove = (event) => {
    if (isFetchingChapter.current) return;
    if (event.touches && event.touches.length === 1) {
      setTouchEndX(event.touches[0].clientX);
      // Se o movimento for significativo, considera como swipe
      if (Math.abs(event.touches[0].clientX - touchStartX) > 20) {
        setIsSwiping(true);
      }
    }
  };

  const handleMainTouchEnd = () => {
    if (isFetchingChapter.current) return;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) { // threshold para swipe
      if (diff < 0) {
        // Swipe para esquerda: próximo capítulo
        handleChapterChange(1);
      } else if (diff > 0) {
        // Swipe para direita: capítulo anterior
        handleChapterChange(-1);
      }
    }
    setTouchStartX(0);
    setTouchEndX(0);
    setTimeout(() => setIsSwiping(false), 100); // Libera seleção após swipe
  };

  const addToHistory = (verse, response) => {
    setHistory((prev) => [...prev, { verse, response }]);
  };

  const fetchExplanation = async () => {
    if (!selectedText.trim() || !input.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const response = await fetch(import.meta.env.VITE_DIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `O texto selecionado é um versículo da Bíblia: "${selectedText}". Pergunta: "${input}"`,
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
                    setResponse((prev) => prev + plainText); // Atualiza a resposta dinamicamente
                  }
                } catch (err) {
                  console.error('Erro ao processar o chunk de resposta:', err);
                }
              }
            }
          }
        }
      }

      addToHistory(selectedText, finalAnswer); // Adiciona ao histórico
    } catch (error) {
      console.error('Erro ao obter explicação:', error);
      setResponse('Erro ao obter explicação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      fetchExplanation();
    }
  };

  // Bloqueio de acesso se não estiver logado
  if (!loading && !user) {
    return (
      <div className="flex flex-col min-h-screen bg-cream-light">
        <Navbar onAuthModalToggle={onAuthModalToggle} />
        <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-16">
          <div className="bg-white border border-wood-light rounded-xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-serif text-wood-dark mb-4">Faça login para acessar a Bíblia</h2>
            <p className="mb-6 text-wood-dark">Você precisa estar autenticado para acessar esta funcionalidade.</p>
            <Button
              className="bg-wood text-cream-light hover:bg-wood-dark"
              onClick={onAuthModalToggle}
            >
              Fazer login
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-cream-light"
      onTouchStart={handleMainTouchStart}
      onTouchMove={handleMainTouchMove}
      onTouchEnd={handleMainTouchEnd}
      style={{
        backgroundImage: 'url(/img/fundo_deserto.jpg)', // ajuste o caminho conforme necessário
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Navbar onAuthModalToggle={onAuthModalToggle} />
      <main className="flex-grow pt-[calc(4rem+4px)]">
        {/* Seletor de livros, capítulos e navegação */}
        <div
          className="bg-wood text-cream-light p-4 flex flex-wrap items-center justify-center relative"
          style={{ marginTop: '-0.5rem' }} // Ajusta para sobrepor o espaço extra acima
        >
          <div className="absolute left-4 right-4 flex items-center justify-between sm:justify-start space-x-2 sm:space-x-0"> {/* Ajustado para alinhar botões */}
            <button
              onClick={() => {
                setShowSelector(!showSelector);
                setIsSelectingBook(true); // Começa com a seleção de livros
              }}
              className="p-1 rounded-xl font-semibold bg-gradient-to-r from-wood-dark/90 via-wood-dark/60 to-wood-dark/80 shadow-xl group hover:brightness-110 hover:shadow-2xl focus:brightness-110 focus:shadow-2xl active:brightness-95 active:shadow-lg transition-all duration-200 text-xs sm:text-sm sm:hidden" // Ajustado para largura menor em mobile
            >
              {selectedBook ? selectedBook.name : 'Selecione um livro'}
            </button>
            <button
              onClick={() => setIsHistoryVisible(!isHistoryVisible)}
              className="p-1 rounded-xl font-semibold bg-gradient-to-r from-wood-dark/90 via-wood-dark/60 to-wood-dark/80 shadow-xl group hover:brightness-110 hover:shadow-2xl focus:brightness-110 focus:shadow-2xl active:brightness-95 active:shadow-lg transition-all duration-200 text-xs sm:text-sm sm:hidden" // Botão "Histórico" movido para a direita no mobile
            >
              Histórico
            </button>
          </div>
          {showSelector && (
            <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-6 z-10 max-h-96 overflow-y-auto w-full sm:w-[28rem]"> {/* Responsivo para largura total em mobile */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-center text-wood-dark font-bold text-sm sm:text-base"> {/* Texto menor em telas pequenas */}
                  {isSelectingBook ? 'Selecione um Livro' : 'Selecione um Capítulo'}
                </h3>
                <button
                  onClick={() => setShowSelector(false)}
                  className="text-wood-dark hover:text-wood-darkest"
                >
                  <X size={20} />
                </button>
              </div>
              <div
                className={`grid ${
                  isSelectingBook ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-4 sm:grid-cols-6'
                } gap-3`} // Ajustado para menos colunas em telas pequenas
              >
                {isSelectingBook
                  ? books.map((book) => (
                      <button
                        key={book.abbrev.pt}
                        onClick={() => handleBookSelect(book)}
                        className="w-full sm:w-auto py-1.5 px-1 rounded-xl font-semibold bg-gradient-to-r from-wood-dark/90 via-wood-dark/90 to-wood-dark/80 shadow-xl group hover:brightness-110 hover:shadow-2xl focus:brightness-110 focus:shadow-2xl active:brightness-95 active:shadow-lg transition-all duration-200" // Texto menor em telas pequenas
                        style={{ minHeight: '3rem' }}
                      >
                        {book.name}
                      </button>
                    ))
                  : chapters.map((chapter) => (
                        <button
                          key={chapter}
                          onClick={() => handleChapterSelect(chapter)}
                          className={`w-full sm:w-auto py-1.5 px-1 rounded-xl font-semibold bg-gradient-to-r from-wood-dark/90 via-wood-dark/90 to-wood-dark/80 shadow-xl group hover:brightness-110 hover:shadow-2xl focus:brightness-110 focus:shadow-2xl active:brightness-95 active:shadow-lg transition-all duration-200 ${
                            chapter === selectedChapter
                              ? 'bg-wood-dark text-cream-light'
                              : 'bg-wood text-cream-light hover:bg-wood-dark'
                          }`}
                          style={{ minHeight: '3rem' }}
                        >
                          {chapter}
                        </button>
                      ))}
              </div>
              <Button
                onClick={() => setShowSelector(false)}
                className="mt-4 bg-wood text-cream-light font-semibold bg-gradient-to-r from-wood-dark/90 via-wood-dark/50 to-wood-dark/80 hover:bg-wood-dark w-full"
              >
                Fechar
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center space-x-4 z-20 relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleChapterChange(-1); }}
              disabled={!selectedBook || selectedChapter <= 1}
              className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-wood text-cream-light hover:bg-wood-dark sm:h-10 sm:w-10 h-6 w-6"
              style={{ padding: '0.1rem', zIndex: 30, marginLeft: '3px' }}
              tabIndex={0}
            >
              <ChevronLeft />
            </button>
            <h2
              className="text-base sm:text-xl font-bold text-cream-light text-center z-10 tracking-wide"
              style={{
                letterSpacing: '0.04em',
                textShadow: '0 2px 8px rgba(0,0,0,0.10), 0 1px 0 #fff2',
                padding: '0.25em 1em',
                borderRadius: '0.75em',
                background: 'rgba(139, 92, 42, 0.18)', // wood color, bem sutil
                boxShadow: '0 2px 8px rgba(139,92,42,0.08)',
                fontFamily: 'serif',
                fontWeight: 700,
                border: '1px solid rgba(139,92,42,0.10)',
              }}
            >
              {selectedBook?.name} - Capítulo {selectedChapter}
            </h2>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleChapterChange(1); }}
              disabled={!selectedBook || selectedChapter >= selectedBook?.chapters}
              className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-wood text-cream-light hover:bg-wood-dark sm:h-10 sm:w-10 h-6 w-6"
              style={{ padding: '0.1rem', zIndex: 30, marginRight: '3px' }}
              tabIndex={0}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="absolute left-4 right-4 flex items-center space-x-4 hidden sm:flex"> {/* Esconde "Versão: NVI" no mobile */}
            <button
              onClick={() => {
                setShowSelector(!showSelector);
                setIsSelectingBook(true); // Começa com a seleção de livros
              }}
              className="w-full sm:w-auto py-1.5 px-4 rounded-xl font-semibold bg-gradient-to-r from-wood-dark/90 via-wood-dark/90 to-wood-dark/80 shadow-xl group hover:brightness-110 hover:shadow-2xl focus:brightness-110 focus:shadow-2xl active:brightness-95 active:shadow-lg transition-all duration-200"
            >
              {selectedBook ? selectedBook.name : 'Selecione um livro'}
            </button>
            <button
              onClick={() => setIsHistoryVisible(!isHistoryVisible)}
              className="absolute right-4 w-full sm:w-auto py-1.5 px-4 rounded-xl font-semibold bg-gradient-to-r from-wood-dark/90 via-wood-dark/90 to-wood-dark/80 shadow-xl group hover:brightness-110 hover:shadow-2xl focus:brightness-110 focus:shadow-2xl active:brightness-95 active:shadow-lg transition-all duration-200"
            >
              Histórico
            </button>
          <span className="text-xs sm:text-sm text-cream-light">Versão: NVI</span>
          </div>
        </div>

        {/* Box de Histórico */}
        {isHistoryVisible && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 border border-wood-light max-w-md max-h-96 overflow-y-auto z-20">
            <h3 className="text-lg font-bold text-wood-dark mb-4">Histórico de Consultas</h3>
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li key={index} className="border-b border-wood-light pb-2">
                    <p className="text-sm text-wood-dark">
                      <strong>Versículo:</strong> {item.verse}
                    </p>
                    <p className="text-sm text-wood-dark">
                      <strong>Resposta:</strong> {item.response}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-wood-dark">Nenhuma consulta realizada ainda.</p>
            )}
            <Button
              onClick={() => setIsHistoryVisible(false)}
              className="mt-4 bg-wood text-cream-light hover:bg-wood-dark w-full"
            >
              Fechar
            </Button>
          </div>
        )}

        {/* Exibição de Versículos */}
        {verses.length > 0 && (
          <div
            className={`bg-white/80 p-4 sm:p-6 rounded-lg shadow-lg max-w-full sm:max-w-4xl mx-auto mt-4 backdrop-blur-sm select-none
              ${isPWA ? 'mb-[20rem]' : 'mb-16'}`}
          >
            <div className="space-y-4 text-wood-dark leading-relaxed text-sm sm:text-base">
              {verses.map((verse) => (
                <p
                  key={verse.number}
                  onTouchStart={handleVerseTouchStart}
                  onTouchMove={handleVerseTouchMove}
                  onTouchEnd={(e) => handleVerseTouchEnd(verse, e)}
                  onClick={(e) => handleVerseClick(verse, e)}
                  className={`bible-verse relative cursor-pointer transition-all duration-150 select-text
                    ${selectedVerse === verse.number ? 'font-bold scale-105 bg-wood/10' : ''}
                  `}
                  style={{
                    borderBottom: selectedVerse === verse.number ? '2px dashed #8B5C2A' : undefined,
                    zIndex: selectedVerse === verse.number ? 10 : undefined,
                    userSelect: 'none', // Impede seleção de texto
                  }}
                >
                  <strong>{verse.number}</strong> {verse.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Mini Box Flutuante */}
        {isBoxVisible && (
          <div
            className="mini-box-flutuante absolute z-50"
            style={{
              top: boxPosition.y,
              left: boxPosition.x,
              width: '320px', // Mais estreita para ficar mais quadrada
              maxWidth: '95vw',
              minHeight: '0px',
            }}
          >
            <div
              className="relative bg-white border border-wood-light rounded-2xl shadow-2xl pb-2 px-2 pt-2"
            >
              <div className="flex items-center justify-between mb-1 mt-0">
                {/* Versículo abreviado */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-wood-dark">
                    Pergunte sobre o versículo:
                  </span>
                  {selectedBook && selectedChapter && selectedVerse && (
                    <span className="ml-1 px-2 py-0.5 rounded bg-wood/10 text-wood-dark font-bold text-xs border border-wood-light">
                      {/* Abreviação com primeira maiúscula e segunda minúscula */}
                      {selectedBook.abbrev?.pt
                        ? selectedBook.abbrev.pt.charAt(0).toUpperCase() + selectedBook.abbrev.pt.slice(1).toLowerCase()
                        : selectedBook.abbrev
                          ? selectedBook.abbrev.charAt(0).toUpperCase() + selectedBook.abbrev.slice(1).toLowerCase()
                          : ''
                      } {selectedChapter}:{selectedVerse}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsBoxVisible(false)}
                  className="text-wood-dark hover:text-wood-darkest rounded-full p-1 transition-colors hover:bg-wood/10"
                  aria-label="Fechar"
                  style={{ marginTop: 0, marginRight: 0 }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mb-2 mt-0">
                <textarea
                  className="w-full p-2 border border-wood-light rounded-xl resize-none text-xs sm:text-sm bg-cream-light focus:outline-none focus:ring-2 focus:ring-wood/30 transition-all"
                  rows={2}
                  placeholder="Digite sua pergunta sobre o texto selecionado..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={isLoading}
                  style={{ minHeight: '36px', marginTop: '2px' }}
                />
              </div>
              <Button
                onClick={fetchExplanation}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-semibold h-8 px-3 py-1 mt-1 bg-wood text-cream-light hover:bg-wood-dark w-full shadow-md transition-all"
                disabled={isLoading || !input.trim()}
              >
                Enviar
              </Button>
              {response && (
                <div className="mt-2 p-2 bg-cream-light border border-wood-light rounded-xl text-xs sm:text-sm text-wood-dark shadow-inner transition-all">
                  {response}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
    // Não adicione Footer aqui
  );
};

export default Bible;
