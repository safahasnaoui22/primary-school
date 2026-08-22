'use client';

import { useEffect, useState } from 'react';

export interface ToastData {
  title: string;
  message: string;
  emoji: string;
  tone: 'success' | 'error';
}

export default function ActionToast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3600);
      const cleanup = setTimeout(onClose, 4000);
      return () => { clearTimeout(t); clearTimeout(cleanup); };
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const bg = toast.tone === 'success' ? '#EAF3DE' : '#FAECE7';
  const border = toast.tone === 'success' ? '#C7E0AE' : '#F3D2D2';
  const textColor = toast.tone === 'success' ? '#27500A' : '#712B13';

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 100,
        maxWidth: 340,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: '14px 18px',
        boxShadow: '0 12px 32px rgba(7,27,74,0.15)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity .3s ease, transform .3s ease',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{toast.emoji}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: textColor, marginBottom: 2 }}>{toast.title}</div>
        <div style={{ fontSize: 13, color: textColor, opacity: 0.85 }}>{toast.message}</div>
      </div>
    </div>
  );
}