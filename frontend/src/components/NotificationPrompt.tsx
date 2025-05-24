import React, { useState } from 'react';

interface Props {
  onPermissionGranted: () => void;
}

const NotificationPrompt: React.FC<Props> = ({ onPermissionGranted }) => {
  const [dismissed, setDismissed] = useState(false);

  if (Notification.permission === 'granted' || dismissed) return null;

  const handleAllow = async () => {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      onPermissionGranted();
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center px-2 pb-4"
      style={{
        marginBottom: 'env(safe-area-inset-bottom, 0px)',
        width: '100vw',
        maxWidth: '100vw',
      }}
    >
      <div className="bg-white border border-wood-light shadow-xl rounded-xl px-6 py-4 flex flex-col items-center gap-2 w-full max-w-md mx-auto">
        <span className="text-wood-dark font-semibold text-sm">
          Ative notificações para receber lembretes e versículos diários!
        </span>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-wood text-cream-light px-4 py-1 rounded-lg font-semibold hover:bg-wood-dark transition"
            onClick={handleAllow}
          >
            Permitir
          </button>
          <button
            className="bg-gray-200 text-wood-dark px-4 py-1 rounded-lg font-semibold hover:bg-gray-300 transition"
            onClick={() => setDismissed(true)}
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
