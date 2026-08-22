import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
  }

  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
  }

  // Vercel serverless functions cap request bodies around 4.5MB —
  // this proxy approach trades away larger uploads for actually working,
  // given client-direct uploads are currently broken by a platform-side bug.
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 4 Mo pour le moment)' }, { status: 400 });
  }

  try {
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url, filename: file.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Échec du téléversement' }, { status: 500 });
  }
}