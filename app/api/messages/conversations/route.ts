
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateConversation } from '@/lib/conversations';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: session.user.id }, { userBId: session.user.id }],
    },
    include: {
      userA: { select: { id: true, username: true, role: true } },
      userB: { select: { id: true, username: true, role: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const shaped = await Promise.all(
    conversations.map(async (c: any) => {
      const other = c.userAId === session.user.id ? c.userB : c.userA;
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: session.user.id },
          readAt: null,
        },
      });
      return {
        id: c.id,
        other,
        lastMessage: c.messages[0] || null,
        unreadCount,
      };
    })
  );

  return NextResponse.json(shaped);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.schoolId) {
    return NextResponse.json({ error: 'Not authenticated or not linked to a school' }, { status: 401 });
  }

  const { otherUserId } = await req.json();
  if (!otherUserId) {
    return NextResponse.json({ error: 'otherUserId is required' }, { status: 400 });
  }

  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser || otherUser.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'User not found in your school' }, { status: 404 });
  }

  const conversation = await getOrCreateConversation(session.user.schoolId, session.user.id, otherUserId);

  return NextResponse.json({ id: conversation.id });
}