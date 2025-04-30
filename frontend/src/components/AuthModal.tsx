import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      {/* Ajuste para alinhar com o hero section */}
      <div className="bg-cream rounded-lg shadow-lg p-10 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-wood">
            {isLogin ? 'Login' : 'Cadastro'}
          </h2>
          <button onClick={onClose} className="text-wood-dark hover:text-wood text-xl">
            ✕
          </button>
        </div>
        <form className="space-y-6">
          {!isLogin && (
            <input
              type="text"
              placeholder="Nome"
              className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
          />
          <Button className="w-full bg-wood text-cream-light hover:bg-wood-dark">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-wood-dark">Ou entre com:</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2">
              <FaGoogle />
              <span>Google</span>
            </Button>
            <Button className="bg-blue-800 text-white hover:bg-blue-900 flex items-center space-x-2">
              <FaFacebook />
              <span>Facebook</span>
            </Button>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-wood-dark">
            {isLogin ? (
              <>
                Não tem uma conta?{' '}
                <span
                  className="text-wood font-bold cursor-pointer"
                  onClick={() => setIsLogin(false)}
                >
                  Cadastre-se
                </span>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <span
                  className="text-wood font-bold cursor-pointer"
                  onClick={() => setIsLogin(true)}
                >
                  Faça login
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
