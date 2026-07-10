'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroSection.module.css';
import InstallButton from './InstallButton';
import Link from 'next/link';

export default function HeroSection() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  // ── Scroll progress ──
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Stats counter ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            const targets = document.querySelectorAll(
              `[data-target]`
            ) as NodeListOf<HTMLElement>;
            targets.forEach((el) => {
              const target = parseInt(el.getAttribute('data-target') || '0');
              if (isNaN(target)) return;
              let current = 0;
              const step = Math.max(1, Math.floor(target / 60));
              const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                  el.textContent = String(target);
                  clearInterval(timer);
                } else {
                  el.textContent = String(current);
                }
              }, 20);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const ref = statsRef.current;
    if (ref) observer.observe(ref);
    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, []);

  // ── Drawer ──
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
    <div className='herosection'>
              {/* ── Scroll Progress ── */}
      <div
        className={styles.scrollProgress}
        style={{ width: `${progress}%` }}
      />

      {/* ── TOPBAR ── */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLeft}>
            <span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              123 Education Street, Smart City
            </span>
            <span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              info@edusmart.edu
            </span>
            <span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +1 (555) 123-4567
            </span>
            <span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Mon – Fri: 7:30 AM – 4:00 PM
            </span>
          </div>
          <div className={styles.topbarRight}>
            <a href="#" aria-label="Facebook">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter/X">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4l16 16M4 20L20 4" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navInner}>
          <a href="#" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div className={styles.logoName}>EduSmart</div>
              <div className={styles.logoSub}>Primary School</div>
            </div>
          </a>
          <ul className={styles.navMenu}>
            <li>
              <a href="#" className={styles.active}>
                Accueil
              </a>
            </li>
            
            <li>
              <a href="#">
                Programme Scolaire
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>
            </li>
           
            <li>
              <a href="#">
                Vie Scolaire
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#">Galerie</a>
            </li>
            <li>
              <a href="#">Actualités</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
          </ul>
          <div className={styles.navActions}>
           <Link href="/authentification" className={styles.btnGhost}>
 Espace Parents
</Link>
            <Link href="/Inscription" className={styles.btnAmber}>
 Apply Now
</Link>
         
                <InstallButton compact={true} />
            <button
              className={styles.navToggle}
              onClick={openDrawer}
              aria-label="Open menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`${styles.mobileOverlay} ${
          drawerOpen ? styles.mobileOverlayOpen : ''
        }`}
        onClick={closeDrawer}
      />
      <div
        className={`${styles.mobileDrawer} ${
          drawerOpen ? styles.mobileDrawerOpen : ''
        }`}
      >
        <div className={styles.mobileDrawerHead}>
          <a href="#" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className={styles.logoName} style={{ fontSize: '17px' }}>
              EduSmart
            </div>
          </a>
          <button className={styles.mobileClose} onClick={closeDrawer}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <ul className={styles.mobileNavList}>
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">About Us</a>
          </li>
          <li>
            <a href="#">Academics</a>
          </li>
          <li>
            <a href="#">Admissions</a>
          </li>
          <li>
            <a href="#">Activities</a>
          </li>
          <li>
            <a href="#">Gallery</a>
          </li>
          <li>
            <a href="#">News</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
        </ul>
        <div className={styles.mobileActions}>
  <Link
    href="/authentification"
    style={{ background: 'var(--bg-blue)', color: 'var(--navy)', textAlign: 'center', display: 'block' }}
  >
    Parent Login
  </Link>
  <Link
    href="/Inscription" 
    style={{ background: 'var(--amber)', color: '#fff', textAlign: 'center', display: 'block' }}
  >
    Apply Now
  </Link>
</div>
      </div>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <span className={styles.heroEyebrowDot} />
              Inscriptions Ouvertes • Année Scolaire 2026–2027
            </div>
       <h1 className={styles.heroH1}>
  L'Excellence,
  <br />
  <em>Commence Ici</em>
</h1>
          <p className={styles.heroP}>
  À EduSmart Primary School, nous offrons un environnement sûr, bienveillant et stimulant où chaque enfant apprend, grandit et développe pleinement son potentiel.
</p>
            <div className={styles.heroBtns}>
              <a href="#" className={styles.btnHeroPrimary}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
               Découvrez Notre École
              </a>
              <a href="#" className={styles.btnHeroOutline}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
               Planifier une Visite
              </a>
            </div>
            <div className={styles.heroBadges}>
              <div className={styles.heroBadgeItem}>
                <div className={`${styles.badgeIcon} ${styles.biBlue}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                Salles de Classe Modernes
              </div>
              <div className={styles.heroBadgeItem}>
                <div className={`${styles.badgeIcon} ${styles.biGreen}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                Enseignants Qualifiés
              </div>
              <div className={styles.heroBadgeItem}>
                <div className={`${styles.badgeIcon} ${styles.biAmber}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                Campus Scolaire Sûr et Sécurisé
              </div>
              <div className={styles.heroBadgeItem}>
                <div className={`${styles.badgeIcon} ${styles.biPurple}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
               Développement Global de l'Enfant
              </div>
            </div>
          </div>

          {/* ── HERO VISUAL (asymmetric frame, matching the reference HTML design) ── */}
          <div className={styles.heroVisual}>
            <div className={styles.heroFrameWrap}>

              {/* hand-drawn dashed arrow doodle */}
              <svg className={styles.doodleArrow} viewBox="0 0 150 110" fill="none">
                <path
                  d="M6 96 C 30 70, 20 30, 70 16 C 95 9, 110 14, 128 26"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="1 9"
                />
                <g transform="translate(122,14) rotate(35)">
                  <path d="M0 10 L18 0 L4 18 L2 12 Z" fill="currentColor" />
                </g>
              </svg>

              <div className={styles.dotsDeco}></div>

              <div className={styles.heroFrame}>
                <img
                  src="https://i.pinimg.com/1200x/6e/53/fc/6e53fc77fac9eb359c7d991e17ed1f0c.jpg"
                  alt="Kids at EduSmart"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              <div className={styles.admissionsFloat}>
                <div className={styles.admTop}>
                  <div className={styles.admIcon}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.admTitle}>
                      Admissions Open
                      <br />
                      2026 – 2027
                    </div>
                    <span className={styles.admBadge}>Limited Seats</span>
                  </div>
                </div>
                <button className={styles.admBtn}>
                  Apply Now
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              <div className={styles.ratingsFloat}>
                <div className={styles.stars}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span>4.9 / 5 Rating</span>
                <small>Based on 200+ parent reviews</small>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className={styles.statsBar} ref={statsRef}>
        <div className={styles.statsInner}>
          <div className={styles.statCell}>
            <div className={styles.statIco}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div>
              <div className={styles.statNum} data-target="18">
                0
              </div>
              <div className={styles.statLbl}>Years of Excellence</div>
            </div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statIco}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className={styles.statNum} data-target="620">
                0
              </div>
              <div className={styles.statLbl}>Happy Students</div>
            </div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statIco}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div className={styles.statNum} data-target="48">
                0
              </div>
              <div className={styles.statLbl}>Certified Teachers</div>
            </div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statIco}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div>
              <div className={styles.statNum}>12:1</div>
              <div className={styles.statLbl}>Student–Teacher Ratio</div>
            </div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statIco}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <div className={styles.statNum} data-target="98">
                0
              </div>
              <div className={styles.statLbl}>% Parent Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
   
    </div>

   
   
    </>
  );
}