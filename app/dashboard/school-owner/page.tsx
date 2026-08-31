// app/dashboard/school-owner/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import SchoolOwnerDashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

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
  const now = new Date();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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
    studentsNoClass,
    studentsNoParent,
    classesNoTeacher,
    classes,
    announcements,
    upcomingEvents,
    conversations,
    overdueInvoicesRaw,
    overdueCount,
    paymentsForClassRevenue,
    invoicesForCollectionRate,
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
    prisma.invoice.findMany({
      where: { schoolId, status: 'PAID', createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    }),
    prisma.student.findMany({
      where: { schoolId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.invoice.groupBy({ by: ['status'], where: { schoolId }, _count: { _all: true } }),
    prisma.student.count({ where: { schoolId, classId: null } }),
    prisma.student.count({ where: { schoolId, parents: { none: {} } } }),
    prisma.class.count({ where: { schoolId, teacherId: null } }),
    prisma.class.findMany({ where: { schoolId }, select: { id: true, name: true } }),
    prisma.announcement.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.calendarEvent.findMany({
      where: { schoolId, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 5,
    }),
    prisma.conversation.findMany({
      where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
      include: {
        userA: { select: { id: true, username: true, role: true } },
        userB: { select: { id: true, username: true, role: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.invoice.findMany({
      where: { schoolId, dueDate: { lt: now }, status: { notIn: ['PAID', 'CANCELLED'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        parent: { select: { username: true } },
        payments: { where: { voided: false }, select: { amount: true } },
      },
    }),
    prisma.invoice.count({
      where: { schoolId, dueDate: { lt: now }, status: { notIn: ['PAID', 'CANCELLED'] } },
    }),
    prisma.payment.findMany({
      where: { voided: false, invoice: { schoolId } },
      select: {
        amount: true,
        invoice: { select: { semester: true, class: { select: { id: true, name: true } } } },
      },
    }),
    prisma.invoice.findMany({
      where: { schoolId, dueDate: { gte: lastMonthStart, lt: thisMonthEnd } },
      select: {
        amount: true,
        dueDate: true,
        payments: { where: { voided: false }, select: { amount: true } },
      },
    }),
  ]);

  const buckets: { key: string; label: string; revenue: number; students: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), revenue: 0, students: 0 });
  }
  const bucketIndex = (date: Date) => buckets.findIndex((b) => b.key === `${date.getFullYear()}-${date.getMonth()}`);

  invoicesForTrend.forEach((inv) => {
    const idx = bucketIndex(new Date(inv.createdAt));
    if (idx !== -1) buckets[idx].revenue += inv.amount ?? 0;
  });
  studentsForTrend.forEach((s) => {
    const idx = bucketIndex(new Date(s.createdAt));
    if (idx !== -1) buckets[idx].students += 1;
  });

  const statusBreakdown = { PAID: 0, PENDING: 0, OVERDUE: 0 } as Record<string, number>;
  invoiceStatusCounts.forEach((row) => {
    statusBreakdown[row.status] = row._count._all;
  });

  const revenueCollected = invoiceAgg._sum.amount ?? 0;

  const conversationsShaped = await Promise.all(
    conversations.map(async (c) => {
      const other = c.userAId === session.user.id ? c.userB : c.userA;
      const unreadCount = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: session.user.id }, readAt: null },
      });
      return {
        id: c.id,
        otherName: other.username,
        otherRole: other.role,
        lastMessage: c.messages[0]?.content ?? null,
        unreadCount,
      };
    })
  );

  const overdueInvoices = overdueInvoicesRaw.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const remaining = inv.amount - paid;
    const daysLate = Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000));
    return {
      id: inv.id,
      studentId: inv.student.id,
      studentName: `${inv.student.firstName} ${inv.student.lastName}`,
      parentName: inv.parent.username,
      remaining,
      daysLate,
    };
  });

  const revenueByClassMap = new Map<string, { className: string; semester: string; total: number }>();
  paymentsForClassRevenue.forEach((p) => {
    const cls = p.invoice.class;
    const semester = p.invoice.semester;
    const key = `${cls.id}|${semester}`;
    const existing = revenueByClassMap.get(key);
    if (existing) {
      existing.total += p.amount;
    } else {
      revenueByClassMap.set(key, { className: cls.name, semester, total: p.amount });
    }
  });
  const revenueByClass = Array.from(revenueByClassMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  function computeRate(bucket: 'this' | 'last') {
    let due = 0;
    let collected = 0;
    invoicesForCollectionRate.forEach((inv) => {
      const d = new Date(inv.dueDate);
      const isThisMonth = d >= thisMonthStart && d < thisMonthEnd;
      const isLastMonth = d >= lastMonthStart && d < thisMonthStart;
      if ((bucket === 'this' && isThisMonth) || (bucket === 'last' && isLastMonth)) {
        due += inv.amount;
        collected += inv.payments.reduce((s, p) => s + p.amount, 0);
      }
    });
    return due > 0 ? Math.round((collected / due) * 100) : null;
  }

  const collectionRate = {
    current: computeRate('this'),
    previous: computeRate('last'),
  };

  return (
    <SchoolOwnerDashboardClient
      schoolName={school?.name ?? 'Votre école'}
      ownerName={session.user.name ?? ''}
      teacherCount={teacherCount}
      studentCount={studentCount}
      pendingEnrollments={pendingEnrollments}
      recentTeachers={recentTeachers.map((t) => ({
        id: t.id,
        username: t.username,
        email: t.email,
        createdAt: t.createdAt.toISOString(),
      }))}
      revenueCollected={revenueCollected}
      unpaidCount={unpaidCount}
      trend={buckets}
      invoiceStatusBreakdown={statusBreakdown}
      health={{ studentsNoClass, studentsNoParent, classesNoTeacher }}
      classes={classes}
      announcements={announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        category: a.category,
        createdAt: a.createdAt.toISOString(),
      }))}
      upcomingEvents={upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date.toISOString(),
        type: e.type,
      }))}
      conversations={conversationsShaped}
      overdueInvoices={overdueInvoices}
      overdueCount={overdueCount}
      revenueByClass={revenueByClass}
      collectionRate={collectionRate}
    />
  );
}