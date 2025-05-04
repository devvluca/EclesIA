import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast'; // Usar o hook de toast para mensagens
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // Importar ícones

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Novo campo para o nome do usuário
  const [showPassword, setShowPassword] = useState(false); // Estado para exibir/ocultar senha
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Estado para "Esqueci minha senha"
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false); // Tela de confirmação
  const { toast } = useToast(); // Hook para exibir mensagens
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({ title: 'Erro', description: 'Usuário ou senha incorretos.', variant: 'destructive' });
          } else {
            throw error;
          }
        } else {
          toast({ title: 'Sucesso', description: 'Login realizado com sucesso!', variant: 'default' });
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }, // Salvar o nome do usuário no Supabase
          },
        });
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Cadastro realizado com sucesso! Verifique seu email para confirmar.', variant: 'default' });
        onClose();
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // Redireciona para a página de redefinição de senha
      });
      if (error) throw error;
      setIsConfirmationScreen(true); // Exibe a tela de confirmação
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Redireciona para o site após o login
        },
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Autenticação realizada com sucesso!', variant: 'default' });
      onClose();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-cream rounded-lg shadow-lg p-10 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-wood">
            {isConfirmationScreen
              ? 'Solicitação enviada'
              : isForgotPassword
              ? 'Esqueci minha senha'
              : isLogin
              ? 'Login'
              : 'Cadastro'}
          </h2>
          <button onClick={onClose} className="text-wood-dark hover:text-wood text-xl">
            ✕
          </button>
        </div>
        {isConfirmationScreen ? (
          <div className="text-center space-y-4">
            <p className="text-wood-dark">
              Um email foi enviado para <strong>{email}</strong> com instruções para redefinir sua senha.
            </p>
            <Button
              onClick={() => {
                setIsConfirmationScreen(false);
                setIsForgotPassword(false);
              }}
              className="bg-wood text-cream-light hover:bg-wood-dark"
            >
              Voltar para login
            </Button>
          </div>
        ) : isForgotPassword ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }}
            className="space-y-6"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
            />
            <Button
              type="submit"
              className="w-full bg-wood text-cream-light hover:bg-wood-dark"
              disabled={loading}
            >
              Enviar email de redefinição
            </Button>
            <p
              className="text-sm text-wood-dark text-center cursor-pointer"
              onClick={() => setIsForgotPassword(false)}
            >
              Voltar para login
            </p>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailAuth();
            }}
            className="space-y-6"
          >
            {!isLogin && (
              <input
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-wood-dark"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-wood text-cream-light hover:bg-wood-dark"
              disabled={loading}
            >
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
        )}
        {!isForgotPassword && !isConfirmationScreen && (
          <div className="mt-6 text-center">
            <p
              className="text-sm text-wood-dark cursor-pointer"
              onClick={() => setIsForgotPassword(true)}
            >
              Esqueci minha senha
            </p>
          </div>
        )}
        {!isForgotPassword && !isConfirmationScreen && (
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
        )}
        {!isForgotPassword && !isConfirmationScreen && (
          <div className="mt-6 text-center">
            <p className="text-sm text-wood-dark">Ou entre com:</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                onClick={handleOAuth}
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                disabled={loading}
              >
                <FaGoogle />
                <span>Google</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
