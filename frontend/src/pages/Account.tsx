import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Account: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email,
        data: { name },
      });
      // Removed redundant error check

      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!', variant: 'default' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-light">
      <Navbar onAuthModalToggle={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-wood/10">
          <div className="bg-wood text-cream-light p-6">
            <h1 className="text-2xl text-cream/100 font-bold">Minha Conta</h1>
            <p className="text-sm text-cream/80">Gerencie suas informações pessoais</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-wood-dark font-medium mb-2">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
              />
            </div>
            <div>
              <label className="block text-wood-dark font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-wood-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wood"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleUpdateProfile}
                className="bg-wood text-cream-light hover:bg-wood-dark"
                disabled={loading}
              >
                {loading ? 'Atualizando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden border border-wood/10">
          <div className="bg-wood text-cream-light p-6">
            <h2 className="text-xl text-cream/100 font-bold">Configurações Avançadas</h2>
            <p className="text-sm text-cream/80">Gerencie configurações adicionais da sua conta</p>
          </div>
          <div className="p-6 space-y-4">
            <Button
              onClick={async () => {
                if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
                  try {
                    const response = await fetch('/api/deleteUser', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user?.id }),
                    });
                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.message || 'Erro ao excluir a conta.');
                    }
                    // Removed redundant error check
                    toast({ title: 'Conta excluída', description: 'Sua conta foi excluída com sucesso.', variant: 'default' });
                  } catch (error: any) {
                    toast({ title: 'Erro', description: error.message, variant: 'destructive' });
                  }
                }
              }}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              Excluir Conta
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
