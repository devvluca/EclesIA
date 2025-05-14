import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface NavbarProps {
  onAuthModalToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthModalToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getFormattedFirstName = (fullName?: string) => {
    if (!fullName) return 'Usuário';
    const firstName = fullName.trim().split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const toggleDropdown = () => setIsDropdownOpen((v) => !v);

  return (
    <nav className="fixed z-50 w-full px-0 group">
      <motion.div
        className={`mx-auto
          ${isScrolled
            ? "mt-2 rounded-2xl border border-wood-light bg-cream-light/80 shadow-md backdrop-blur-lg"
            : "bg-cream-light/80 backdrop-blur-sm shadow-sm"
          }`}
        initial={false}
        animate={
          isScrolled
            ? {
                maxWidth: 'calc(100vw - 90px)',
                borderRadius: 16,
                marginTop: 8,
                paddingLeft: 16,
                paddingRight: 16
              }
            : {
                maxWidth: '100vw',
                borderRadius: 0,
                marginTop: 0,
                paddingLeft: 0,
                paddingRight: 0
              }
        }
        transition={{
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ overflow: 'visible' }}
      >
        <div className="flex items-center justify-between py-3 px-4">
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
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="text-wood-dark relative flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-all duration-300"
                >
                  Olá, {getFormattedFirstName(user.user_metadata?.name)}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-wood-light rounded-lg shadow-lg z-10 w-40">
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-wood-dark hover:bg-wood-light hover:text-cream-light rounded-t-lg"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Minha conta
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-700 hover:text-white rounded-b-lg"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  onAuthModalToggle();
                  setIsMenuOpen(false);
                }}
                className="text-wood-dark relative flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-all duration-300"
              >
                <User size={20} />
              </button>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-wood-dark focus:outline-none">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.div>
      {isMenuOpen && (
        <div className="md:hidden bg-cream-light border-t border-wood/10 animate-fade-in rounded-b-2xl shadow-lg max-w-4xl mx-auto">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link to="/" className="text-wood-dark hover:text-wood px-4 py-2 rounded-md" onClick={toggleMenu}>Início</Link>
            <Link to="/sobre" className="text-wood-dark hover:text-wood px-4 py-2 rounded-md" onClick={toggleMenu}>Sobre nós</Link>
            <Link to="/chat" onClick={toggleMenu}>
              <Button className="bg-wood hover:bg-wood-dark text-cream-light w-full">Iniciar conversa</Button>
            </Link>
            <Link to="/bible" className="bg-wood hover:bg-wood-dark text-cream-light px-4 py-2 rounded-md text-center flex items-center justify-center" onClick={toggleMenu}>
              Bíblia
            </Link>
            {user ? (
              <>
                <Link to="/account" className="text-wood-dark hover:text-wood px-4 py-2 rounded-md" onClick={toggleMenu}>
                  Minha conta
                </Link>
                <Button onClick={signOut} className="bg-red-600 hover:bg-red-700 w-full">
                  Sair
                </Button>
              </>
            ) : (
              <button
                onClick={() => {
                  onAuthModalToggle();
                  setIsMenuOpen(false);
                }}
                className="text-wood-dark relative flex items-center justify-center p-2 rounded-full hover:bg-white/50 transition-all duration-300 w-full"
              >
                <User size={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
