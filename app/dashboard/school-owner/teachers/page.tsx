import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TeachersClient from './TeachersClient';


export default async function TeachersListPage() {
  const session = await auth();

  if (!session?.user.schoolId) {
    return (
      <p style={{ padding: 40, color: '#5A6A7A', fontFamily: 'Inter, sans-serif' }}>
        Aucune école liée à votre compte.
      </p>
    );
  }

  const teachers = await prisma.user.findMany({
    where: { schoolId: session.user.schoolId, role: 'TEACHER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      // Legacy single-teacher link + the newer many-to-many link
      taughtClasses: { select: { id: true, name: true } },
      classLinks: { select: { class: { select: { id: true, name: true } } } },
    },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const rows: TeacherRow[] = teachers.map((t: any) => {
    const classMap = new Map<string, { id: string; name: string }>();
    (t.taughtClasses ?? []).forEach((c: any) => classMap.set(c.id, { id: c.id, name: c.name }));
    (t.classLinks ?? []).forEach((l: any) => {
      if (l.class) classMap.set(l.class.id, { id: l.class.id, name: l.class.name });
    });

    return {
      id: t.id,
      username: t.username,
      email: t.email,
      createdAt: t.createdAt.toISOString(),
      // Formatted on the server so server/client HTML always match (no hydration mismatch).
      createdLabel: t.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      isNew: t.createdAt >= weekAgo,
      thisMonth: t.createdAt >= monthStart,
      classes: Array.from(classMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    };
  });

  return <TeachersClient teachers={rows} />;
}