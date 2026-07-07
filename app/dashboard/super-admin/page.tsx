import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function SuperAdminDashboard() {
  const session = await auth();

  const [schoolCount, ownerCount, teacherCount, parentCount, recentSchools, revenueAgg] =
    await Promise.all([
      prisma.school.count(),
      prisma.user.count({ where: { role: 'SCHOOL_OWNER' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.school.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { users: { where: { role: 'SCHOOL_OWNER' }, take: 1 } },
      }),
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
    ]);

  const totalRevenue = revenueAgg._sum.amount ?? 0;

  return (
    <div>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Platform Overview</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 24 }}>
        Welcome back, {session?.user.name}. Here's how the whole platform is doing.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard label="Schools" value={schoolCount} />
        <StatCard label="School Owners" value={ownerCount} />
        <StatCard label="Teachers" value={teacherCount} />
        <StatCard label="Parents" value={parentCount} />
        <StatCard label="Revenue Collected" value={`$${totalRevenue.toLocaleString()}`} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ color: '#071B4A', fontSize: 18 }}>Recently Added Schools</h2>
        <Link href="/dashboard/super-admin/schools/new" style={buttonStyle}>
          + New School
        </Link>
      </div>

      <div style={{ border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>School</th>
              <th style={thStyle}>Owner</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {recentSchools.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={4}>
                  No schools yet. Create the first one to get started.
                </td>
              </tr>
            )}
            {recentSchools.map((school) => (
              <tr key={school.id}>
                <td style={tdStyle}>{school.name}</td>
                <td style={tdStyle}>{school.users[0]?.username ?? '—'}</td>
                <td style={tdStyle}>{school.createdAt.toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <Link href={`/dashboard/super-admin/schools/${school.id}`} style={{ color: '#FFB400', fontWeight: 600 }}>
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/dashboard/super-admin/users/new" style={buttonStyle}>+ New User</Link>
        <Link href="/dashboard/super-admin/reports" style={buttonStyleOutline}>View Reports</Link>
        <Link href="/dashboard/super-admin/payments" style={buttonStyleOutline}>View Payments</Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        border: '1px solid #E5E9F0',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 4px 12px rgba(7,27,74,0.05)',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 700, color: '#071B4A' }}>{value}</div>
      <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>{label}</div>
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

const buttonStyleOutline: React.CSSProperties = {
  border: '2px solid #FFB400',
  color: '#071B4A',
  padding: '6px 16px',
  borderRadius: 20,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
};