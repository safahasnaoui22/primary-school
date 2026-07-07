import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function SchoolsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const schools = await prisma.school.findMany({
    where: q
      ? { name: { contains: q, mode: 'insensitive' } }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      users: { where: { role: 'SCHOOL_OWNER' }, take: 1 },
      _count: { select: { users: true } },
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Schools</h1>
          <p style={{ color: '#5A6A7A' }}>{schools.length} school{schools.length !== 1 ? 's' : ''} on the platform</p>
        </div>
        <Link href="/dashboard/super-admin/schools/new" style={buttonStyle}>
          + New School
        </Link>
      </div>

      <form style={{ marginBottom: 20 }}>
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search schools by name..."
          style={inputStyle}
        />
      </form>

      <div style={{ border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>School</th>
              <th style={thStyle}>Owner</th>
              <th style={thStyle}>Members</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={5}>
                  No schools found.
                </td>
              </tr>
            )}
            {schools.map((school) => (
              <tr key={school.id}>
                <td style={tdStyle}>{school.name}</td>
                <td style={tdStyle}>{school.users[0]?.username ?? '— no owner assigned —'}</td>
                <td style={tdStyle}>{school._count.users}</td>
                <td style={tdStyle}>{school.createdAt.toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <Link href={`/dashboard/super-admin/schools/${school.id}`} style={{ color: '#FFB400', fontWeight: 600, textDecoration: 'none' }}>
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

const buttonStyle: React.CSSProperties = {
  background: '#FFB400',
  color: '#071B4A',
  padding: '8px 16px',
  borderRadius: 20,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 320,
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #CDD5DF',
  fontSize: 14,
  outline: 'none',
};