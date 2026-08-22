import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');
  const search = searchParams.get('search');

  const students = await prisma.student.findMany({
    where: {
      schoolId: session.user.schoolId,
      ...(classId ? { classId } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: {
      class: { select: { id: true, name: true, teacher: { select: { username: true } } } },
      parents: { include: { parent: { select: { id: true, username: true, email: true } } } },
    },
  });

  return NextResponse.json(
    students.map((s: any) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      class: s.class ? { id: s.class.id, name: s.class.name, teacherName: s.class.teacher?.username ?? null } : null,
      parents: s.parents.map((p: any) => ({ id: p.parent.id, username: p.parent.username, email: p.parent.email })),
      createdAt: s.createdAt,
    }))
  );
}