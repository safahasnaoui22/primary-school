import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function SchoolOwnerDashboard() {
  const session = await auth();
  if (!session?.user.schoolId) {
    return <p>No school is linked to your account yet. Contact the platform admin.</p>;
  }

  const school = await prisma.school.findUnique({
    where: { id: session.user.schoolId },
    include: { users: { where: { role: 'TEACHER' } } },
  });

  const parentCount = await prisma.user.count({
    where: { role: 'PARENT' }, // refine with a school link on Parent later if needed
  });

  return (
    <div>
      <h1>{school?.name}</h1>
      <p>Welcome, {session.user.name}. Here's your school at a glance.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#071B4A' }}>
            {school?.users.length ?? 0}
          </div>
          <div style={{ color: '#5A6A7A', fontSize: 14 }}>Teachers</div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2>Teachers</h2>
        <ul>
          {school?.users.map((t) => (
            <li key={t.id}>{t.username} — {t.email}</li>
          ))}
        </ul>
        <p style={{ marginTop: 12, fontSize: 14, color: '#5A6A7A' }}>
          Add new teachers via a form that posts to /api/admin/users with role: "TEACHER".
        </p>
      </div>
    </div>
  );
}