import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function TeachersListPage() {
  const session = await auth();

  if (!session?.user.schoolId) {
    return <p style={{ padding: 24, color: '#5A6A7A' }}>Aucune école liée à votre compte.</p>;
  }

  const teachers = await prisma.user.findMany({
    where: { schoolId: session.user.schoolId, role: 'TEACHER' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&display=swap" rel="stylesheet" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: '#071B4A', fontSize: 28, margin: 0 }}>
            Enseignants
          </h1>
          <p style={{ color: '#5A6A7A', fontSize: 14, margin: '4px 0 0' }}>
            {teachers.length} enseignant{teachers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/school-owner/teachers/new"
          style={{ background: '#FFB400', color: '#071B4A', padding: '9px 18px', borderRadius: 20, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
        >
          + Ajouter un enseignant
        </Link>
      </div>

      {teachers.length === 0 ? (
        <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun enseignant pour le moment.</p>
      ) : (
        <div style={{ border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Ajouté le</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t: any) => (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.username}</td>
                  <td style={tdStyle}>{t.email}</td>
                  <td style={tdStyle}>{t.createdAt.toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 13,
  color: '#5A6A7A',
  fontWeight: 600,
  borderBottom: '1px solid #E5E9F0',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
  color: '#1A1A2E',
  borderBottom: '1px solid #F0F0F0',
};