import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const genderLabel: Record<string, string> = { M: 'Garçon', F: 'Fille' };

function gradeColor(grade: string) {
  const letter = grade[0];
  if (letter === 'A') return { bg: '#EAF3DE', text: '#27500A' };
  if (letter === 'B') return { bg: '#FAEEDA', text: '#633806' };
  return { bg: '#FAECE7', text: '#712B13' };
}

const statusColor: Record<string, string> = { PRESENT: '#4C7C59', ABSENT: '#C0392B', LATE: '#FFB400' };
const statusLabel: Record<string, string> = { PRESENT: 'Présent', ABSENT: 'Absent', LATE: 'Retard' };
const invoiceStatusColor: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#F0F2F5', text: '#5A6A7A', label: 'Non payé' },
  PARTIAL: { bg: '#FAEEDA', text: '#633806', label: 'Partiel' },
  PAID: { bg: '#EAF3DE', text: '#27500A', label: 'Payé' },
  OVERDUE: { bg: '#FAECE7', text: '#712B13', label: 'En retard' },
};

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return <div style={{ padding: 40, color: '#5A6A7A' }}>Accès refusé.</div>;
  }

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { select: { id: true, name: true, teacher: { select: { username: true, email: true } } } },
      parents: { include: { parent: { select: { id: true, username: true, email: true } } } },
      invoices: { orderBy: { dueDate: 'desc' }, include: { payments: { where: { voided: false } } } },
    },
  });

  if (!student || student.schoolId !== session.user.schoolId) notFound();

  const [attendance, grades, homeworkStatuses, progress] = await Promise.all([
    prisma.attendance.findMany({ where: { studentId: id }, orderBy: { date: 'desc' }, take: 10 }),
    prisma.grade.findMany({ where: { studentId: id }, orderBy: { createdAt: 'desc' } }),
    prisma.homeworkStatus.findMany({
      where: { studentId: id },
      include: { homework: { select: { title: true, deadline: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.progressUpdate.findMany({
      where: { studentId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { teacher: { select: { username: true } } },
    }),
  ]);

  const gradesBySubject = new Map<string, string>();
  grades.forEach((g: any) => {
    if (!gradesBySubject.has(g.subject)) gradesBySubject.set(g.subject, g.gradeValue);
  });

  const presentCount = attendance.filter((a: any) => a.status === 'PRESENT').length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <Link href="/dashboard/school-owner/students" style={{ color: '#5A6A7A', fontSize: 14, textDecoration: 'none' }}>
        ← Retour à la liste des élèves
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#071B4A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
          {student.firstName[0]}{student.lastName[0]}
        </div>
        <div>
          <h1 style={{ color: '#071B4A', margin: 0, fontSize: 26 }}>{student.firstName} {student.lastName}</h1>
          <p style={{ color: '#5A6A7A', margin: '4px 0 0', fontSize: 14 }}>
            {student.class ? student.class.name : <span style={{ color: '#C0392B' }}>Aucune classe assignée</span>}
            {student.class?.teacher && ` · Enseignant : ${student.class.teacher.username}`}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#071B4A' }}>{attendancePct !== null ? `${attendancePct}%` : '—'}</div>
          <div style={{ fontSize: 12, color: '#5A6A7A' }}>Assiduité récente</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#071B4A' }}>{gradesBySubject.size}</div>
          <div style={{ fontSize: 12, color: '#5A6A7A' }}>Matières notées</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 24, fontWeight: 700, color: student.invoices.some((i: any) => i.status !== 'PAID') ? '#C0392B' : '#071B4A' }}>
            {student.invoices.filter((i: any) => i.status !== 'PAID').length}
          </div>
          <div style={{ fontSize: 12, color: '#5A6A7A' }}>Factures impayées</div>
        </div>
      </div>

      {/* Parents */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Parent(s)</h2>
        {student.parents.length === 0 ? (
          <p style={{ color: '#C0392B', fontSize: 14 }}>Aucun parent lié à cet élève.</p>
        ) : (
          student.parents.map((p: any) => (
            <div key={p.parent.id} style={rowStyle}>
              <strong>{p.parent.username}</strong>
              <span style={{ color: '#5A6A7A' }}>{p.parent.email}</span>
            </div>
          ))
        )}
      </section>

      {/* Grades */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Notes</h2>
        {gradesBySubject.size === 0 ? (
          <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune note enregistrée.</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Array.from(gradesBySubject.entries()).map(([subject, grade]) => {
              const c = gradeColor(grade);
              return (
                <span key={subject} style={{ fontSize: 13, background: c.bg, color: c.text, padding: '4px 12px', borderRadius: 10, fontWeight: 600 }}>
                  {subject}: {grade}
                </span>
              );
            })}
          </div>
        )}
      </section>

      {/* Attendance */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Assiduité récente</h2>
        {attendance.length === 0 ? (
          <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune donnée d'assiduité.</p>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            {attendance.slice().reverse().map((a: any) => (
              <span
                key={a.id}
                title={`${statusLabel[a.status]} — ${new Date(a.date).toLocaleDateString('fr-FR')}`}
                style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor[a.status], display: 'inline-block' }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Homework */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Devoirs récents</h2>
        {homeworkStatuses.length === 0 ? (
          <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun devoir suivi pour le moment.</p>
        ) : (
          homeworkStatuses.map((h: any) => (
            <div key={h.id} style={rowStyle}>
              <span>{h.homework.title}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: h.completed ? '#27500A' : '#633806' }}>
                {h.completed ? '✓ Complété' : 'En attente'}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Progress updates */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Suivi de progrès</h2>
        {progress.length === 0 ? (
          <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune mise à jour pour le moment.</p>
        ) : (
          progress.map((p: any) => (
            <div key={p.id} style={rowStyle}>
              <span>{p.category} — {p.level}{p.note ? ` : ${p.note}` : ''}</span>
              <span style={{ fontSize: 12, color: '#5A6A7A' }}>{p.teacher.username} · {new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          ))
        )}
      </section>

      {/* Invoices */}
      <section style={{ ...sectionStyle, marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ ...headingStyle, margin: 0 }}>Paiements</h2>
          <Link href="/dashboard/school-owner/payments" style={{ fontSize: 13, color: '#071B4A', fontWeight: 600, textDecoration: 'underline' }}>
            Gérer les paiements →
          </Link>
        </div>
        {student.invoices.length === 0 ? (
          <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune facture pour cet élève.</p>
        ) : (
          student.invoices.map((inv: any) => {
            const paid = inv.payments.reduce((s: number, p: any) => s + p.amount, 0);
            const sc = invoiceStatusColor[inv.status] ?? invoiceStatusColor.PENDING;
            return (
              <div key={inv.id} style={rowStyle}>
                <span>{inv.semester} — {inv.amount.toLocaleString('fr-FR')} DT (payé : {paid.toLocaleString('fr-FR')} DT)</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: sc.bg, color: sc.text }}>
                  {sc.label}
                </span>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 18, textAlign: 'center' };
const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 20, marginBottom: 16 };
const headingStyle: React.CSSProperties = { color: '#071B4A', fontSize: 16, marginBottom: 12 };
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13.5 };