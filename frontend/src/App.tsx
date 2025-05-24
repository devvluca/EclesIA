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
import Footer from '@/components/Footer';
import { AuthProvider } from './context/AuthContext';
import Settings from '@/pages/Settings';
import PwaTutorialModal from '@/components/PwaTutorialModal';
import NotificationPrompt from '@/components/NotificationPrompt';
import { supabase } from './supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; // Adicione essa variável no .env

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(Notification.permission !== 'granted');

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  const registerPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const existing = await registration.pushManager.getSubscription();
        if (!existing) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          await supabase.from('push_subscriptions').upsert({
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys,
            created_at: new Date().toISOString(),
          });
        }
        // Dispara notificação push de boas-vindas
        try {
          await fetch('https://uhzibbllczmheqroqodl.functions.supabase.co/send-push', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'reminder',
            }),
          });
        } catch (e) {
          // Silencie erros de notificação inicial
        }
      });
    }
  };

  // Função utilitária para converter VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <AuthProvider>
      <Router>
        <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />
        <PwaTutorialModal />
        <Routes>
          <Route path="/" element={<Index onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/chat" element={<Chat onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/bible" element={<Bible onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/sobre" element={<AboutUs onAuthModalToggle={toggleAuthModal} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <InstallPrompt />
        {showNotificationPrompt && (
          <NotificationPrompt
            onPermissionGranted={() => {
              setShowNotificationPrompt(false);
              registerPush();
            }}
          />
        )}
        {!isPWA && <Footer />}
        {isPWA && <BottomNavBar isPWA={isPWA} />}
      </Router>
    </AuthProvider>
  );
};

export default App;
