import { auth } from '@/auth';

export default async function TeacherDashboard() {
  const session = await auth();

  return (
    <div>
      <h1>My Classroom</h1>
      <p>Welcome, {session?.user.name}.</p>

      <div style={{ marginTop: 24 }}>
        <h2>Quick links</h2>
        <ul>
          <li>Attendance</li>
          <li>Grades / Report cards</li>
          <li>Class announcements</li>
          <li>Message parents</li>
        </ul>
      </div>
    </div>
  );
}