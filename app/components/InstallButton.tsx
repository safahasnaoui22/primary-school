'use client';

import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Hide button if app is already installed (running as standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the native install prompt (Android/Chrome)
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS, or when prompt isn't ready yet
      alert('To install, use your browser\'s "Add to Home Screen" or "Install" option.');
    }
  };

  if (isInstalled) return null; // Hide if already installed

  return (
    <div className="mt-4">
      <button
        onClick={handleInstall}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition flex items-center gap-2 mx-auto"
      >
        <span>📲</span> {deferredPrompt ? 'Download App' : 'Install App'}
      </button>
      {isIOS && (
        <p className="text-sm text-gray-600 mt-2">
          Tap the share button <span className="inline-block px-1">⎔</span> and select "Add to Home Screen"
        </p>
      )}
    </div>
  );
}