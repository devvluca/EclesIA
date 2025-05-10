import { MessageSquare, Mail } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-wood-dark">Configurações</h1>
      {/* ...outras opções de configurações se houver... */}

      <div className="space-y-8">
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
