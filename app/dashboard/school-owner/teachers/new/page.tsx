'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function generatePassword() {
  return Math.random().toString(36).slice(-10) + Math.floor(Math.random() * 100);
}

export default function NewTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(generatePassword());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          role: 'TEACHER',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de la création');

      setSuccess({ email, password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=IBM+Plex+Mono:wght@500&display=swap"
        rel="stylesheet"
      />

      <Link href="/dashboard/school-owner/teachers" style={{ color: '#5A6A7A', fontSize: 14, textDecoration: 'none' }}>
        ← Retour aux enseignants
      </Link>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: '#071B4A', fontSize: 28, marginTop: 14, marginBottom: 4 }}>
        Ajouter un enseignant
      </h1>
      <p style={{ color: '#5A6A7A', fontSize: 14, marginBottom: 28 }}>
        Créez un compte enseignant. Vous devrez communiquer ces identifiants vous-même.
      </p>

      {success ? (
        <div style={{ background: '#EAF3DE', border: '1px solid #C7E0AE', borderRadius: 12, padding: 22 }}>
          <p style={{ fontWeight: 700, color: '#27500A', marginBottom: 10 }}>Compte créé avec succès</p>
          <div style={{ fontSize: 14, color: '#1A1A2E', marginBottom: 4 }}>
            <strong>Email :</strong> {success.email}
          </div>
          <div style={{ fontSize: 14, color: '#1A1A2E', marginBottom: 14 }}>
            <strong>Mot de passe temporaire :</strong>{' '}
            <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
              {success.password}
            </code>
          </div>
          <p style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 18 }}>
            ⚠️ Notez ce mot de passe maintenant — il ne sera plus affiché après avoir quitté cette page.
            Communiquez-le à l'enseignant par un canal sûr (en personne, téléphone).
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                setSuccess(null);
                setUsername('');
                setEmail('');
                setPassword(generatePassword());
              }}
              style={{ background: '#071B4A', color: '#fff', border: 'none', borderRadius: 20, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Ajouter un autre
            </button>
            <button
              onClick={() => router.push('/dashboard/school-owner/teachers')}
              style={{ background: '#fff', color: '#071B4A', border: '1px solid #071B4A', borderRadius: 20, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Voir la liste
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label="Nom complet">
            <input required value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Email">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Mot de passe temporaire">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }}
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                style={{ background: '#F0F2F5', border: 'none', borderRadius: 8, padding: '0 14px', fontSize: 12, fontWeight: 600, color: '#071B4A', cursor: 'pointer' }}
              >
                Régénérer
              </button>
            </div>
          </Field>

          {error && <p style={{ color: '#C0392B', fontSize: 14, marginBottom: 12 }}>{error}</p>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Création...' : "Créer le compte enseignant"}
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
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
  width: '100%',
  background: '#FFB400',
  color: '#071B4A',
  padding: '11px',
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  marginTop: 8,
};