import React from 'react';
import { MessageSquare, Mail, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const { user, signOut } = useAuth();

  // Tenta pegar o primeiro nome do usuário
  const fullName =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split('@')[0] ||
    'Usuário';
  const firstName = fullName.split(' ')[0];

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
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 bg-wood-dark text-cream-light rounded-lg font-medium hover:bg-wood-dark/90 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
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
    </div>
  );
}
