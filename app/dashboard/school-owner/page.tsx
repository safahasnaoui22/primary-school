import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import SchoolOwnerDashboardClient from './DashboardClient';

function monthLabel(d: Date) {
  return d.toLocaleDateString('fr-FR', { month: 'short' });
}

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
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    school,
    teacherCount,
    studentCount,
    pendingEnrollments,
    recentTeachers,
    invoiceAgg,
    unpaidCount,
    invoicesForTrend,
    studentsForTrend,
    invoiceStatusCounts,
  ] = await Promise.all([
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
    prisma.invoice.aggregate({ where: { schoolId, status: 'PAID' }, _sum: { amount: true } }),
    prisma.invoice.count({ where: { schoolId, status: { in: ['PENDING', 'OVERDUE'] } } }),
    // last 6 months of paid invoices, for the revenue trend line
    prisma.invoice.findMany({
      where: { schoolId, status: 'PAID', createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    }),
    // last 6 months of enrollments, for the growth trend line
    prisma.student.findMany({
      where: { schoolId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    // breakdown for the status bar
    prisma.invoice.groupBy({ by: ['status'], where: { schoolId }, _count: { _all: true } }),
  ]);

  // Build 6 month buckets ending this month
  const buckets: { key: string; label: string; revenue: number; students: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), revenue: 0, students: 0 });
  }
  const bucketIndex = (date: Date) => buckets.findIndex((b) => b.key === `${date.getFullYear()}-${date.getMonth()}`);

  invoicesForTrend.forEach((inv: any) => {
    const idx = bucketIndex(new Date(inv.createdAt));
    if (idx !== -1) buckets[idx].revenue += inv.amount ?? 0;
  });
  studentsForTrend.forEach((s: any) => {
    const idx = bucketIndex(new Date(s.createdAt));
    if (idx !== -1) buckets[idx].students += 1;
  });

  const statusBreakdown = { PAID: 0, PENDING: 0, OVERDUE: 0 } as Record<string, number>;
  invoiceStatusCounts.forEach((row: any) => {
    statusBreakdown[row.status] = row._count._all;
  });

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
      trend={buckets}
      invoiceStatusBreakdown={statusBreakdown}
    />
  );
}