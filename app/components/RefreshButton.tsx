'use client';

import { useEffect, useState } from 'react';

export default function RefreshButton() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Only show this button when running as an installed PWA,
    // since regular browser tabs already have their own reload button/gesture.
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (!isStandalone) return null;

  return (
    <button
      onClick={() => window.location.reload()}
      aria-label="Refresh page"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        border: 'none',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.06)',
        cursor: 'pointer',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    </button>
  );
}