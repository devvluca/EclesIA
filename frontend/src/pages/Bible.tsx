import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';

const Bible = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'https://www.abibliadigital.com.br/api';
  const API_VERSION = 'nvi'; // Versão da Bíblia
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
      } catch (error) {
        console.error('Erro ao carregar os livros:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setChapters(Array.from({ length: book.chapters }, (_, i) => i + 1));
    setSelectedChapter(null);
    setVerses([]);
  };

  const handleChapterSelect = async (chapter) => {
    setSelectedChapter(chapter);
    try {
      const response = await axios.get(`${API_URL}/verses/${API_VERSION}/${selectedBook.abbrev.pt}/${chapter}`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      setVerses(response.data.verses);
    } catch (error) {
      console.error('Erro ao carregar os versículos:', error);
    }
  };

  const handleTextSelection = (event) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setIsBoxVisible(true);
      setBoxPosition({ x: event.pageX, y: event.pageY });
      setResponse('');
      setConversationHistory([]); // Reset conversation history for new selection
    }
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
          query: `Texto selecionado: "${selectedText}". Pergunta: "${input}"`,
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

      // Adiciona a pergunta e resposta ao histórico de conversas
      setConversationHistory((prev) => [
        ...prev,
        { question: input, answer: finalAnswer || 'Erro ao processar a resposta.' },
      ]);
    } catch (error) {
      console.error('Erro ao obter explicação:', error);
      setResponse('Erro ao obter explicação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-light">
      <Navbar onAuthModalToggle={() => console.log('Auth modal toggled')} />
      <main
        className="flex-grow p-6 pt-24"
        onMouseUp={(e) => handleTextSelection(e.nativeEvent)}
      >
        <h1 className="text-4xl font-bold mb-6 text-center">Bíblia</h1>

        {/* Seleção de Livro */}
        <div className="mb-4">
          <select
            className="w-full p-3 border border-wood-light rounded-lg"
            onChange={(e) => {
              const book = books.find((b) => b.name === e.target.value);
              handleBookSelect(book);
            }}
          >
            <option value="">Selecione um livro</option>
            {books.map((book) => (
              <option key={book.abbrev.pt} value={book.name}>
                {book.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seleção de Capítulo */}
        {chapters.length > 0 && (
          <div className="mb-4">
            <select
              className="w-full p-3 border border-wood-light rounded-lg"
              onChange={(e) => handleChapterSelect(Number(e.target.value))}
            >
              <option value="">Selecione um capítulo</option>
              {chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  Capítulo {chapter}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Exibição de Versículos */}
        {verses.length > 0 && (
          <div className="bg-cream p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            {verses.map((verse) => (
              <p key={verse.number} className="text-lg leading-relaxed">
                <strong>{verse.number}.</strong> {verse.text}
              </p>
            ))}
          </div>
        )}

        {/* Retângulo Flutuante */}
        {isBoxVisible && (
          <div
            className="absolute bg-white shadow-lg rounded-lg p-4 border border-wood-light"
            style={{
              top: boxPosition.y,
              left: boxPosition.x,
              width: '500px', // Aumentado o comprimento
              minHeight: '100px',
            }}
            onMouseDown={(e) => e.stopPropagation()} // Evita que o clique feche o retângulo
          >
            <p className="text-sm text-wood-dark mb-2">
              <strong>Texto selecionado:</strong> {selectedText}
            </p>
            <textarea
              className="w-full p-2 border border-wood-light rounded-lg resize-none"
              rows={2}
              placeholder="Digite sua pergunta sobre o texto selecionado..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
            {conversationHistory.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-wood-dark mb-2">Histórico:</h3>
                <ul className="text-sm text-wood-dark space-y-2">
                  {conversationHistory.map((entry, index) => (
                    <li key={index}>
                      <strong>Pergunta:</strong> {entry.question}
                      <br />
                      <strong>Resposta:</strong> {entry.answer}
                    </li>
                  ))}
                </ul>
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
