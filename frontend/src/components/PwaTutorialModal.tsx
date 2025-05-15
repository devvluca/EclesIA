import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Importe as imagens anexadas
import demoPwa from '/img/demo_pwa.jpg';
import tutorial1 from '/img/tutorial_1.jpg'; // print do Safari com seta para compartilhar
import tutorial2 from '/img/tutorial_2.jpg'; // print do menu compartilhar com seta para "Adicionar à Tela de Início"
import tutorial3 from '/img/tutorial_3.jpg'; // print da tela "Adicionar à Tela de Início" com seta para "Adicionar"
import tutorial4 from '/img/tutorial_4.jpg'; // print do app instalado na home do iPhone

const tutorialScreens = [
  {
    img: demoPwa,
    title: "Baixe o app para uma experiência superior!",
    desc: "Tenha navegação mais fluida, barra inferior exclusiva e desempenho otimizado. Instale o EclesIA como aplicativo no seu celular.",
    actions: true,
  },
  {
    img: tutorial1,
    title: "Passo 1",
    desc: "No Safari, toque no ícone de compartilhamento na barra inferior.",
  },
  {
    img: tutorial2,
    title: "Passo 2",
    desc: "Role para baixo e selecione 'Adicionar à Tela de Início'.",
  },
  {
    img: tutorial3,
    title: "Passo 3",
    desc: "Toque em 'Adicionar' no canto superior direito.",
  },
  {
    img: tutorial4,
    title: "App instalado com sucesso!",
    desc: "Agora o EclesIA está disponível na tela inicial do seu iPhone.",
    success: true,
  },
];

const PwaTutorialModal: React.FC = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Mostra sempre que for Safari mobile, fora do modo standalone/PWA, nunca no desktop
    const isMobile = /iPhone|iPad|iPod|iOS/i.test(navigator.userAgent) && window.innerWidth < 900;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
      !/CriOS|FxiOS|OPiOS|mercury|GSA/i.test(navigator.userAgent);
    if (isMobile && isSafari && !isStandalone) {
      setTimeout(() => setShow(true), 400); // pequeno delay para UX
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full mx-4 p-4 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-wood-dark hover:text-wood-darkest"
          onClick={() => {
            setShow(false);
            localStorage.setItem('hidePwaTutorial', '1');
          }}
          aria-label="Fechar"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <img
            src={tutorialScreens[step].img}
            alt={tutorialScreens[step].title}
            className={`rounded-xl mb-3 object-contain`}
            style={{
              maxWidth: '100%',
              width: '320px',
              height: step === 0 ? '200px' : '320px',
            }}
          />
          <h3 className="text-lg font-bold text-wood-dark mb-1 text-center">{tutorialScreens[step].title}</h3>
          <p className="text-wood-dark/80 text-center text-sm mb-2">{tutorialScreens[step].desc}</p>
          {/* Ações do primeiro passo */}
          {tutorialScreens[step].actions && (
            <div className="flex flex-col gap-3 mt-6">
              <Button
                className="bg-wood text-cream-light font-semibold"
                onClick={() => setStep(1)}
              >
                Como instalar
              </Button>
              <Button
                variant="outline"
                className="border-wood text-wood-dark"
                onClick={() => {
                  setShow(false);
                  localStorage.setItem('hidePwaTutorial', '1');
                }}
              >
                Talvez depois
              </Button>
            </div>
          )}
          {/* Botões de navegação para os passos do tutorial */}
          {step > 0 && step < tutorialScreens.length - 1 && (
            <div className="flex justify-between w-full mt-4">
              <Button
                variant="outline"
                className="border-wood text-wood-dark"
                onClick={() => setStep((s) => s - 1)}
              >
                Voltar
              </Button>
              <Button
                className="bg-wood text-cream-light font-semibold"
                onClick={() => setStep((s) => s + 1)}
              >
                Avançar
              </Button>
            </div>
          )}
          {/* Última tela: fechar */}
          {tutorialScreens[step].success && (
            <Button
              className="bg-wood text-cream-light font-semibold mt-4"
              onClick={() => {
                setShow(false);
                localStorage.setItem('hidePwaTutorial', '1');
              }}
            >
              Fechar
            </Button>
          )}
        </div>
        {/* Indicadores de progresso */}
        <div className="flex justify-center gap-1 mt-3">
          {tutorialScreens.map((_, idx) => (
            <span
              key={idx}
              className={`inline-block w-2 h-2 rounded-full ${step === idx ? 'bg-wood' : 'bg-wood/20'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PwaTutorialModal;
