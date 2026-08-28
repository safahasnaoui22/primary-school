import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '../components/SignOutButton';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_OWNER: 'School Owner',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/authentification');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          background: 'linear-gradient(90deg, #071B4A 0%, #1E3A8A 100%)',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff' }}>
          <img
            src="/logosch.png"
            alt="Logo"
            style={{ height: 40, width: 'auto' }}
            onError={(e) => {
              // Fallback if logo missing
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: 16, fontWeight: 600 }}>{session.user.name}</strong>
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              {roleLabels[session.user.role]}
            </span>
          </div>
        </Link>
        <SignOutButton />
      </header>

      <main style={{ flex: 1, padding: '24px', background: '#F8F9FC' }}>{children}</main>
    </div>
  );
}