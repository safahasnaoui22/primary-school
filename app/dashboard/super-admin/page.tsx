import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

type RecentSchool = {
  id: string;
  name: string;
  createdAt: Date;
  users: { username: string }[];
};

export default async function SuperAdminDashboard() {
  const session = await auth();

  const [schoolCount, ownerCount, teacherCount, parentCount, recentSchools, revenueAgg] =
    await Promise.all([
      prisma.school.count(),
      prisma.user.count({ where: { role: 'SCHOOL_OWNER' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.school.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { users: { where: { role: 'SCHOOL_OWNER' }, take: 1 } },
      }) as unknown as Promise<RecentSchool[]>,
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
    ]);

  const totalRevenue = revenueAgg._sum.amount ?? 0;
  const greeting = `Welcome back, ${session?.user.name ?? 'Admin'}. Here's how the whole platform is doing.`;

  return (
    <div>
      <style>{`
        .sa-h1 {
          color: #071B4A;
          margin-bottom: 4px;
          opacity: 0;
          animation: saH1In 0.45s ease forwards;
        }
        @keyframes saH1In {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sa-typing {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #FFB400;
          width: ${greeting.length}ch;
          max-width: 100%;
          animation:
            saTyping ${Math.max(greeting.length * 0.045, 1)}s steps(${greeting.length}, end) 0.3s both,
            saCaretBlink 0.8s step-end infinite;
        }
        @keyframes saTyping {
          from { width: 0; }
          to { width: ${greeting.length}ch; }
        }
        @keyframes saCaretBlink {
          from, to { border-color: transparent; }
          50% { border-color: #FFB400; }
        }

        .sa-intro {
          color: #5A6A7A;
          margin-bottom: 24px;
          min-height: 20px;
        }

        .sa-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .sa-stat-card {
          border: 1px solid #E5E9F0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(7,27,74,0.05);
          background: #fff;
          opacity: 0;
          transform: translateY(18px) scale(0.97);
          animation: saCardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .sa-stat-card:hover {
          transform: translateY(-4px) scale(1);
          box-shadow: 0 12px 28px rgba(7,27,74,0.12);
        }
        @keyframes saCardIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sa-stat-card:nth-child(1) { animation-delay: 0.10s; }
        .sa-stat-card:nth-child(2) { animation-delay: 0.18s; }
        .sa-stat-card:nth-child(3) { animation-delay: 0.26s; }
        .sa-stat-card:nth-child(4) { animation-delay: 0.34s; }
        .sa-stat-card:nth-child(5) { animation-delay: 0.42s; }

        .sa-stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #071B4A;
        }
        .sa-stat-label {
          color: #5A6A7A;
          font-size: 13px;
          margin-top: 4px;
        }

        .sa-section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .sa-section-title {
          color: #071B4A;
          font-size: 18px;
        }

        .sa-reveal.sa-pending {
          opacity: 0;
          transform: translateY(24px);
        }
        .sa-reveal.sa-in-view {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .sa-table-wrap {
          border: 1px solid #E5E9F0;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(6px);
          box-shadow: 0 8px 24px rgba(7,27,74,0.06);
        }
        table.sa-table {
          width: 100%;
          border-collapse: collapse;
        }
        .sa-th {
          padding: 12px 16px;
          font-size: 13px;
          color: #5A6A7A;
          font-weight: 600;
          border-bottom: 1px solid #E5E9F0;
          text-align: left;
          background: #F8F9FA;
        }
        .sa-td {
          padding: 12px 16px;
          font-size: 14px;
          color: #1A1A2E;
          border-bottom: 1px solid #F0F0F0;
        }
        .sa-row {
          transition: background-color 0.2s ease;
        }
        .sa-row:hover {
          background-color: rgba(255,180,0,0.06);
        }

        .sa-btn {
          background: #FFB400;
          color: #071B4A;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .sa-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 16px rgba(255,180,0,0.35);
        }
        .sa-btn-outline {
          border: 2px solid #FFB400;
          color: #071B4A;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.18s ease, background 0.18s ease;
        }
        .sa-btn-outline:hover {
          transform: translateY(-2px) scale(1.03);
          background: rgba(255,180,0,0.08);
        }

        .sa-actions {
          margin-top: 32px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .sa-h1, .sa-typing, .sa-stat-card {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .sa-reveal.sa-pending { opacity: 1; transform: none; }
        }
      `}</style>

      <h1 className="sa-h1">Platform Overview</h1>
      <p className="sa-intro">
        <span className="sa-typing">{greeting}</span>
      </p>

      <div className="sa-stat-grid">
        <StatCard label="Schools" value={schoolCount} />
        <StatCard label="School Owners" value={ownerCount} />
        <StatCard label="Teachers" value={teacherCount} />
        <StatCard label="Parents" value={parentCount} />
        <StatCard label="Revenue Collected" value={totalRevenue} prefix="$" />
      </div>

      <div className="sa-section-head sa-reveal" data-reveal>
        <h2 className="sa-section-title">Recently Added Schools</h2>
        <Link href="/dashboard/super-admin/schools/new" className="sa-btn">
          + New School
        </Link>
      </div>

      <div className="sa-table-wrap sa-reveal" data-reveal>
        <table className="sa-table">
          <thead>
            <tr>
              <th className="sa-th">School</th>
              <th className="sa-th">Owner</th>
              <th className="sa-th">Created</th>
              <th className="sa-th"></th>
            </tr>
          </thead>
          <tbody>
            {recentSchools.length === 0 && (
              <tr>
                <td className="sa-td" colSpan={4}>
                  No schools yet. Create the first one to get started.
                </td>
              </tr>
            )}
            {recentSchools.map((school: RecentSchool) => (
              <tr key={school.id} className="sa-row">
                <td className="sa-td">{school.name}</td>
                <td className="sa-td">{school.users[0]?.username ?? '—'}</td>
                <td className="sa-td">{school.createdAt.toLocaleDateString()}</td>
                <td className="sa-td">
                  <Link href={`/dashboard/super-admin/schools/${school.id}`} style={{ color: '#FFB400', fontWeight: 600 }}>
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sa-actions sa-reveal" data-reveal>
        <Link href="/dashboard/super-admin/users/new" className="sa-btn">+ New User</Link>
        <Link href="/dashboard/super-admin/reports" className="sa-btn-outline">View Reports</Link>
        <Link href="/dashboard/super-admin/payments" className="sa-btn-outline">View Payments</Link>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var revealEls = document.querySelectorAll('[data-reveal]');
              revealEls.forEach(function (el) { el.classList.add('sa-pending'); });

              if ('IntersectionObserver' in window) {
                var observer = new IntersectionObserver(
                  function (entries) {
                    entries.forEach(function (entry) {
                      if (entry.isIntersecting) {
                        entry.target.classList.remove('sa-pending');
                        entry.target.classList.add('sa-in-view');
                        observer.unobserve(entry.target);
                      }
                    });
                  },
                  { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
                );
                revealEls.forEach(function (el) { observer.observe(el); });
              } else {
                revealEls.forEach(function (el) { el.classList.remove('sa-pending'); });
              }

              var statEls = document.querySelectorAll('.sa-stat-value[data-value]');
              function animateCount(el) {
                var target = parseFloat(el.getAttribute('data-value') || '0');
                var prefix = el.getAttribute('data-prefix') || '';
                var duration = 900;
                var start = null;
                function step(ts) {
                  if (start === null) start = ts;
                  var progress = Math.min((ts - start) / duration, 1);
                  var eased = 1 - Math.pow(1 - progress, 3);
                  var current = Math.round(target * eased);
                  el.textContent = prefix + current.toLocaleString();
                  if (progress < 1) window.requestAnimationFrame(step);
                  else el.textContent = prefix + target.toLocaleString();
                }
                window.requestAnimationFrame(step);
              }

              if ('IntersectionObserver' in window) {
                var statObserver = new IntersectionObserver(
                  function (entries) {
                    entries.forEach(function (entry) {
                      if (entry.isIntersecting) {
                        animateCount(entry.target);
                        statObserver.unobserve(entry.target);
                      }
                    });
                  },
                  { threshold: 0.4 }
                );
                statEls.forEach(function (el) { statObserver.observe(el); });
              }
            })();
          `,
        }}
      />
    </div>
  );
}

function StatCard({ label, value, prefix = '' }: { label: string; value: number; prefix?: string }) {
  return (
    <div className="sa-stat-card">
      <div className="sa-stat-value" data-value={value} data-prefix={prefix}>
        {prefix}{value.toLocaleString()}
      </div>
      <div className="sa-stat-label">{label}</div>
    </div>
  );
}