import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Chat from '@/pages/Chat';
import Bible from '@/pages/Bible';
import AboutUs from '@/pages/AboutUs';
import AuthModal from '@/components/AuthModal';
import ResetPassword from '@/pages/ResetPassword';
import Account from '@/pages/Account';
import Welcome from '@/pages/Welcome';
import InstallPrompt from '@/components/InstallPrompt';
import BottomNavBar from '@/components/BottomNavBar';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />
        <Routes>
          <Route path="/" element={<Index onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/chat" element={<Chat onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/bible" element={<Bible onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/sobre" element={<AboutUs onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
        <InstallPrompt />
        {isPWA && <BottomNavBar />}
      </Router>
    </AuthProvider>
  );
};

export default App;
