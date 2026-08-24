import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.schoolId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const { records } = body as { records: { studentId: string; status: string; classId: string; date: string }[] };

  if (!records || records.length === 0) {
    return NextResponse.json({ error: 'Aucune donnée' }, { status: 400 });
  }

  const teacherId = session.user.id;

  try {
    const date = new Date(records[0].date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Supprimer les anciennes présences pour cette classe et date
    await prisma.attendance.deleteMany({
      where: {
        classId: records[0].classId,
        recordedById: teacherId, // ✅ Use recordedById instead of teacherId
        date: {
          gte: date,
          lt: nextDay,
        },
      },
    });

    // Créer les nouvelles
    await prisma.attendance.createMany({
      data: records.map((r) => ({
        studentId: r.studentId,
        classId: r.classId,
        recordedById: teacherId, // ✅ Use recordedById instead of teacherId
        date,
        status: r.status as any,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}