'use client';

import { useEffect, useRef, useState } from 'react';

export default function PullToRefresh() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [pulling, setPulling] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  useEffect(() => {
    if (!isStandalone) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches[0].clientY - startY.current > 80) {
        setPulling(true);
      }
    };

    const onTouchEnd = () => {
      if (pulling) {
        window.location.reload();
      }
      setPulling(false);
    };

    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isStandalone, pulling]);

  if (!isStandalone || !pulling) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: 8,
        fontSize: 13,
        color: '#4F46E5',
        background: '#fff',
        zIndex: 9998,
      }}
    >
      Release to refresh…
    </div>
  );
}