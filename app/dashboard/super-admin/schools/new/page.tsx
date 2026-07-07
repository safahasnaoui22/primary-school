'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSchoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [schoolName, setSchoolName] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: ownerUsername,
          email: ownerEmail,
          password: ownerPassword,
          role: 'SCHOOL_OWNER',
          schoolName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create school');

      router.push(`/dashboard/super-admin/schools/${data.school.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <Link href="/dashboard/super-admin/schools" style={{ color: '#5A6A7A', fontSize: 14 }}>
        ← Back to Schools
      </Link>
      <h1 style={{ color: '#071B4A', marginTop: 12, marginBottom: 4 }}>New School</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 24 }}>
        Create a school and its first School Owner account in one step.
      </p>

      <form onSubmit={handleSubmit}>
        <Field label="School name">
          <input
            required
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #E5E9F0' }} />
        <p style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 12 }}>
          SCHOOL OWNER ACCOUNT
        </p>

        <Field label="Owner name">
          <input
            required
            value={ownerUsername}
            onChange={(e) => setOwnerUsername(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Owner email">
          <input
            required
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Temporary password">
          <input
            required
            type="password"
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
            style={inputStyle}
          />
        </Field>

        {error && <p style={{ color: 'red', fontSize: 14, marginTop: 8 }}>{error}</p>}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creating...' : 'Create School & Owner'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#5A6A7A', marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #CDD5DF',
  fontSize: 14,
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  background: '#FFB400',
  color: '#071B4A',
  padding: '10px 24px',
  borderRadius: 20,
  fontSize: 14,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  marginTop: 8,
};