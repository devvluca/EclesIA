import React, { useState, useEffect } from 'react';
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

  const fetchChapter = async (bookAbbrev, chapter) => {
    try {
      const response = await axios.get(`${API_URL}/verses/nvi/${bookAbbrev}/${chapter}`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      setVerses(response.data.verses);
    } catch (error) {
      console.error('Erro ao carregar os versículos:', error);
    }
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setChapters(Array.from({ length: book.chapters }, (_, i) => i + 1));
    setIsSelectingBook(false); // Alterna para a seleção de capítulos
  };

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setShowSelector(false); // Fecha o seletor
    fetchChapter(selectedBook.abbrev.pt, chapter);
  };

  const handleChapterChange = (direction) => {
    if (!selectedBook || !selectedChapter) return;

    const newChapter = selectedChapter + direction;
    if (newChapter > 0 && newChapter <= selectedBook.chapters) {
      setSelectedChapter(newChapter);
      fetchChapter(selectedBook.abbrev.pt, newChapter);
    }
  };

  const handleTextSelection = (event) => {
    const selection = window.getSelection();
    const selectedElement = event.target.closest('.space-y-4.text-wood-dark.leading-relaxed'); // Verifica se o elemento pertence à div específica

    if (selection && selection.toString().trim() && selectedElement) {
      setSelectedText(selection.toString());
      setIsBoxVisible(true);
      setBoxPosition({ x: event.pageX, y: event.pageY });
      setResponse('');
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

  const handleVerseTouchEnd = (verse, event) => {
    if (!touchMoved) {
      setSelectedVerse(verse.number);
      setSelectedText(verse.text);
      const rect = event.target.getBoundingClientRect();
      setBoxPosition({ x: rect.left, y: rect.bottom + window.scrollY });
      setIsBoxVisible(true);
      setResponse('');
    }
  };

  // Novo: handlers para swipe horizontal (capítulos)
  const handleMainTouchStart = (event) => {
    if (event.touches && event.touches.length === 1) {
      setTouchStartX(event.touches[0].clientX);
      setTouchEndX(event.touches[0].clientX);
    }
  };

  const handleMainTouchMove = (event) => {
    if (event.touches && event.touches.length === 1) {
      setTouchEndX(event.touches[0].clientX);
    }
  };

  const handleMainTouchEnd = () => {
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
      onMouseUp={(e) => handleTextSelection(e.nativeEvent)}
      onTouchStart={handleMainTouchStart}
      onTouchMove={handleMainTouchMove}
      onTouchEnd={handleMainTouchEnd}
    >
      <Navbar onAuthModalToggle={onAuthModalToggle} />
      <main className="flex-grow pt-[calc(4rem+4px)]">
        {/* Seletor de livros, capítulos e navegação */}
        <div className="bg-wood text-cream-light p-4 flex flex-wrap items-center justify-center relative"> {/* Adicionado flex-wrap para melhor responsividade */}
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

          <div className="flex items-center justify-center space-x-4"> {/* Adicionado items-center para alinhamento vertical */}
            <button
              type="button"
              onClick={() => handleChapterChange(-1)} // Retrocede capítulos
              disabled={!selectedBook || selectedChapter <= 1} // Desabilita apenas no primeiro capítulo
              className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-10 bg-wood text-cream-light hover:bg-wood-dark"
              style={{ padding: '0.5rem' }} // Ajustado padding para manter a área clicável sem deslocar o botão
            >
              <ChevronLeft />
            </button>
            <h2 className="text-base sm:text-xl font-bold text-cream-light text-center">
              {selectedBook?.name} - Capítulo {selectedChapter}
            </h2>
            <button
              type="button"
              onClick={() => handleChapterChange(1)} // Avança capítulos
              disabled={!selectedBook || selectedChapter >= selectedBook?.chapters} // Desabilita apenas no último capítulo
              className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-10 bg-wood text-cream-light hover:bg-wood-dark"
              style={{ padding: '0.5rem' }} // Ajustado padding para manter a área clicável sem deslocar o botão
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
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-full sm:max-w-4xl mx-auto mt-4 mb-16"> {/* Ajustado para largura total em mobile */}
            <div className="space-y-4 text-wood-dark leading-relaxed text-sm sm:text-base"> {/* Texto menor em telas pequenas */}
              {verses.map((verse) => (
                <p
                  key={verse.number}
                  onTouchStart={handleVerseTouchStart}
                  onTouchMove={handleVerseTouchMove}
                  onTouchEnd={(e) => handleVerseTouchEnd(verse, e)}
                  className={`relative ${
                    selectedVerse === verse.number ? 'border-dashed border-b-2 border-wood-dark' : ''
                  }`}
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
            className="absolute bg-white shadow-lg rounded-lg p-4 border border-wood-light"
            style={{
              top: boxPosition.y, // Usa a posição calculada
              left: boxPosition.x, // Usa a posição calculada
              width: '90%', // Ajustado para largura total em mobile
              maxWidth: '400px',
              minHeight: '150px',
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs sm:text-sm text-wood-dark"> {/* Texto menor em telas pequenas */}
                <strong>Texto selecionado:</strong> {selectedText}
              </p>
              <button
                onClick={() => setIsBoxVisible(false)}
                className="text-wood-dark hover:text-wood-darkest"
              >
                <X size={16} />
              </button>
            </div>
            <textarea
              className="w-full p-2 border border-wood-light rounded-lg resize-none text-xs sm:text-sm" // Texto menor em telas pequenas
              rows={2}
              placeholder="Digite sua pergunta sobre o texto selecionado..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isLoading}
            />
            <Button
              onClick={fetchExplanation}
              className="mt-2 bg-wood text-cream-light hover:bg-wood-dark w-full"
              disabled={isLoading || !input.trim()}
            >
              Enviar
            </Button>
            {response && (
              <div className="mt-4 p-2 bg-cream-light border border-wood-light rounded-lg text-xs sm:text-sm"> {/* Texto menor em telas pequenas */}
                {response}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
    // Não adicione Footer aqui
  );
};

export default Bible;
