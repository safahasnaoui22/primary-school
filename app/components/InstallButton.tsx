'use client';

import { useEffect, useState } from 'react';

export default function InstallButton({ compact = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
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
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      alert('To install, use your browser\'s "Add to Home Screen" or "Install" option.');
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <style jsx>{`
        .install-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #fff;
          background: linear-gradient(135deg, #3b82f6, #4f46e5);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
          white-space: nowrap;
        }
        .install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.45);
          background: linear-gradient(135deg, #2563eb, #4338ca);
        }
        .install-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .install-btn svg {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }
        .install-btn:hover svg {
          transform: translateY(2px);
        }
        /* Glow effect */
        .install-btn::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(79, 70, 229, 0.3));
          filter: blur(12px);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .install-btn:hover::after {
          opacity: 1;
        }

        /* Compact version */
        .install-btn--compact {
          padding: 5px 14px;
          font-size: 11.5px;
          border-radius: 50px;
        }
        .install-btn--compact svg {
          width: 14px;
          height: 14px;
        }

        /* Full size version */
        .install-btn--full {
          padding: 12px 28px;
          font-size: 15px;
          border-radius: 12px;
        }
        .install-btn--full svg {
          width: 20px;
          height: 20px;
        }

        /* iOS Modal styles */
        .ios-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .ios-modal {
          background: #fff;
          border-radius: 16px;
          max-width: 380px;
          width: 100%;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .ios-modal h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .ios-modal p {
          color: #4b5563;
          margin-bottom: 16px;
        }
        .ios-modal ol {
          text-align: left;
          font-size: 14px;
          color: #374151;
          padding-left: 20px;
          list-style-type: decimal;
        }
        .ios-modal ol li {
          margin-bottom: 8px;
        }
        .ios-modal ol li span {
          font-weight: 600;
          background: #f3f4f6;
          padding: 0 6px;
          border-radius: 4px;
        }
        .ios-modal .close-btn {
          width: 100%;
          margin-top: 16px;
          padding: 10px;
          background: #e5e7eb;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ios-modal .close-btn:hover {
          background: #d1d5db;
        }
      `}</style>

      <button
        onClick={handleInstall}
        className={`install-btn ${compact ? 'install-btn--compact' : 'install-btn--full'}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
          <polyline points="8 10 12 14 16 10" />
          <line x1="12" y1="14" x2="12" y2="4" />
        </svg>
        <span>{deferredPrompt ? 'Download App' : 'Install App'}</span>
      </button>

      {/* iOS Modal */}
      {showIOSInstructions && (
        <div className="ios-modal-overlay" onClick={() => setShowIOSInstructions(false)}>
          <div className="ios-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📱 Add to Home Screen</h3>
            <p>To install this app on your iPhone, follow these steps:</p>
            <ol>
              <li>Tap the <span>Share</span> button (square with an arrow).</li>
              <li>Scroll down and select <span>Add to Home Screen</span>.</li>
              <li>Tap <span>Add</span> in the top right corner.</li>
            </ol>
            <button className="close-btn" onClick={() => setShowIOSInstructions(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}