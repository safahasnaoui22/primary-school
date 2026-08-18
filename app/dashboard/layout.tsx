import { auth } from '@/auth';
import { redirect } from 'next/navigation';
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
    redirect('/login');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: '#071B4A',
          color: '#fff',
        }}
      >
        <div>
          <strong>{session.user.name}</strong>
          <span style={{ marginLeft: 10, opacity: 0.7, fontSize: 13 }}>
            {roleLabels[session.user.role]}
          </span>
        </div>
        <SignOutButton />
      </header>

      <main style={{ flex: 1, padding: '24px' }}>{children}</main>
    </div>
  );
}