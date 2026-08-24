import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, body, category, classId } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      schoolId: session.user.schoolId,
      classId: classId || null,
      authorId: session.user.id,
      title,
      body,
      category: category || 'ANNOUNCEMENT',
    },
  });

  return NextResponse.json(announcement);
}