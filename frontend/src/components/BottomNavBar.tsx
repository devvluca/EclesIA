import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, User, Settings } from 'lucide-react';

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

  const handleNavClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-50 bg-cream-light border-t border-wood/10 flex justify-around items-start h-20 shadow-lg md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)' }}
    >
      {navItems.map(item => (
        <Link
          key={item.to}
          to={item.to}
          onClick={handleNavClick}
          className={`flex flex-col items-center justify-center text-xs font-medium transition-colors duration-150 ${
            location.pathname === item.to
              ? 'text-wood-dark'
              : 'text-wood-dark/60'
          }`}
        >
          <span className="w-6 h-6 mb-1">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
