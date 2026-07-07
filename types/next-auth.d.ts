import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'SUPER_ADMIN' | 'SCHOOL_OWNER' | 'TEACHER' | 'PARENT';
      schoolId?: string | null;
    } & DefaultSession['user'];
  }
}