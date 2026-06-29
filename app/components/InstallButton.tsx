'use client';

import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowButton(false);
      }
      setDeferredPrompt(null);
    }
  };

  // For iOS, we can show a different message
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  if (!showButton && !isIOS) return null;

  return (
    <div className="mt-4">
      {showButton && (
        <button
          onClick={handleInstall}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <span>📲</span> Download App
        </button>
      )}
      {isIOS && (
        <p className="text-sm text-gray-600">
          Tap the share button <span className="inline-block px-1">⎔</span> and select "Add to Home Screen"
        </p>
      )}
    </div>
  );
}