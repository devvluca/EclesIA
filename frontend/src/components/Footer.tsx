import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare } from 'lucide-react'; // Importar ícones para os links de contato

const Footer = () => {
  return (
    <footer className="bg-wood-dark text-cream-light pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"> {/* Alterado para 4 colunas */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/img/episcopal_logo.png"  
                alt="EclesIA Logo" 
                className="h-10 w-10" 
                onError={(e) => (e.currentTarget.src = '/fallback-logo.png')} // Adicione um fallback
              />
              <h3 className="text-cream-light text-xl font-serif">EclesIA</h3>
            </div>
            <p className="text-cream/80 mb-4">
              Um projeto para conectar fiéis e interessados com o conhecimento teológico da Igreja Episcopal Carismática do Brasil.
            </p>
          </div>
          <div>
            <h3 className="text-cream-light text-xl mb-4 font-serif">Links úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cream/80 hover:text-cream transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/sobre" className="text-cream/80 hover:text-cream transition-colors">Sobre nós</Link>
              </li>
              <li>
                <Link to="/chat" className="text-cream/80 hover:text-cream transition-colors">Conversar com a IA</Link>
              </li>
              <li>
                <Link to="/bible" className="text-cream/80 hover:text-cream transition-colors">Bíblia</Link>
              </li>
            </ul>
          </div>
          
          {/* Nova seção para Relatar Problemas */}
          <div>
            <h3 className="text-cream-light text-xl mb-4 font-serif">Relatar um problema</h3>
            <p className="text-cream/80 mb-3">
              Encontrou um bug ou tem uma sugestão? Entre em contato:
            </p>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://wa.me/5581995167157?text=Olá,%20encontrei%20um%20problema%20no%20EclesIA:" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cream/80 hover:text-cream transition-colors flex items-center"
                >
                  <MessageSquare size={16} className="mr-2" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cream-light text-xl mb-4 font-serif">Contato</h3>
            <p className="text-cream/80 mb-2">juventude@reconciliacao.org.br</p>
          </div>
        </div>
        <div className="border-t border-cream/10 pt-6 mt-6 text-center text-cream/60 text-sm">
          &copy; {new Date().getFullYear()} Igreja Episcopal Carismática do Brasil. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
