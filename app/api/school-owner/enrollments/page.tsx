'use client';

import { useEffect, useState, useCallback } from 'react';

interface ChildEntry {
  firstName: string;
  age: string;
  class: string;
}

interface EnrollmentRequest {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  city: string;
  street: string;
  childrenJson: ChildEntry[];
  medical: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const tabs = [
  { key: 'PENDING', label: 'En attente' },
  { key: 'APPROVED', label: 'Approuvées' },
  { key: 'REJECTED', label: 'Refusées' },
];

export default function EnrollmentsPage() {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ email: string; tempPassword: string | null } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/school-owner/enrollments?status=${filter}`);
    if (res.ok) setRequests(await res.json());
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    setBusyId(id);
    setLastResult(null);
    const res = await fetch(`/api/school-owner/enrollments/${id}/approve`, { method: 'POST' });
    const data = await res.json();
    setBusyId(null);
    if (res.ok) {
      setLastResult({ email: data.parentEmail, tempPassword: data.tempPassword });
      load();
    } else {
      alert(data.error || "Échec de l'approbation");
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Refuser cette demande d\'inscription ?')) return;
    setBusyId(id);
    const res = await fetch(`/api/school-owner/enrollments/${id}/reject`, { method: 'POST' });
    setBusyId(null);
    if (res.ok) {
      load();
    } else {
      const data = await res.json();
      alert(data.error || 'Échec du refus');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Demandes d'inscription</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 24 }}>
        Examinez et validez les inscriptions envoyées par les parents.
      </p>

      {lastResult && (
        <div style={{ background: '#EAF3DE', border: '1px solid #C7E0AE', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#27500A' }}>
          <strong>Inscription approuvée.</strong> Compte parent : {lastResult.email}
          {lastResult.tempPassword && (
            <>
              {' '}— nouveau compte créé, mot de passe temporaire :{' '}
              <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4 }}>{lastResult.tempPassword}</code>
              <br />
              <span style={{ fontSize: 12 }}>
                ⚠️ Communiquez ce mot de passe au parent manuellement (aucun service d'email n'est encore configuré). Il devra le changer après connexion.
              </span>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: '1px solid #E5E9F0',
              background: filter === t.key ? '#071B4A' : '#fff',
              color: filter === t.key ? '#fff' : '#071B4A',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {requests.length === 0 && (
        <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune demande dans cette catégorie.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {requests.map((r) => {
          const isOpen = expandedId === r.id;
          return (
            <div key={r.id} style={{ border: '1px solid #E5E9F0', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedId(isOpen ? null : r.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#071B4A', fontSize: 15 }}>{r.parentName}</div>
                  <div style={{ fontSize: 13, color: '#5A6A7A' }}>
                    {r.childrenJson.length} enfant{r.childrenJson.length > 1 ? 's' : ''} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <span style={{ color: '#FFB400', fontSize: 13, fontWeight: 600 }}>{isOpen ? 'Réduire ▲' : 'Détails ▼'}</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F0F0F0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 2 }}>Email</div>
                      <div style={{ fontSize: 14 }}>{r.parentEmail}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 2 }}>Téléphone</div>
                      <div style={{ fontSize: 14 }}>{r.parentPhone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 2 }}>Adresse</div>
                      <div style={{ fontSize: 14 }}>{r.street}, {r.city}</div>
                    </div>
                    {r.medical && (
                      <div>
                        <div style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 2 }}>Remarques médicales</div>
                        <div style={{ fontSize: 14 }}>{r.medical}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
                    Enfants
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {r.childrenJson.map((c, i) => (
                      <div key={i} style={{ fontSize: 14, background: '#FAFAFA', padding: '8px 12px', borderRadius: 8 }}>
                        {c.firstName} — {c.age} ans — {c.class}
                      </div>
                    ))}
                  </div>

                  {r.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => approve(r.id)}
                        disabled={busyId === r.id}
                        style={{ background: '#4C7C59', color: '#fff', border: 'none', borderRadius: 20, padding: '9px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                      >
                        {busyId === r.id ? 'Traitement...' : 'Approuver'}
                      </button>
                      <button
                        onClick={() => reject(r.id)}
                        disabled={busyId === r.id}
                        style={{ background: '#fff', color: '#C0392B', border: '1px solid #C0392B', borderRadius: 20, padding: '9px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}