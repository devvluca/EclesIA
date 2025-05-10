import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, User } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: <Home /> },
  { to: '/chat', label: 'Chat', icon: <MessageCircle /> },
  { to: '/bible', label: 'Bíblia', icon: <BookOpen /> },
  { to: '/account', label: 'Conta', icon: <User /> },
];

export default function BottomNavBar() {
  const location = useLocation();
  return (
    <nav className="fixed left-0 right-0 bottom-4 z-50 bg-cream-light border-t border-wood/10 flex justify-around items-center h-16 shadow-lg md:hidden rounded-xl mx-2">
      {navItems.map(item => (
        <Link
          key={item.to}
          to={item.to}
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
