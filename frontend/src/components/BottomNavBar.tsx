import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, User, Settings } from 'lucide-react';
import { useRef, useLayoutEffect, useState } from 'react';

export default function BottomNavBar({ isPWA }: { isPWA: boolean }) {
  const location = useLocation();
  const navItems = [
    { to: '/', label: 'Home', icon: <Home /> },
    { to: '/chat', label: 'Chat', icon: <MessageCircle /> },
    { to: '/bible', label: 'Bíblia', icon: <BookOpen /> },
    isPWA
      ? { to: '/settings', label: 'Configurações', icon: <Settings /> }
      : { to: '/conta', label: 'Conta', icon: <User /> },
  ];

  // refs para calcular posição da linha animada
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Atualiza posição da linha ao trocar de aba ou redimensionar
  useLayoutEffect(() => {
    const idx = navItems.findIndex(item => item.to === location.pathname);
    const el = itemRefs.current[idx];
    const bar = barRef.current;
    if (el && bar) {
      const barRect = bar.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - barRect.left,
        width: elRect.width,
      });
    }
  // eslint-disable-next-line
  }, [location.pathname, isPWA]);

  const handleNavClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <nav
      ref={barRef}
      className="fixed left-0 right-0 bottom-0 z-50 bg-cream-light border-t border-wood/10 flex justify-around items-start h-24 md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)' }}
    >
      {/* Linha animada marrom */}
      <div
        className="absolute top-0 left-0 h-[3px] bg-wood rounded-full transition-all duration-300"
        style={{
          width: `${indicator.width}px`,
          transform: `translateX(${indicator.left}px)`,
          transitionProperty: 'width, transform',
        }}
      />
      {navItems.map((item, idx) => (
        <Link
          key={item.to}
          to={item.to}
          ref={el => (itemRefs.current[idx] = el)}
          onClick={handleNavClick}
          className={`flex flex-col items-center justify-center text-xs font-medium transition-colors duration-150 relative
            ${location.pathname === item.to ? 'text-wood-dark' : 'text-wood-dark/60'}
          `}
          style={{ flex: 1, minWidth: 0, zIndex: 1 }}
        >
          <span className="w-7 h-7 mb-1 mt-3">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
