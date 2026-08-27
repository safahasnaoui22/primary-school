import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { put } from '@vercel/blob';


export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ files: [] });
    }

    const uploaded: { name: string; url: string }[] = [];
    for (const file of files) {
      const blob = await put(
        `enrollment-docs/${session.user.id}/${Date.now()}-${file.name}`,
        file,
        { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN }
      );
      uploaded.push({ name: file.name, url: blob.url });
    }

    return NextResponse.json({ files: uploaded });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Échec de l'envoi des documents" }, { status: 500 });
  }
}