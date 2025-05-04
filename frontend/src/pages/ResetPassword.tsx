import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return; // Impede o envio do formulário
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Senha redefinida com sucesso!', variant: 'default' });
      navigate('/'); // Redireciona para a página inicial após redefinir a senha
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Ocorreu um erro ao redefinir a senha.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream-light">
      <div className="bg-cream rounded-lg shadow-lg p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-wood mb-6 text-center">Redefinir Senha</h2>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleResetPassword(e); // Permitir envio com Enter
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-wood-dark"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleResetPassword(e); // Permitir envio com Enter
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-wood-dark"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <Button
            type="submit"
            className="w-full bg-wood text-cream-light hover:bg-wood-dark"
            disabled={loading}
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
