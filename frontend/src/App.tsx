import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Chat from '@/pages/Chat';
import Bible from '@/pages/Bible';
import AuthModal from '@/components/AuthModal';

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  return (
    <Router>
      <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/bible" element={<Bible />} />
      </Routes>
    </Router>
  );
};

export default App;
