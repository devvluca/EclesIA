import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Chat from '@/pages/Chat';
import Bible from '@/pages/Bible';
import AboutUs from '@/pages/AboutUs';
import AuthModal from '@/components/AuthModal';
import ResetPassword from '@/pages/ResetPassword';
import Account from '@/pages/Account';
import Welcome from '@/pages/Welcome'; // Importar a nova página

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  return (
    <Router>
      <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />
      <Routes>
        <Route path="/" element={<Index onAuthModalToggle={toggleAuthModal} />} />
        <Route path="/chat" element={<Chat onAuthModalToggle={toggleAuthModal} />} />
        <Route path="/bible" element={<Bible onAuthModalToggle={toggleAuthModal} />} />
        <Route path="/sobre" element={<AboutUs onAuthModalToggle={toggleAuthModal} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<Account />} />
        <Route path="/welcome" element={<Welcome />} /> {/* Nova rota */}
      </Routes>
    </Router>
  );
};

export default App;
