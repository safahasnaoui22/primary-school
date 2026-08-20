import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) {
    return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
  }

  const link = await prisma.parentStudent.findFirst({ where: { parentId: session.user.id, studentId } });
  if (!link) {
    return NextResponse.json({ error: 'Cet élève ne vous est pas lié' }, { status: 403 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { class: true } });
  const classId = student?.classId;

  const [resources, homeworks, events, progress] = await Promise.all([
    classId
      ? prisma.resource.findMany({ where: { classId }, orderBy: { createdAt: 'desc' }, include: { teacher: { select: { username: true } } } })
      : Promise.resolve([]),
    classId
      ? prisma.homework.findMany({
          where: { classId },
          orderBy: { deadline: 'asc' },
          include: { statuses: { where: { studentId } } },
        })
      : Promise.resolve([]),
    classId || session.user.schoolId
      ? prisma.calendarEvent.findMany({
          where: { OR: [{ classId }, { classId: null, schoolId: session.user.schoolId! }] },
          orderBy: { date: 'asc' },
        })
      : Promise.resolve([]),
    prisma.progressUpdate.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { teacher: { select: { username: true } } },
    }),
  ]);

  return NextResponse.json({
    resources: resources.map((r: any) => ({ id: r.id, type: r.type, title: r.title, description: r.description, fileUrl: r.fileUrl, teacherName: r.teacher.username, createdAt: r.createdAt })),
    homeworks: homeworks.map((h: any) => ({
      id: h.id, title: h.title, instructions: h.instructions, fileUrl: h.fileUrl, deadline: h.deadline,
      completed: h.statuses[0]?.completed ?? false,
    })),
    events: events.map((e: any) => ({ id: e.id, title: e.title, description: e.description, date: e.date, type: e.type })),
    progress: progress.map((p: any) => ({ id: p.id, category: p.category, level: p.level, note: p.note, teacherName: p.teacher.username, createdAt: p.createdAt })),
  });
}