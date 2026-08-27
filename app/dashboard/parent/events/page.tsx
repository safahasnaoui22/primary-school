import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ParentEventsClient from './EventsClient';

export default async function ParentEventsPage() {
  const session = await auth();
  if (!session?.user || !session.user.schoolId) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Aucune école n'est liée à votre compte.
      </div>
    );
  }

  // Get this parent's children's class IDs, so class-specific events
  // (exams, trips) show up alongside school-wide ones.
  const links = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: { student: { select: { classId: true, firstName: true, class: { select: { name: true } } } } },
  });

  const classIds = links.map((l: any) => l.student.classId).filter(Boolean) as string[];

  const events = await prisma.calendarEvent.findMany({
    where: {
      schoolId: session.user.schoolId,
      date: { gte: new Date() },
      OR: [{ classId: null }, { classId: { in: classIds } }],
    },
    orderBy: { date: 'asc' },
    include: { class: { select: { name: true } } },
  });

  return (
    <ParentEventsClient
      events={events.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date.toISOString(),
        type: e.type,
        className: e.class?.name ?? null,
      }))}
    />
  );
}