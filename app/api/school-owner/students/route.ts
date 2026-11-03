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
      class: {
        select: {
          id: true,
          name: true,
          // ClassTeacher is the source of truth for class → teachers
          teacherLinks: { select: { teacher: { select: { id: true, username: true } } } },
        },
      },
      parents: { include: { parent: { select: { id: true, username: true, email: true } } } },
    },
  });

  return NextResponse.json(
    students.map((s: any) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      birthDate: s.birthDate ?? null,
      class: s.class
        ? (() => {
            const teachers: string[] = s.class.teacherLinks.map((l: any) => l.teacher.username);
            return { id: s.class.id, name: s.class.name, teachers, teacherName: teachers[0] ?? null };
          })()
        : null,
      parents: s.parents.map((p: any) => ({ id: p.parent.id, username: p.parent.username, email: p.parent.email })),
      createdAt: s.createdAt,
    }))
  );
}