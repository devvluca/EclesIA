import React, { useState } from 'react';
import { MessageSquare, Mail, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabaseClient';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  // Tenta pegar o primeiro nome do usuário
  const fullName =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split('@')[0] ||
    'Usuário';
  const firstName = fullName.split(' ')[0];

  // Função para alterar email
  const handleChangeEmail = async () => {
    setEmailLoading(true);
    setEmailMsg('');
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      setEmailMsg('Erro ao atualizar email: ' + error.message);
    } else {
      setEmailMsg('Email atualizado! Verifique sua caixa de entrada para confirmar.');
    }
    setEmailLoading(false);
  };

  // Função para deletar conta
  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;
    try {
      // Se você tiver uma API para deletar o usuário, chame aqui.
      // Exemplo: await fetch('/api/deleteUser', { method: 'POST', body: JSON.stringify({ userId: user?.id }) });
      const { error } = await supabase.rpc('delete_user'); // ou seu método de deleção
      if (error) throw error;
      alert('Conta excluída com sucesso.');
      signOut();
    } catch (error: any) {
      alert('Erro ao excluir a conta: ' + (error.message || error));
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      {/* Header do usuário */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-wood-dark flex items-center justify-center mb-3 overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-cream-light" />
          )}
        </div>
        <div className="text-xl font-bold text-wood-dark mb-1">{firstName}</div>
        <div className="text-wood-dark/70 text-sm mb-3">{user?.email}</div>
        {user ? (
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-wood-dark text-cream-light rounded-lg font-medium hover:bg-wood-dark/90 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        ) : (
          <a
            href="/chat"
            className="flex items-center gap-2 px-4 py-2 bg-wood-dark text-cream-light rounded-lg font-medium hover:bg-wood-dark/90 transition-colors"
          >
            <User size={18} />
            Fazer login
          </a>
        )}
      </div>

      {/* Alterar email */}
      <div className="mb-8">
        <h3 className="text-wood-dark text-lg font-semibold mb-2">Alterar Email</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 p-2 border border-wood-light rounded-lg"
            placeholder="Novo email"
          />
          <button
            onClick={handleChangeEmail}
            disabled={emailLoading}
            className="bg-wood-dark text-cream-light px-4 py-2 rounded-lg font-medium hover:bg-wood-dark/90 transition-colors"
          >
            {emailLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        {emailMsg && <div className="text-xs mt-2 text-wood-dark">{emailMsg}</div>}
      </div>

      <div className="space-y-8">
        {/* Relatar um problema */}
        <div>
          <h3 className="text-cream-light text-xl mb-4 font-serif bg-wood-dark px-4 py-2 rounded-t-lg">Relatar um problema</h3>
          <div className="bg-[#f5e8dc]/80 rounded-b-lg px-4 py-4">
            <p className="text-wood-dark/80 mb-3">
              Encontrou um bug ou tem uma sugestão? <br /> Entre em contato:
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/5581995167157?text=Olá,%20encontrei%20um%20problema%20no%20EclesIA:"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wood-dark/80 hover:text-wood-dark transition-colors flex items-center"
                >
                  <MessageSquare size={16} className="mr-2" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-cream-light text-xl mb-4 font-serif bg-wood-dark px-4 py-2 rounded-t-lg">Contato</h3>
          <div className="bg-[#f5e8dc]/80 rounded-b-lg px-4 py-4">
            <p className="text-wood-dark/80 mb-2">juventude@reconciliacao.org.br</p>
            <a
              href="mailto:juventude@reconciliacao.org.br"
              className="flex items-center text-wood-dark/80 hover:text-wood-dark transition-colors"
            >
              <Mail size={16} className="mr-2" />
              Enviar email
            </a>
          </div>
        </div>
      </div>
      {/* Deletar conta */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Deletar minha conta
        </button>
      </div>
    </div>
  );
}
