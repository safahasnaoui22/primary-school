'use client';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{
        background: 'transparent',
        border: '1px solid #FFB400',
        color: '#FFB400',
        padding: '6px 16px',
        borderRadius: 20,
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      Sign out
    </button>
  );
}