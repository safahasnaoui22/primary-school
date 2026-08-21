import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ teacherId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Échec du téléversement' }, { status: 400 });
  }
}