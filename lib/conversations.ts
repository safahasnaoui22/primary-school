import { prisma } from '@/lib/prisma';

export async function getOrCreateConversation(schoolId: string, userId1: string, userId2: string) {
  const [userAId, userBId] = [userId1, userId2].sort();

  let conversation = await prisma.conversation.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { schoolId, userAId, userBId },
    });
  }

  return conversation;
}