import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { BookOpen, MessageCircle, Home } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import BottomNavBar from '@/components/BottomNavBar';
import { motion } from 'framer-motion';
import NotificationPrompt from '@/components/NotificationPrompt';

// Extend the Window interface to include registerPush
declare global {
  interface Window {
    registerPush?: () => void;
  }
}

const getHeroImages = (isMobile: boolean) => [
  isMobile
    ? {
        url: '/img/banner_episcopal_mobile.jpg',
        style: {
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      }
    : {
        url: '/img/banner_episcopal.jpg',
        style: {
          backgroundSize: 'cover',
          backgroundPosition: 'center -15%',
        },
      },
  isMobile
    ? {
        url: '/img/iconografia_mobile.jpg',
        style: {
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#e7d1b2',
        },
      }
    : {
        url: '/img/iconografia.jpg',
        style: {
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#e7d1b2',
        },
      },
];

// Corrigido: animação de digitação sem piscar/repetir e com velocidade ajustada
const TypingTextRotate: React.FC<{ texts: string[]; className?: string }> = ({ texts, className }) => {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const [charIdx, setCharIdx] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Pisca o cursor
  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 500);
    return () => clearInterval(blink);
  }, []);

  // Efeito de digitação/apagamento
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const current = texts[idx];

    if (typing) {
      if (charIdx < current.length) {
        timeout = setTimeout(() => setCharIdx((c) => c + 1), 65); // Mais devagar
      } else {
        timeout = setTimeout(() => setTyping(false), 2000); // Espera antes de apagar
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => setCharIdx((c) => c - 1), 32); // Apaga devagar
      } else {
        timeout = setTimeout(() => {
          setTyping(true);
          setIdx((i) => (i + 1) % texts.length);
        }, 400); // Pequena pausa antes de digitar a próxima
      }
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [charIdx, typing, idx, texts]);

  // Atualiza texto ao trocar idx (evita bug de frase duplicada)
  useEffect(() => {
    setCharIdx(0);
    setDisplayed('');
    setTyping(true);
    // eslint-disable-next-line
  }, [idx]);

  return (
    <span className={className}>
      {displayed}
      <span className="inline-block w-2" style={{ color: 'inherit' }}>
        {showCursor ? '|' : '\u00A0'}
      </span>
    </span>
  );
};

const Index = ({ onAuthModalToggle, registerPush }) => {
  // Estados para controlar o hover de cada box
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(
    typeof Notification !== "undefined" && Notification.permission !== "granted"
  );
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);

  // Atualiza isMobile ao redimensionar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Atualiza imagens do carrossel conforme o tamanho da tela
  const heroImages = getHeroImages(isMobile);

  // Pré-carregamento dos banners do hero section
  useEffect(() => {
    setImagesLoaded(false);
    let loaded = 0;
    const imgs = heroImages.map((img) => {
      const image = new window.Image();
      image.src = img.url;
      image.onload = () => {
        loaded += 1;
        if (loaded === heroImages.length) setImagesLoaded(true);
      };
      image.onerror = () => {
        loaded += 1;
        if (loaded === heroImages.length) setImagesLoaded(true);
      };
      return image;
    });
    // Cleanup
    return () => {
      imgs.forEach((img) => { img.onload = null; img.onerror = null; });
    };
    // eslint-disable-next-line
  }, [isMobile]);

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
      offset: 40,
    });

    // Detecta modo standalone (PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);

    // Carrossel automático
    carouselInterval.current = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => {
      if (carouselInterval.current) clearInterval(carouselInterval.current);
    };
  }, [isMobile]); // reinicia carrossel ao trocar entre mobile/desktop

  const handleHeroDotClick = (idx: number) => {
    setCurrentHero(idx);
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current);
      carouselInterval.current = setInterval(() => {
        setCurrentHero((prev) => (prev + 1) % heroImages.length);
      }, 5000);
    }
  };

  if (!imagesLoaded) {
    // Não renderiza nada até as imagens carregarem
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cream-light via-cream to-cream-light">
      <Navbar onAuthModalToggle={onAuthModalToggle} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Bola flutuante central - menor e sem anel */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.95 }}
          animate={{
            opacity: 0.95,
            x: [0, 32, -32, 0],
            y: [0, -24, 24, 0],
            scale: [0.98, 1.12, 0.98],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        >
          <div
            className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full"
            style={{
              background: "radial-gradient(circle, #7c5c47 0%, #7c5c4700 80%)",
              filter: "blur(8px)",
              opacity: 0.95
            }}
            aria-hidden
          />
        </motion.div>
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700"
          style={{
            backgroundImage: `url("${heroImages[currentHero].url}")`,
            ...heroImages[currentHero].style,
          }}
        />
        <div className="absolute inset-0 bg-wood-darkest/40 z-1" />
        {/* Indicadores do carrossel */}
        <div className="absolute bottom-8 left-1/2 z-30 flex gap-2 -translate-x-1/2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Ir para imagem ${idx + 1}`}
              className={`w-3 h-3 rounded-full border border-cream transition-all duration-200
                ${currentHero === idx ? 'bg-cream' : 'bg-cream/40'}
              `}
              onClick={() => handleHeroDotClick(idx)}
              style={{ outline: 'none' }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="md:w-1/2 animate-fade-in" data-aos="fade-up">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif leading-tight text-cream drop-shadow mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="block mb-0">
                <TypingTextRotate
                  texts={[
                    "Descubra a Tradição",
                    "Pergunte, Aprenda",
                    "Sua Jornada Espiritual",
                    "Conhecimento e Fé",
                    "Inspire-se na Palavra",
                  ]}
                  className="block"
                />
              </span>
              <span className="block leading-tight -mt-2">
                com<br />
                <span className="text-cream-light">EclesIA</span>
              </span>
            </motion.h1>
            <p className="text-lg md:text-xl text-cream-light mb-8 max-w-lg">
              Tire suas dúvidas sobre a Igreja Episcopal Carismática do Brasil e interaja com a Bíblia com nossa IA especializada.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/chat">
                <Button
                  className="w-full sm:w-auto py-3 px-8 rounded-xl font-semibold bg-gradient-to-r from-wood/90 via-wood-dark/90 to-wood/80 shadow-xl group
                    hover:brightness-110 hover:shadow-2xl focus:brightness-110 focus:shadow-2xl active:brightness-95 active:shadow-lg
                    transition-all duration-200"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #7c5c47 0%, #5C3D2E 100%)',
                  }}
                  data-aos="fade-right"
                >
                  Iniciar conversa
                </Button>
              </Link>
              <Link to="/sobre">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto py-3 px-8 rounded-xl font-semibold border-cream text-wood-dark bg-gradient-to-r from-cream/80 to-cream-light/90 shadow-xl group
                    hover:bg-cream hover:text-wood-dark hover:shadow-2xl focus:bg-cream focus:text-wood-dark focus:shadow-2xl active:bg-cream-light active:shadow-lg
                    transition-all duration-200"
                  data-aos="fade-left"
                >
                  Saiba mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {showNotificationPrompt && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <NotificationPrompt
              onPermissionGranted={() => {
                setShowNotificationPrompt(false);
                if (typeof registerPush === "function") {
                  registerPush();
                }
              }}
            />
          </div>
        )}
      </section>

      {/* Features and CTA Section */}
      <section className="py-16 bg-gradient-to-b from-cream/90 via-cream-light/90 to-cream/90">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif text-wood-dark">
              Descubra Nossos Recursos
            </h2>
            <p className="text-wood-darkest/70 max-w-2xl mx-auto">
              Explore as ferramentas que preparamos para enriquecer sua jornada espiritual e seu conhecimento sobre a Igreja Episcopal Carismática.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Igreja */}
            <div
              className="bg-[#f5e8dc]/80 shadow-lg rounded-lg p-6 text-center border border-wood/10 group touch-manipulation"
              style={{
                willChange: 'transform',
                transform: hoveredBox === 0 ? 'scale(1.08)' : 'scale(1)',
                zIndex: hoveredBox === 0 ? 2 : 1,
              }}
              onMouseEnter={() => setHoveredBox(0)}
              onMouseLeave={() => setHoveredBox(null)}
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <Home className="w-12 h-12 text-wood-dark mx-auto mb-4" />
              <h3 className="text-xl font-bold text-wood-dark mb-2">Igreja</h3>
              <p className="text-wood-darkest/70 mb-4">
                Conheça mais sobre a Igreja Episcopal Carismática, sua história, missão e valores que guiam nossa fé.
              </p>
              <Link to="/sobre">
                <Button
                  className="bg-gradient-to-r from-wood/90 to-wood-dark/90 text-cream-light w-full py-2 rounded-lg shadow group
                    hover:brightness-105 hover:shadow-lg focus:brightness-105 focus:shadow-lg active:brightness-95 active:shadow
                    transition-all duration-200"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #7c5c47 0%, #5C3D2E 100%)',
                  }}
                >
                  Saiba Mais
                </Button>
              </Link>
            </div>

            {/* Chatbot IA */}
            <div
              className="bg-[#f5e8dc]/80 shadow-lg rounded-lg p-6 text-center border border-wood/10 group touch-manipulation"
              style={{
                willChange: 'transform',
                transform: hoveredBox === 1 ? 'scale(1.08)' : 'scale(1)',
                zIndex: hoveredBox === 1 ? 2 : 1,
              }}
              onMouseEnter={() => setHoveredBox(1)}
              onMouseLeave={() => setHoveredBox(null)}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <MessageCircle className="w-12 h-12 text-wood-dark mx-auto mb-4" />
              <h3 className="text-xl font-bold text-wood-dark mb-2">Chatbot IA</h3>
              <p className="text-wood-darkest/70 mb-4">
                Converse com nossa inteligência artificial para tirar dúvidas e aprender mais sobre a nossa igreja e tradições.
              </p>
              <Link to="/chat">
                <Button
                  className="bg-gradient-to-r from-wood/90 to-wood-dark/90 text-cream-light w-full py-2 rounded-lg shadow group
                    hover:brightness-105 hover:shadow-lg focus:brightness-105 focus:shadow-lg active:brightness-95 active:shadow
                    transition-all duration-200"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #7c5c47 0%, #5C3D2E 100%)',
                  }}
                >
                  Converse Agora
                </Button>
              </Link>
            </div>

            {/* Bíblia Interativa */}
            <div
              className="bg-[#f5e8dc]/80 shadow-lg rounded-lg p-6 text-center border border-wood/10 group touch-manipulation"
              style={{
                willChange: 'transform',
                transform: hoveredBox === 2 ? 'scale(1.08)' : 'scale(1)',
                zIndex: hoveredBox === 2 ? 2 : 1,
              }}
              onMouseEnter={() => setHoveredBox(2)}
              onMouseLeave={() => setHoveredBox(null)}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <BookOpen className="w-12 h-12 text-wood-dark mx-auto mb-4" />
              <h3 className="text-xl font-bold text-wood-dark mb-2">Bíblia Interativa</h3>
              <p className="text-wood-darkest/70 mb-4">
                Explore a Bíblia de forma interativa, selecione capítulos e receba explicações sobre os textos em tempo real.
              </p>
              <Link to="/bible">
                <Button
                  className="bg-gradient-to-r from-wood/90 to-wood-dark/90 text-cream-light w-full py-2 rounded-lg shadow group
                    hover:brightness-105 hover:shadow-lg focus:brightness-105 focus:shadow-lg active:brightness-95 active:shadow
                    transition-all duration-200"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #7c5c47 0%, #5C3D2E 100%)',
                  }}
                >
                  Acessar Bíblia
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-20 mb-10 max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="400">
            <h2 className="text-3xl text-wood-dark font-bold mb-6 font-serif">
              Pronto para explorar sua espiritualidade?
            </h2>
            <p className="text-wood-dark/75 max-w-2xl mx-auto mb-8">
              Inicie uma conversa com nossa IA ou explore a Bíblia interativa para aprofundar seu conhecimento e sua fé.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/chat">
                <Button
                  className="bg-gradient-to-r from-wood/90 to-wood-dark/90 text-cream-light w-full sm:w-auto px-8 py-3 rounded-xl shadow flex items-center gap-2 group
                    hover:brightness-110 hover:shadow-xl focus:brightness-110 focus:shadow-xl active:brightness-95 active:shadow
                    transition-all duration-200"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #7c5c47 0%, #5C3D2E 100%)',
                  }}
                >
                  <MessageCircle size={20} className="mb-0.5" />
                  Iniciar Conversa
                </Button>
              </Link>
              <Link to="/bible">
                <Button
                  className="bg-gradient-to-r from-cream-light/90 to-cream/80 text-wood-dark w-full sm:w-auto px-8 py-3 rounded-xl shadow flex items-center gap-2 group
                    hover:brightness-110 hover:shadow-xl focus:brightness-110 focus:shadow-xl active:brightness-95 active:shadow
                    transition-all duration-200"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #f5e8dc 0%, #f5f5f0 100%)',
                  }}
                >
                  <BookOpen size={20} className="mb-0.5" />
                  Acessar Bíblia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
