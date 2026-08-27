'use client';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: string;
  className: string | null;
}

const eventTypeLabel: Record<string, { label: string; color: string; emoji: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', emoji: '📝' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59', emoji: '🎨' },
  TRIP: { label: 'Sortie', color: '#071B4A', emoji: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#FFB400', emoji: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#8A5A00', emoji: '🎉' },
};

export default function ParentEventsClient({ events }: { events: EventItem[] }) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&display=swap" rel="stylesheet" />

      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: '#071B4A', fontSize: 28, marginBottom: 4 }}>
        Événements à venir
      </h1>
      <p style={{ color: '#5A6A7A', fontSize: 14, marginBottom: 28 }}>
        Le calendrier de l'école et des classes de vos enfants.
      </p>

      {events.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun événement à venir pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((e) => {
            const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
            const d = new Date(e.date);
            return (
              <div
                key={e.id}
                style={{
                  background: '#fff',
                  border: '1px solid #E5E9F0',
                  borderRadius: 12,
                  padding: '16px 20px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FFB400', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
                    {d.toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#071B4A' }}>
                    {d.getDate()}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#071B4A' }}>
                      {et.emoji} {e.title}
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: et.color, whiteSpace: 'nowrap' }}>{et.label}</span>
                  </div>
                  {e.description && (
                    <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#5A6A7A' }}>{e.description}</p>
                  )}
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#5A6A7A' }}>
                    {e.className ? `Classe : ${e.className}` : "Toute l'école"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}