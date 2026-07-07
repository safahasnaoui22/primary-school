import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/dashboard/super-admin', label: 'Overview' },
  { href: '/dashboard/super-admin/schools', label: 'Schools' },
  { href: '/dashboard/super-admin/users', label: 'Users' },
  { href: '/dashboard/super-admin/payments', label: 'Payments' },
  { href: '/dashboard/super-admin/reports', label: 'Reports' },
  { href: '/dashboard/super-admin/settings', label: 'Settings' },
  { href: '/dashboard/super-admin/profile', label: 'Profile' },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
      <aside
        style={{
          width: 240,
          background: '#F8F9FA',
          borderRight: '1px solid #E5E9F0',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#5A6A7A',
            textTransform: 'uppercase',
            marginBottom: 16,
            paddingLeft: 12,
          }}
        >
          Platform Admin
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                color: '#1A1A2E',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, padding: '24px 32px' }}>{children}</div>
    </div>
  );
}