'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './HeroSection.module.css';
import InstallButton from './InstallButton';

import Link from 'next/link';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import RefreshButton from './RefreshButton';

gsap.registerPlugin(SplitText);

export default function HeroSection() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // ── Refs for GSAP targets ──
  const rootRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const logoMarkRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroEyebrowRef = useRef<HTMLDivElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroPRef = useRef<HTMLParagraphElement>(null);
  const heroBtnsRef = useRef<HTMLDivElement>(null);
  const heroBadgesRef = useRef<HTMLDivElement>(null);

  const heroVisualRef = useRef<HTMLDivElement>(null);
  const heroFrameWrapRef = useRef<HTMLDivElement>(null);
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const doodleArrowRef = useRef<SVGSVGElement>(null);
  const admissionsFloatRef = useRef<HTMLDivElement>(null);
  const ratingsFloatRef = useRef<HTMLDivElement>(null);

  const btnPrimaryRef = useRef<HTMLAnchorElement>(null);
  const btnOutlineRef = useRef<HTMLAnchorElement>(null);

  // ── Mark component as mounted ──
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Lenis smooth scroll ──
  useEffect(() => {
    if (!isMounted) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Proper GSAP ticker integration
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Force initial render
    requestAnimationFrame((time) => {
      lenis.raf(time);
    });

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [isMounted]);

  // ── Scroll progress bar + navbar shrink trigger ──
  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      const winScroll = window.pageYOffset || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  // ── Navbar shrink polish ──
  useEffect(() => {
    if (!navbarRef.current || !logoMarkRef.current) return;
    gsap.to(navbarRef.current, {
      height: scrolled ? 62 : 72,
      duration: 0.4,
      ease: 'power2.out',
    });
    gsap.to(logoMarkRef.current, {
      scale: scrolled ? 0.86 : 1,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [scrolled]);

  // ── Big GSAP setup ──
  useLayoutEffect(() => {
    if (!isMounted) return;

    let split: SplitText | null = null;
    let ctx: gsap.Context | undefined;
    let cleanupFns: Array<() => void> = [];

    document.fonts.ready.then(() => {
      ctx = gsap.context(() => {
        // ── SplitText heading reveal (initial load) ──
        if (heroH1Ref.current) {
          split = new SplitText(heroH1Ref.current, {
            type: 'words,chars',
          });
          gsap.from(split.chars, {
            yPercent: 120,
            opacity: 0,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.02,
            delay: 0.1,
          });
        }

        // ── Stagger reveal timeline for hero content ──
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out', duration: 0.8 },
        });
        tl.from(heroEyebrowRef.current, { y: -18, opacity: 0 }, 0.1)
          .from(heroPRef.current, { y: 22, opacity: 0 }, 0.55)
          .from(
            heroBtnsRef.current ? Array.from(heroBtnsRef.current.children) : [],
            { y: 22, opacity: 0, stagger: 0.1 },
            0.7
          )
          .from(
            heroBadgesRef.current ? [heroBadgesRef.current] : [],
            { y: 18, opacity: 0 },
            0.85
          )
          .from(
            heroVisualRef.current,
            { opacity: 0, scale: 0.94, duration: 1 },
            0.3
          );

        // ── Continuous floating badges ──
        if (admissionsFloatRef.current) {
          gsap.to(admissionsFloatRef.current, {
            y: -8,
            duration: 2.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        if (ratingsFloatRef.current) {
          gsap.to(ratingsFloatRef.current, {
            y: 7,
            duration: 2.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 0.3,
          });
        }

        // ── Animated counters (play shortly after load) ──
        const counters = gsap.utils.toArray<HTMLElement>('[data-target]');
        counters.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          const counterObj = { val: 0 };
          gsap.to(counterObj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            delay: 0.9,
            onUpdate: () => {
              el.textContent = Math.floor(counterObj.val).toString();
            },
          });
        });

        // ── Stats bar fade-in ──
        if (statsRef.current) {
          gsap.fromTo(
            statsRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              delay: 0.9,
            }
          );
        }

        // ── Image zoom on hover ──
        if (heroFrameRef.current) {
          const img = heroFrameRef.current.querySelector('img');
          const frameEl = heroFrameRef.current;
          if (img) {
            const onEnter = () =>
              gsap.to(img, { scale: 1.08, duration: 0.7, ease: 'power2.out' });
            const onLeave = () =>
              gsap.to(img, { scale: 1, duration: 0.7, ease: 'power2.out' });
            frameEl.addEventListener('mouseenter', onEnter);
            frameEl.addEventListener('mouseleave', onLeave);
            cleanupFns.push(() => {
              frameEl.removeEventListener('mouseenter', onEnter);
              frameEl.removeEventListener('mouseleave', onLeave);
            });
          }
        }

        // ── Magnetic buttons ──
        const magneticEls = [btnPrimaryRef.current, btnOutlineRef.current].filter(
          Boolean
        ) as HTMLElement[];
        magneticEls.forEach((el) => {
          const strength = 0.35;
          const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, {
              x: x * strength,
              y: y * strength,
              duration: 0.4,
              ease: 'power2.out',
            });
          };
          const onLeave = () => {
            gsap.to(el, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.4)',
            });
          };
          el.addEventListener('mousemove', onMove);
          el.addEventListener('mouseleave', onLeave);
          cleanupFns.push(() => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
          });
        });
      }, rootRef);
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
      split?.revert();
      ctx?.revert();
    };
  }, [isMounted]);

  // ── Drawer ──
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  // Prevent hydration mismatch
  if (!isMounted) {
    return <div className={styles.herosection} style={{ minHeight: '100vh' }} />;
  }

  return (
    <>
      <div className={styles.herosection} ref={rootRef}>
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                123 Rue de l&apos;École, Smart City
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                info@edusmart.edu
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +1 (555) 123-4567
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Lun – Ven : 7h30 – 16h00
              </span>
            </div>
            <div className={styles.topbarRight}>
              <a href="#" aria-label="Facebook">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── NAVBAR ── */}
        <nav
          ref={navbarRef}
          className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
        >
          <div className={styles.navInner}>
            <a href="#" className={styles.logo}>
              <div className={styles.logoMark} ref={logoMarkRef}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <RefreshButton />
                <div className={styles.logoName}>EduSmart</div>
                <div className={styles.logoSub}>École Primaire</div>
              </div>
            </a>
            <ul className={styles.navMenu}>
              <li><a href="#" className={styles.active}>Accueil</a></li>
              <li><a href="#">Programme Scolaire</a></li>
              <li><a href="#">Vie Scolaire</a></li>

              <li><a href="#">Contact</a></li>
            </ul>
            <div className={styles.navActions}>
              <Link href="/authentification" className={styles.btnGhost}>
                Espace Parents
              </Link>

              <InstallButton compact={true} />
              <button
                className={styles.navToggle}
                onClick={openDrawer}
                aria-label="Ouvrir le menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className={styles.logoName} style={{ fontSize: '17px' }}>
                EduSmart
              </div>
            </a>
            <button className={styles.mobileClose} onClick={closeDrawer}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <ul className={styles.mobileNavList}>
            <li><a href="#" onClick={closeDrawer}>Accueil</a></li>
            <li><a href="#" onClick={closeDrawer}>Programme Scolaire</a></li>
            <li><a href="#" onClick={closeDrawer}>Vie Scolaire</a></li>

            <li><a href="#" onClick={closeDrawer}>Contact</a></li>
          </ul>
          <div className={styles.mobileActions}>
            <Link
              href="/authentification"
              className={styles.mobileActionsBtn}
              style={{ background: 'var(--card, #fff)', color: 'var(--ink, #17233F)', border: '1.5px solid var(--line, #E7DFCC)' }}
            >
              Espace Parents
            </Link>

          </div>
        </div>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            {/* ── HERO CONTENT ── */}
            <div className={styles.heroContent} ref={heroContentRef}>
              <div className={styles.heroEyebrow} ref={heroEyebrowRef}>
                <span className={styles.heroEyebrowDot} />
                Inscriptions Ouvertes · Année 2026–2027
              </div>
              <h1 className={styles.heroH1} ref={heroH1Ref}>
                L&apos;excellence,
                <br />
                <em>commence ici</em>
              </h1>
              <p className={styles.heroP} ref={heroPRef}>
                À EduSmart Primary School, nous offrons un environnement
                sûr, bienveillant et stimulant où chaque enfant apprend,
                grandit et développe pleinement son potentiel.
              </p>
             <div className={styles.heroBtns} ref={heroBtnsRef}>
  <a
    href="https://primary-school-two.vercel.app/authentification"
    ref={btnPrimaryRef}
    className={styles.btnHeroPrimary}
  >
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
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
    Connexion
  </a>


</div>
              <div className={styles.heroBadges} ref={heroBadgesRef}>
                <div className={styles.heroBadgeItem}>
                  <div className={`${styles.badgeIcon} ${styles.biBlue}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  Salles Modernes
                </div>
                <div className={styles.heroBadgeItem}>
                  <div className={`${styles.badgeIcon} ${styles.biGreen}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  Enseignants Qualifiés
                </div>
                <div className={styles.heroBadgeItem}>
                  <div className={`${styles.badgeIcon} ${styles.biAmber}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  Campus Sécurisé
                </div>
              </div>
            </div>

            {/* ── HERO VISUAL ── */}
            <div className={styles.heroVisual} ref={heroVisualRef}>
              <div className={styles.heroFrameWrap} ref={heroFrameWrapRef}>
                <div className={styles.dotsDeco} />
                <div className={styles.paperCard} />

                <svg
                  ref={doodleArrowRef}
                  className={styles.doodleArrow}
                  viewBox="0 0 150 110"
                  fill="none"
                >
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

                <div className={styles.heroFrame} ref={heroFrameRef}>
                  <img
                    src="hero.png"
                    srcSet="hero.png 474w, hero.png 736w, hero.png 1200w"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    alt="Élèves de EduSmart en pleine activité"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>

                <div className={styles.stampBadge}>
                  Établi
                  <span>2008</span>
                </div>

                <div className={styles.admissionsFloat} ref={admissionsFloatRef}>
                  <div className={styles.admTop}>
                    <div className={styles.admIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <div>
                      <div className={styles.admTitle}>
                        Admissions
                        <br />
                        2026 – 2027
                      </div>
                      <span className={styles.admBadge}>Places Limitées</span>
                    </div>
                  </div>
                  <button className={styles.admBtn}>
                    Postuler
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>

                <div className={styles.ratingsFloat} ref={ratingsFloatRef}>
                  <div className={styles.stars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span>4.9 / 5</span>
                  <small>200+ avis parents</small>
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <div>
                <div className={styles.statNum} data-target="18">0</div>
                <div className={styles.statLbl}>Ans d&apos;Excellence</div>
              </div>
            </div>
            <div className={styles.statCell}>
              <div className={styles.statIco}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <div className={styles.statNum} data-target="620">0</div>
                <div className={styles.statLbl}>Élèves Épanouis</div>
              </div>
            </div>
            <div className={styles.statCell}>
              <div className={styles.statIco}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <div className={styles.statNum} data-target="48">0</div>
                <div className={styles.statLbl}>Enseignants Certifiés</div>
              </div>
            </div>
            <div className={styles.statCell}>
              <div className={styles.statIco}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <div className={styles.statNum}>12:1</div>
                <div className={styles.statLbl}>Ratio Élèves–Enseignant</div>
              </div>
            </div>
            <div className={styles.statCell}>
              <div className={styles.statIco}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div>
                <div className={styles.statNum} data-target="98">0</div>
                <div className={styles.statLbl}>% Parents Satisfaits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}