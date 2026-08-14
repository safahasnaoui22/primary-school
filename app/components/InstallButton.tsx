'use client';

import { useEffect, useState } from 'react';

interface InstallButtonProps {
  compact?: boolean;
}

export default function InstallButton({ compact = false }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [canCloseModal, setCanCloseModal] = useState(false); // guards against iOS ghost-click closing modal instantly
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration issues
    setIsMounted(true);

    // Check if already installed (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
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
      setCanCloseModal(false);
      // Ignore close attempts for 400ms after opening. iOS Safari can fire a
      // delayed synthetic click after the real tap, which lands on the overlay
      // that just appeared under the finger and closes it instantly. This
      // window absorbs that ghost click without being noticeable to the user.
      setTimeout(() => setCanCloseModal(true), 400);
    } else {
      alert('To install, use your browser\'s "Add to Home Screen" or "Install" option.');
    }
  };

  const closeModal = () => {
    if (canCloseModal) {
      setShowIOSInstructions(false);
    }
  };

  // Prevent hydration mismatch and FOUC
  if (!isMounted) {
    return (
      <button
        style={{
          visibility: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          padding: compact ? '5px 14px' : '8px 18px',
          fontSize: compact ? '11.5px' : '13px',
          border: 'none',
          borderRadius: '50px',
          whiteSpace: 'nowrap',
        }}
        aria-hidden="true"
      >
        Install App
      </button>
    );
  }

  // Don't render if already installed
  if (isInstalled) return null;

  return (
    <>
      <style jsx>{`
        .install-btn {
          position: relative;
          display: inline-flex;
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
          text-decoration: none;
          opacity: 1;
          visibility: visible;
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
          pointer-events: none;
        }
        .install-btn:hover::after {
          opacity: 1;
        }

        /* Compact version */
        .install-btn--compact {
          padding: 5px 14px;
          font-size: 11.5px;
          border-radius: 50px;
          gap: 6px;
        }
        .install-btn--compact svg {
          width: 14px;
          height: 14px;
        }

        /* iOS Modal styles */
        .ios-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .ios-modal {
          background: #fff;
          border-radius: 16px;
          max-width: 380px;
          width: 100%;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .ios-modal h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ios-modal p {
          color: #6b7280;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .ios-modal ol {
          text-align: left;
          font-size: 14px;
          color: #374151;
          padding-left: 20px;
          list-style-type: decimal;
        }
        .ios-modal ol li {
          margin-bottom: 10px;
          line-height: 1.6;
        }
        .ios-modal ol li span {
          font-weight: 600;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 4px;
          color: #4f46e5;
          white-space: nowrap;
        }
        .ios-modal .close-btn {
          width: 100%;
          margin-top: 16px;
          padding: 12px;
          background: #f3f4f6;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #374151;
        }
        .ios-modal .close-btn:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }
        .ios-modal .close-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <button
        onClick={handleInstall}
        className={`install-btn ${compact ? 'install-btn--compact' : ''}`}
        aria-label="Install App"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
          <polyline points="8 10 12 14 16 10" />
          <line x1="12" y1="14" x2="12" y2="4" />
        </svg>
        <span>{deferredPrompt ? 'Download App' : 'Install App'}</span>
      </button>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div
          className="ios-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-instructions-title"
        >
          <div className="ios-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="ios-instructions-title">
              <span role="img" aria-label="phone">📱</span>
              Add to Home Screen
            </h3>
            <p>To install this app on your iPhone or iPad, follow these simple steps:</p>
            <ol>
              <li>
                Tap the <span>Share</span> button
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    display: 'inline-block',
                    margin: '0 4px',
                    verticalAlign: 'middle',
                  }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                at the bottom of Safari.
              </li>
              <li>
                Scroll down and select <span>Add to Home Screen</span>.
              </li>
              <li>
                Tap <span>Add</span> in the top right corner to confirm.
              </li>
            </ol>
            <button className="close-btn" onClick={closeModal}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}