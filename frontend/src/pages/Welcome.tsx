import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Welcome: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userName = searchParams.get('name') || 'Usuário';

  return (
    <div className="flex flex-col min-h-screen bg-cream-light">
      <Navbar onAuthModalToggle={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-wood/10">
          <div className="bg-wood text-cream-light p-6 text-center">
            <h1 className="text-3xl text-cream/100 font-bold">Seja bem-vindo, {userName}!</h1>
            <p className="text-sm text-cream/80 mt-2">
              Aproveite as funcionalidades do EclesIA.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-wood-dark">
              Explore as funcionalidades do nosso site:
            </p>
            <ul className="list-disc list-inside space-y-2 text-wood-dark">
              <li>
                <strong>Chat IA Especializado:</strong> Converse com uma inteligência artificial treinada para responder perguntas sobre a Igreja Episcopal Carismática e temas relacionados.
              </li>
              <li>
                <strong>Bíblia Interativa com IA:</strong> Pesquise passagens bíblicas e receba explicações detalhadas com a ajuda da inteligência artificial.
              </li>
            </ul>
            <p className="text-wood-dark">
              Estamos felizes em tê-lo conosco. Aproveite a experiência!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Welcome;
