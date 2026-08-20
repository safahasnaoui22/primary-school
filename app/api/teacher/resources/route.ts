import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { classId, type, title, description, fileUrl } = await req.json();
  if (!classId || !title) {
    return NextResponse.json({ error: 'Classe et titre requis' }, { status: 400 });
  }

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls || cls.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Vous n'enseignez pas cette classe" }, { status: 403 });
  }

  const resource = await prisma.resource.create({
    data: { classId, teacherId: session.user.id, type: type || 'PDF', title, description, fileUrl },
  });

  return NextResponse.json(resource);
}