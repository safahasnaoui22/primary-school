import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      console.error('Upload forbidden: invalid session or user is not a teacher');

      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async () => {
        console.log('Generating Vercel Blob upload token for:', session.user.id);

        return {
          allowedContentTypes: [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],

          maximumSizeInBytes: 10 * 1024 * 1024,

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            teacherId: session.user.id,
          }),
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed successfully:', {
          url: blob.url,
          pathname: blob.pathname,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error('VERCEL BLOB UPLOAD ERROR:', err);

    const message =
      err instanceof Error
        ? err.message
        : 'Échec du téléversement';

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}FileDropZone.tsx