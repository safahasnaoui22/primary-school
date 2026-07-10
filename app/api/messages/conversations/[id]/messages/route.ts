import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  if (conversation.userAId !== session.user.id && conversation.userBId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: session.user.id,
      content: content.trim(),
    },
  });

  return NextResponse.json(message);
}