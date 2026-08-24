'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  classes: { id: string; name: string }[];
  selectedClass: { id: string; name: string } | null;
  students: { id: string; firstName: string; lastName: string }[];
  existingAttendance: { studentId: string; status: string }[];
  date: string;
}

export default function AttendanceClient({ classes, selectedClass, students, existingAttendance, date }: Props) {
  const router = useRouter();
  const [statusMap, setStatusMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    existingAttendance.forEach((a) => {
      map[a.studentId] = a.status;
    });
    students.forEach((s) => {
      if (!map[s.id]) map[s.id] = 'PRESENT';
    });
    return map;
  });

  const [saving, setSaving] = useState(false);

  const handleStatusChange = (studentId: string, status: string) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return;
    setSaving(true);
    const payload = Object.entries(statusMap).map(([studentId, status]) => ({
      studentId,
      status,
      classId: selectedClass.id,
      date,
    }));
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: payload }),
      });
      if (res.ok) {
        alert('Présences enregistrées avec succès !');
        router.refresh();
      } else {
        alert("Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      console.error(error);
      alert('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: string) => {
    const newMap: Record<string, string> = {};
    students.forEach((s) => {
      newMap[s.id] = status;
    });
    setStatusMap(newMap);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', color: '#071B4A' }}>Faire l'appel</h1>
        <Link href="/dashboard/teacher" style={{ color: '#071B4A', textDecoration: 'none' }}>← Retour</Link>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <select
          value={selectedClass?.id || ''}
          onChange={(e) => {
            if (e.target.value) {
              router.push(`/dashboard/teacher/attendance?classId=${e.target.value}&date=${date}`);
            }
          }}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
        >
          <option value="">Sélectionner une classe</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            const newDate = e.target.value;
            router.push(`/dashboard/teacher/attendance?classId=${selectedClass?.id || ''}&date=${newDate}`);
          }}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
        />
      </div>

      {!selectedClass ? (
        <p>Sélectionnez une classe pour commencer l'appel.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => markAll('PRESENT')} style={quickButton}>Tous présents</button>
            <button onClick={() => markAll('ABSENT')} style={quickButton}>Tous absents</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Élève</th>
                <th style={{ padding: '10px' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <td style={{ padding: '10px' }}>{student.firstName} {student.lastName}</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 20,
                            border: '1px solid #ccc',
                            background: statusMap[student.id] === status ? '#071B4A' : '#fff',
                            color: statusMap[student.id] === status ? '#fff' : '#071B4A',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          {status === 'PRESENT' ? 'Présent' : status === 'ABSENT' ? 'Absent' : status === 'LATE' ? 'Retard' : 'Excusé'}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              marginTop: 20,
              background: '#071B4A',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les présences'}
          </button>
        </>
      )}
    </div>
  );
}

const quickButton: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
};