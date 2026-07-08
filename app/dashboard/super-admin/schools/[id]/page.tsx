import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

type SchoolUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
};

type SchoolWithUsers = {
  id: string;
  name: string;
  createdAt: Date;
  users: SchoolUser[];
};

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const school = (await prisma.school.findUnique({
    where: { id },
    include: {
      users: true,
    },
  })) as unknown as SchoolWithUsers | null;

  if (!school) notFound();

  const owner = school.users.find((u: SchoolUser) => u.role === 'SCHOOL_OWNER');
  const teachers = school.users.filter((u: SchoolUser) => u.role === 'TEACHER');

  return (
    <div>
      <Link href="/dashboard/super-admin/schools" style={{ color: '#5A6A7A', fontSize: 14 }}>
        ← Back to Schools
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#071B4A', marginBottom: 4 }}>{school.name}</h1>
          <p style={{ color: '#5A6A7A' }}>Created {school.createdAt.toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Owner" value={owner ? owner.username : 'Not assigned'} />
        <StatCard label="Teachers" value={teachers.length} />
        <StatCard label="Total members" value={school.users.length} />
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#071B4A', fontSize: 18, marginBottom: 12 }}>School Owner</h2>
        {owner ? (
          <div style={cardStyle}>
            <div style={{ fontWeight: 600 }}>{owner.username}</div>
            <div style={{ color: '#5A6A7A', fontSize: 14 }}>{owner.email}</div>
          </div>
        ) : (
          <p style={{ color: '#5A6A7A' }}>No owner assigned to this school.</p>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ color: '#071B4A', fontSize: 18 }}>Teachers ({teachers.length})</h2>
        </div>
        <div style={{ border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={3}>No teachers yet.</td>
                </tr>
              )}
              {teachers.map((t: SchoolUser) => (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.username}</td>
                  <td style={tdStyle}>{t.email}</td>
                  <td style={tdStyle}>{t.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ color: '#071B4A', fontSize: 18, marginBottom: 12 }}>Danger Zone</h2>
        <div style={{ ...cardStyle, borderColor: '#F3D2D2' }}>
          <p style={{ fontSize: 14, color: '#5A6A7A', marginBottom: 12 }}>
            Deactivating a school will suspend access for its owner, teachers, and linked parents.
            Build a `/api/admin/schools/[id]/deactivate` endpoint before wiring this button.
          </p>
          <button style={dangerButtonStyle} disabled>
            Deactivate School (not wired yet)
          </button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ border: '1px solid #E5E9F0', borderRadius: 12, padding: 20, background: '#fff' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#071B4A' }}>{value}</div>
      <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #E5E9F0',
  borderRadius: 12,
  padding: 16,
  background: '#fff',
};

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

const dangerButtonStyle: React.CSSProperties = {
  background: '#fff',
  color: '#C0392B',
  border: '1px solid #C0392B',
  padding: '8px 16px',
  borderRadius: 20,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'not-allowed',
  opacity: 0.6,
};