import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import SchoolOwnerDashboardClient from './DashboardClient';

export default async function SchoolOwnerDashboard() {
  const session = await auth();

  if (!session?.user.schoolId) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Aucune école n'est encore liée à votre compte. Contactez l'administrateur de la plateforme.
      </div>
    );
  }

  const schoolId = session.user.schoolId;

  const [school, teacherCount, studentCount, pendingEnrollments, recentTeachers, invoiceAgg, unpaidCount] =
    await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId } }),
      prisma.user.count({ where: { schoolId, role: 'TEACHER' } }),
      prisma.student.count({ where: { schoolId } }),
      prisma.enrollmentRequest.count({ where: { schoolId, status: 'PENDING' } }),
      prisma.user.findMany({
        where: { schoolId, role: 'TEACHER' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, username: true, email: true, createdAt: true },
      }),
      prisma.invoice.aggregate({
        where: { schoolId, status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.invoice.count({
        where: { schoolId, status: { in: ['PENDING', 'OVERDUE'] } },
      }),
    ]);

  const revenueCollected = invoiceAgg._sum.amount ?? 0;

  return (
    <SchoolOwnerDashboardClient
      schoolName={school?.name ?? 'Votre école'}
      ownerName={session.user.name ?? ''}
      teacherCount={teacherCount}
      studentCount={studentCount}
      pendingEnrollments={pendingEnrollments}
      recentTeachers={recentTeachers.map((t: any) => ({
        id: t.id,
        username: t.username,
        email: t.email,
        createdAt: t.createdAt.toISOString(),
      }))}
      revenueCollected={revenueCollected}
      unpaidCount={unpaidCount}
    />
  );
}