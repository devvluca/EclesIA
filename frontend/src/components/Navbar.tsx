import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react'; // Importado o ícone de pessoa

interface NavbarProps {
  onAuthModalToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthModalToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-cream-light/80 backdrop-blur-sm fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/img/episcopal_logo.png"  
            alt="EclesIA Logo" 
            className="h-10 w-10" 
          />
          <span className="text-wood-dark font-serif text-xl font-semibold">EclesIA</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-wood-dark hover:text-wood transition-colors">Início</Link>
          <Link to="/sobre" className="text-wood-dark hover:text-wood transition-colors">Sobre nós</Link>
          <Link to="/chat">
            <Button className="bg-wood hover:bg-wood-dark text-cream-light">Iniciar conversa</Button>
          </Link>
          <Link to="/bible">
            <Button className="bg-cream-light text-wood hover:bg-cream hover:text-wood-dark">
              Bíblia
            </Button>
          </Link>
          <button
            onClick={onAuthModalToggle}
            className="text-wood-dark relative flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-all duration-300"
          >
            <User size={20} />
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-wood-dark focus:outline-none">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-cream-light border-t border-wood/10 animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link to="/" className="text-wood-dark hover:text-wood px-4 py-2 rounded-md" onClick={toggleMenu}>Início</Link>
            <Link to="/sobre" className="text-wood-dark hover:text-wood px-4 py-2 rounded-md" onClick={toggleMenu}>Sobre nós</Link>
            <Link to="/chat" onClick={toggleMenu}>
              <Button className="bg-wood hover:bg-wood-dark text-cream-light w-full">Iniciar conversa</Button>
            </Link>
            <Link to="/bible" className="text-cream-light hover:text-cream px-4 py-2 rounded-md" onClick={toggleMenu}>
              Bíblia
            </Link>
            <button
              onClick={onAuthModalToggle}
              className="text-wood-dark relative flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-all duration-300 w-full"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
