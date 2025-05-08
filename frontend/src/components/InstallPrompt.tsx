import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detectar se o app já está instalado
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Armazenar o evento para uso posterior
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      
      // Verificamos se o usuário já dispensou a notificação antes
      const hasUserDismissed = localStorage.getItem('pwaPromptDismissed');
      
      if (!isAppInstalled && !hasUserDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    
    // Mostrar o prompt de instalação
    installPromptEvent.prompt();
    
    // Esperar pela escolha do usuário
    installPromptEvent.userChoice.then((choiceResult: {outcome: string}) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
      } else {
        console.log('Usuário recusou a instalação');
      }
      
      // Resetar o estado
      setInstallPromptEvent(null);
      setShowPrompt(false);
    });
  };

  const dismissPrompt = () => {
    // Armazenar que o usuário dispensou a notificação
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-wood-light text-cream p-4 rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-serif">Instalar EclesIA</h3>
        <button 
          onClick={dismissPrompt}
          className="text-cream-light hover:text-cream"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
      <p className="mb-3 text-sm">Instale o EclesIA em seu dispositivo para acesso rápido, mesmo offline!</p>
      <Button 
        onClick={handleInstallClick}
        className="w-full bg-wood text-cream-light hover:bg-wood-dark"
      >
        Instalar Agora
      </Button>
    </div>
  );
};

export default InstallPrompt;
