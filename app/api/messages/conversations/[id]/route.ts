import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      userA: { select: { id: true, username: true, role: true } },
      userB: { select: { id: true, username: true, role: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  if (conversation.userAId !== session.user.id && conversation.userBId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Mark incoming messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const other = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;

  return NextResponse.json({
    id: conversation.id,
    other,
    messages: conversation.messages,
  });
}