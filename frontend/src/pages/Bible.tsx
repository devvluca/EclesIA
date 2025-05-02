import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const Bible = ({ onAuthModalToggle }) => {
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

  const API_URL = 'https://www.abibliadigital.com.br/api';
  const API_TOKEN = import.meta.env.VITE_BIBLIA_API_TOKEN; // Token da API

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

  return (
    <div className="flex flex-col min-h-screen bg-cream-light" onMouseUp={(e) => handleTextSelection(e.nativeEvent)}>
      <Navbar onAuthModalToggle={onAuthModalToggle} />
      <main className="flex-grow pt-[calc(4rem+4px)]">
        {/* Seletor de livros, capítulos e navegação */}
        <div className="bg-wood text-cream-light p-4 flex items-center justify-center relative">
          <div className="absolute left-4">
            <button
              onClick={() => {
                setShowSelector(!showSelector);
                setIsSelectingBook(true); // Começa com a seleção de livros
              }}
              className="p-2 bg-cream-light text-wood-dark rounded-lg hover:bg-wood-light"
            >
              {selectedBook ? selectedBook.name : 'Selecione um livro'}
            </button>
            {showSelector && (
              <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-6 z-10 max-h-96 overflow-y-auto w-[28rem]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-center text-wood-dark font-bold">
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
                    isSelectingBook ? 'grid-cols-3' : 'grid-cols-6'
                  } gap-3`}
                >
                  {isSelectingBook
                    ? books.map((book) => (
                        <button
                          key={book.abbrev.pt}
                          onClick={() => handleBookSelect(book)}
                          className="p-3 bg-wood text-cream-light rounded-lg hover:bg-wood-dark text-sm text-center truncate"
                          style={{ minHeight: '3rem' }}
                        >
                          {book.name}
                        </button>
                      ))
                    : chapters.map((chapter) => (
                        <button
                          key={chapter}
                          onClick={() => handleChapterSelect(chapter)}
                          className={`p-3 rounded-lg text-sm text-center ${
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
                  className="mt-4 bg-wood text-cream-light hover:bg-wood-dark w-full"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => handleChapterChange(-1)}
              disabled={selectedChapter === 1}
              className="bg-wood text-cream-light hover:bg-wood-dark"
            >
              <ChevronLeft />
            </Button>
            <h2 className="text-xl font-bold text-cream-light">
              {selectedBook?.name} - Capítulo {selectedChapter}
            </h2>
            <Button
              onClick={() => handleChapterChange(1)}
              disabled={selectedChapter === selectedBook?.chapters}
              className="bg-wood text-cream-light hover:bg-wood-dark"
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="absolute right-4 flex items-center space-x-4">
            <span className="text-sm text-cream-light">Versão: NVI</span>
            <button
              onClick={() => setIsHistoryVisible(!isHistoryVisible)}
              className="p-2 bg-cream-light text-wood-dark rounded-lg hover:bg-wood-light"
            >
              Histórico
            </button>
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-4 mb-16">
            <div className="space-y-4 text-wood-dark leading-relaxed">
              {verses.map((verse) => (
                <p key={verse.number}>
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
              top: boxPosition.y,
              left: boxPosition.x,
              width: '400px',
              minHeight: '150px',
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-wood-dark">
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
              className="w-full p-2 border border-wood-light rounded-lg resize-none"
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
              <div className="mt-4 p-2 bg-cream-light border border-wood-light rounded-lg">
                {response}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Bible;
