import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/dashboard/super-admin', label: 'Overview' },
  { href: '/dashboard/super-admin/schools', label: 'Schools' },
  { href: '/dashboard/super-admin/users', label: 'Users' },
  { href: '/dashboard/super-admin/payments', label: 'Payments' },
  { href: '/dashboard/super-admin/reports', label: 'Reports' },
  { href: '/dashboard/super-admin/settings', label: 'Settings' },
  { href: '/dashboard/super-admin/profile', label: 'Profile' },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      <style>{`
        .sa-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: #F8F9FA;
        }
        .sa-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(10px);
          will-change: transform;
        }
        .sa-blob-1 {
          top: -15%; left: -10%; width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(7,27,74,0.10) 0%, rgba(7,27,74,0) 70%);
          animation: saDrift1 22s ease-in-out infinite;
        }
        .sa-blob-2 {
          bottom: -20%; right: -8%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,180,0,0.12) 0%, rgba(255,180,0,0) 70%);
          animation: saDrift2 26s ease-in-out infinite;
        }
        .sa-blob-3 {
          top: 35%; left: 45%; width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(7,27,74,0.05) 0%, rgba(7,27,74,0) 70%);
          animation: saDrift3 30s ease-in-out infinite;
        }
        @keyframes saDrift1 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(40px, 30px); }
          66% { transform: translate(-20px, -10px); }
        }
        @keyframes saDrift2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-30px, -20px); }
          66% { transform: translate(20px, 10px); }
        }
        @keyframes saDrift3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(25px, -15px); }
        }
        .sa-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(7,27,74,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(7,27,74,0.035) 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: radial-gradient(ellipse at 30% 0%, black 40%, transparent 80%);
          mask-image: radial-gradient(ellipse at 30% 0%, black 40%, transparent 80%);
        }

        .sa-shell {
          position: relative;
          z-index: 1;
          display: flex;
          min-height: calc(100vh - 65px);
        }

        .sa-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-right: 1px solid rgba(229,233,240,0.8);
          padding: 24px 16px;
          animation: saSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes saSlideIn {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .sa-sidebar-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #5A6A7A;
          text-transform: uppercase;
          margin-bottom: 16px;
          padding-left: 12px;
          opacity: 0;
          animation: saFadeIn 0.4s ease 0.15s both;
        }
        @keyframes saFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sa-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sa-nav-link {
          display: block;
          padding: 10px 12px;
          border-radius: 8px;
          color: #1A1A2E;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          background: transparent;
          opacity: 0;
          transform: translateX(-12px);
          animation: saNavIn 0.35s ease forwards;
          transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
        }
        .sa-nav-link:hover {
          background: rgba(7,27,74,0.06);
          transform: translateX(2px);
        }
        .sa-nav-link.active {
          color: #FFFFFF;
          font-weight: 600;
          background: linear-gradient(135deg, #071B4A, #0F2A5C);
          box-shadow: 0 4px 14px rgba(7,27,74,0.25);
        }
        .sa-nav-link.active:hover {
          transform: none;
        }
        @keyframes saNavIn {
          to { opacity: 1; transform: translateX(0); }
        }
        .sa-nav-link:nth-child(1) { animation-delay: 0.20s; }
        .sa-nav-link:nth-child(2) { animation-delay: 0.25s; }
        .sa-nav-link:nth-child(3) { animation-delay: 0.30s; }
        .sa-nav-link:nth-child(4) { animation-delay: 0.35s; }
        .sa-nav-link:nth-child(5) { animation-delay: 0.40s; }
        .sa-nav-link:nth-child(6) { animation-delay: 0.45s; }
        .sa-nav-link:nth-child(7) { animation-delay: 0.50s; }

        .sa-content {
          flex: 1;
          padding: 24px 32px;
        }

        @media (prefers-reduced-motion: reduce) {
          .sa-blob-1, .sa-blob-2, .sa-blob-3,
          .sa-sidebar, .sa-sidebar-label, .sa-nav-link {
            animation: none !important;
          }
        }
      `}</script>

      <div className="sa-bg" aria-hidden="true">
        <div className="sa-blob sa-blob-1" />
        <div className="sa-blob sa-blob-2" />
        <div className="sa-blob sa-blob-3" />
        <div className="sa-grid" />
      </div>

      <div className="sa-shell">
        <aside className="sa-sidebar">
          <div className="sa-sidebar-label">Platform Admin</div>
          <nav className="sa-nav">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="sa-nav-link" data-href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="sa-content">{children}</div>
      </div>

      <script>{`
        (function () {
          function setActiveNav() {
            var path = window.location.pathname;
            var links = document.querySelectorAll('.sa-nav-link');
            var bestMatch = null;
            var bestLen = -1;
            links.forEach(function (link) {
              var href = link.getAttribute('data-href');
              link.classList.remove('active');
              if (href && path.indexOf(href) === 0 && href.length > bestLen) {
                bestMatch = link;
                bestLen = href.length;
              }
            });
            if (bestMatch) bestMatch.classList.add('active');
          }
          setActiveNav();
        })();
      `}</script>
    </div>
  );
}