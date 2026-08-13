'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import type { ClassInfo } from '@/lib/classesData';
import { getSubjectIcon, getSubjectDescription } from '@/lib/subjectInfo';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const galleryImages = [
  'https://i.pinimg.com/1200x/50/99/10/509910afe7c026ddee800eedcfe01bbc.jpg',
  'https://i.pinimg.com/736x/f6/87/a3/f687a352d082d6f8368dacc5c28af009.jpg',
  'https://i.pinimg.com/736x/f9/bf/3d/f9bf3db0089096ffbf3173952772dca4.jpg',
  'https://i.pinimg.com/736x/99/c8/6b/99c86b3d855879076c52a0fba756dc20.jpg',
  'https://i.pinimg.com/736x/40/ca/9d/40ca9d797fbee2833a2f45a0ab2ae8a0.jpg',
];

const featureCards = [
  {
    icon: 'graduation',
    title: 'Apprentissage avancé',
    text: 'Approfondissement des connaissances dans toutes les matières principales.',
  },
  {
    icon: 'lightbulb',
    title: 'Pensée critique',
    text: 'Développement de la logique, de l\'analyse et de la résolution de problèmes.',
  },
  {
    icon: 'palette',
    title: 'Activités variées',
    text: 'Arts, sport, technologie et projets collaboratifs pour un épanouissement global.',
  },
  {
    icon: 'heart',
    title: 'Accompagnement personnalisé',
    text: 'Suivi individualisé pour aider chaque élève à atteindre son plein potentiel.',
  },
];

function Icon({ name }: { name: string }) {
  const p = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: '#d4a72c', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'graduation':
      return <svg {...p}><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></svg>;
    case 'lightbulb':
      return <svg {...p}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" /></svg>;
    case 'palette':
      return <svg {...p}><path d="M12 3a9 8 0 1 0 0 16c1 0 2-.6 2-2 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.8.7-1.6 1.5-1.6H16a4 4 0 0 0 4-4c0-3.3-3.6-6-8-6Z" /></svg>;
    case 'heart':
      return <svg {...p}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" /></svg>;
    case 'calculator':
      return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 11h1M8 15h1M8 19h1M12 11h1M12 15h1M12 19h1M16 11v8" /></svg>;
    case 'book':
      return <svg {...p}><path d="M4 5c3-1.5 6-1.5 8 0v14c-2-1.5-5-1.5-8 0V5Z" /><path d="M20 5c-3-1.5-6-1.5-8 0v14c2-1.5 5-1.5 8 0V5Z" /></svg>;
    case 'flask':
      return <svg {...p}><path d="M9 2v6L4 19a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 19l-5-11V2" /><path d="M8.5 2h7M6 14h12" /></svg>;
    case 'map':
      return <svg {...p}><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>;
    case 'runner':
      return <svg {...p}><circle cx="15" cy="4" r="2" /><path d="m8 21 2-5 3-2-1-4-4 1-2 4M13 10l3 2 3-1M6 14l3 2" /></svg>;
    case 'globe':
      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
    case 'laptop':
      return <svg {...p}><rect x="4" y="4" width="16" height="10" rx="1" /><path d="M2 18h20" /></svg>;
    case 'target':
      return <svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" /></svg>;
    default:
      return <svg {...p}><path d="m12 3 2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3-5.4 3 1.3-6-4.6-4.2 6.1-.6L12 3Z" /></svg>;
  }
}

export default function ClassDetailClient({
  classInfo,
  otherClasses,
}: {
  classInfo: ClassInfo;
  otherClasses: ClassInfo[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return; // leave everything in its natural, fully-visible state

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.cd-breadcrumb', { opacity: 0, y: -10, duration: 0.5 })
        .from('.cd-badge', { opacity: 0, y: -10, duration: 0.5 }, '-=0.3')
        .from('.cd-title', { opacity: 0, y: 24, duration: 0.7 }, '-=0.2')
        .from('.cd-subtitle', { opacity: 0, y: 16, duration: 0.6 }, '-=0.35')
        .from('.cd-description', { opacity: 0, y: 16, duration: 0.6 }, '-=0.35')
        .from('.cd-cta-hero', { opacity: 0, y: 12, duration: 0.5 }, '-=0.3')
        .from('.cd-hero-image-wrap', { opacity: 0, scale: 0.94, duration: 0.9 }, '-=0.6')
        .from('.cd-orbit', { opacity: 0, scale: 0.8, duration: 1, stagger: 0.15 }, '-=0.7')
        .from('.cd-floating-badge', { opacity: 0, y: 16, duration: 0.5 }, '-=0.4');

      gsap.utils.toArray<HTMLElement>('.cd-reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('.cd-stagger-group').forEach((group) => {
        gsap.from(group.children, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 88%', once: true },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [classInfo]);

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div ref={rootRef} className="cd-page">
      <style>{`
        :root {
          --navy-deep: #0d1b3e;
          --navy-mid: #1b2f5e;
          --soft-blue: #2a4080;
          --gold: #d4a72c;
          --gold-light: #f4e7bd;
          --white: #ffffff;
          --bg: #f8fafc;
          --text: #1e293b;
          --muted: #64748b;
        }

        .cd-page {
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
        }

        .cd-serif {
          font-family: 'Fraunces', 'Georgia', serif;
        }

        /* ── Hero ── */
        .cd-hero {
          background: linear-gradient(150deg, var(--navy-deep), var(--navy-mid) 60%, var(--soft-blue));
          padding: 56px 6% 100px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 56px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .cd-breadcrumb {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          margin-bottom: 20px;
        }
        .cd-breadcrumb a {
          color: var(--gold-light);
          text-decoration: none;
        }

        .cd-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(212,167,44,0.12);
          border: 1px solid rgba(212,167,44,0.4);
          color: var(--gold-light);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 7px 16px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .cd-title {
          font-size: clamp(34px, 4.6vw, 54px);
          font-weight: 600;
          color: var(--white);
          line-height: 1.12;
          margin: 0 0 12px;
        }

        .cd-subtitle {
          font-size: 18px;
          color: var(--gold-light);
          font-weight: 500;
          margin: 0 0 18px;
        }

        .cd-description {
          font-size: 15.5px;
          line-height: 1.75;
          color: rgba(255,255,255,0.78);
          max-width: 480px;
          margin: 0 0 32px;
        }

        .cd-cta-hero {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--gold), #c99424);
          color: var(--navy-deep);
          font-weight: 700;
          font-size: 15px;
          padding: 14px 30px;
          border-radius: 30px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(212,167,44,0.25);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cd-cta-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(212,167,44,0.35);
        }

        .cd-hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cd-orbit {
          position: absolute;
          border: 1px dashed rgba(212,167,44,0.35);
          border-radius: 50%;
          pointer-events: none;
        }
        .cd-orbit-1 { width: 105%; height: 105%; animation: cd-spin 40s linear infinite; }
        .cd-orbit-2 { width: 118%; height: 118%; animation: cd-spin 60s linear infinite reverse; }
        @keyframes cd-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cd-orbit-1, .cd-orbit-2 { animation: none; }
        }

        .cd-hero-image-wrap {
          position: relative;
          width: 100%;
          max-width: 440px;
          aspect-ratio: 4/4.4;
          border-radius: 58% 42% 53% 47% / 55% 45% 58% 42%;
          overflow: hidden;
          box-shadow: 0 30px 70px rgba(0,0,0,0.35);
          border: 4px solid rgba(212,167,44,0.25);
        }
        .cd-hero-image-wrap img { object-fit: cover; }

        .cd-floating-badge {
          position: absolute;
          bottom: 14px;
          left: -18px;
          background: var(--white);
          border-radius: 16px;
          padding: 12px 18px;
          box-shadow: 0 14px 30px rgba(13,27,62,0.2);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cd-floating-badge .dot {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--gold-light);
          display: flex; align-items: center; justify-content: center;
        }
        .cd-floating-badge .label {
          font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px;
        }
        .cd-floating-badge .value {
          font-size: 14px; font-weight: 700; color: var(--navy-deep);
        }

        /* ── Feature cards ── */
        .cd-section { max-width: 1120px; margin: 0 auto; padding: 0 6%; }
        .cd-features {
          max-width: 1120px;
          margin: -56px auto 90px;
          padding: 0 6%;
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 20px;
        }
        .cd-feature-card {
          background: var(--white);
          border: 1px solid #eef1f6;
          border-radius: 18px;
          padding: 26px 22px;
          box-shadow: 0 10px 30px rgba(13,27,62,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .cd-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 44px rgba(13,27,62,0.12);
          border-color: rgba(212,167,44,0.4);
        }
        .cd-feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: var(--navy-deep);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .cd-feature-card h3 {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          color: var(--navy-deep);
          margin: 0 0 8px;
        }
        .cd-feature-card p {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.6;
          margin: 0;
        }

        /* ── Subjects + objectives ── */
        .cd-two-col {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          margin: 90px auto;
        }
        .cd-section-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
          display: block;
        }
        .cd-section-title {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          color: var(--navy-deep);
          margin: 0 0 26px;
        }

        .cd-subject-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 0;
          border-bottom: 1px solid #eef1f6;
        }
        .cd-subject-row:last-child { border-bottom: none; }
        .cd-subject-icon {
          width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
          background: var(--gold-light);
          display: flex; align-items: center; justify-content: center;
        }
        .cd-subject-row h4 {
          font-size: 14.5px; font-weight: 700; color: var(--navy-deep); margin: 0 0 3px;
        }
        .cd-subject-row p {
          font-size: 13px; color: var(--muted); margin: 0; line-height: 1.5;
        }

        .cd-objectives-card {
          background: linear-gradient(160deg, var(--navy-deep), var(--soft-blue));
          border-radius: 22px;
          padding: 32px 28px;
          color: var(--white);
        }
        .cd-objectives-card .cd-section-title { color: var(--white); }
        .cd-objective-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          font-size: 14px;
          line-height: 1.55;
          color: rgba(255,255,255,0.9);
        }
        .cd-objective-item:last-child { border-bottom: none; }
        .cd-check {
          flex-shrink: 0;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--gold);
          color: var(--navy-deep);
          font-size: 11px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }

        /* ── Practical info ── */
        .cd-info-card {
          background: var(--white);
          border: 1px solid #eef1f6;
          border-radius: 20px;
          padding: 32px;
          margin: 0 auto 90px;
          box-shadow: 0 10px 30px rgba(13,27,62,0.05);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 22px;
        }
        .cd-info-item { display: flex; gap: 14px; align-items: flex-start; }
        .cd-info-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: var(--gold-light);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cd-info-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 3px; }
        .cd-info-value { font-size: 14.5px; font-weight: 700; color: var(--navy-deep); }

        /* ── Swiper gallery ── */
        .cd-gallery-section { margin: 0 auto 100px; max-width: 1120px; padding: 0 6%; }
        .cd-gallery-swiper {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(13,27,62,0.18);
        }
        .cd-gallery-swiper .swiper-slide {
          aspect-ratio: 16/7;
          position: relative;
        }
        .cd-gallery-swiper .swiper-slide img {
          transition: transform 6s ease;
          transform: scale(1.02);
        }
        .cd-gallery-swiper .swiper-slide-active img {
          transform: scale(1.08);
        }
        .cd-gallery-swiper :global(.swiper-pagination-bullet) {
          background: var(--gold);
          opacity: 0.5;
        }
        .cd-gallery-swiper :global(.swiper-pagination-bullet-active) {
          opacity: 1;
        }
        .cd-gallery-swiper :global(.swiper-button-next),
        .cd-gallery-swiper :global(.swiper-button-prev) {
          color: var(--white);
          background: rgba(13,27,62,0.4);
          width: 42px; height: 42px; border-radius: 50%;
        }
        .cd-gallery-swiper :global(.swiper-button-next::after),
        .cd-gallery-swiper :global(.swiper-button-prev::after) {
          font-size: 16px;
        }

        /* ── Final CTA ── */
        .cd-final-cta {
          position: relative;
          background: linear-gradient(150deg, var(--navy-deep), var(--navy-mid));
          padding: 90px 6%;
          text-align: center;
          overflow: hidden;
        }
        .cd-final-cta::before, .cd-final-cta::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(212,167,44,0.25);
        }
        .cd-final-cta::before { width: 320px; height: 320px; top: -140px; left: -80px; }
        .cd-final-cta::after { width: 260px; height: 260px; bottom: -120px; right: -60px; }
        .cd-final-cta h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(26px, 3.6vw, 38px);
          color: var(--white);
          margin: 0 0 14px;
          position: relative; z-index: 1;
        }
        .cd-final-cta p {
          color: rgba(255,255,255,0.75);
          font-size: 15.5px;
          max-width: 480px;
          margin: 0 auto 34px;
          position: relative; z-index: 1;
        }
        .cd-final-cta .cd-cta-hero { position: relative; z-index: 1; }

        @media (max-width: 900px) {
          .cd-hero { grid-template-columns: 1fr; padding: 44px 6% 70px; }
          .cd-two-col { grid-template-columns: 1fr; }
          .cd-features { margin-top: -30px; }
        }
      `}</style>

      {/* Hero */}
      <section className="cd-hero">
        <div>
          <div className="cd-breadcrumb">
            <Link href="/">Accueil</Link> / <Link href="/#classes">Classes</Link> / {classInfo.title}
          </div>
          <span className="cd-badge">Programme scolaire</span>
          <h1 className="cd-title cd-serif">{classInfo.title}</h1>
          <p className="cd-subtitle">{classInfo.subtitle}</p>
          <p className="cd-description">{classInfo.description}</p>
          <Link href="/Inscription" className="cd-cta-hero">
            S'inscrire pour cette classe →
          </Link>
        </div>

        <div className="cd-hero-visual">
          <span className="cd-orbit cd-orbit-1" />
          <span className="cd-orbit cd-orbit-2" />
          <div className="cd-hero-image-wrap">
            <Image src={classInfo.image} alt={classInfo.title} fill sizes="(max-width: 900px) 100vw, 480px" />
          </div>
          <div className="cd-floating-badge">
            <span className="dot">
              <Icon name="graduation" />
            </span>
            <div>
              <div className="label">Âge moyen</div>
              <div className="value">{classInfo.ageRange}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <div className="cd-features cd-stagger-group">
        {featureCards.map((f) => (
          <div key={f.title} className="cd-feature-card">
            <div className="cd-feature-icon">
              <Icon name={f.icon} />
            </div>
            <h3 className="cd-serif">{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>

      {/* Subjects + Objectives */}
      <div className="cd-section cd-two-col">
        <div className="cd-reveal">
          <span className="cd-section-eyebrow">Programme</span>
          <h2 className="cd-section-title">Matières enseignées</h2>
          <div className="cd-stagger-group">
            {classInfo.subjects.map((subject) => (
              <div key={subject} className="cd-subject-row">
                <div className="cd-subject-icon">
                  <Icon name={getSubjectIcon(subject)} />
                </div>
                <div>
                  <h4>{subject}</h4>
                  <p>{getSubjectDescription(subject)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-objectives-card cd-reveal">
          <span className="cd-section-eyebrow">Pédagogie</span>
          <h2 className="cd-section-title">Objectifs de l'année</h2>
          <div className="cd-stagger-group">
            {classInfo.highlights.map((h, i) => (
              <div key={i} className="cd-objective-item">
                <span className="cd-check">✓</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Practical info */}
      <div className="cd-section">
        <div className="cd-info-card cd-reveal">
          <div className="cd-info-item">
            <span className="cd-info-icon"><Icon name="graduation" /></span>
            <div>
              <div className="cd-info-label">Âge</div>
              <div className="cd-info-value">{classInfo.ageRange}</div>
            </div>
          </div>
          <div className="cd-info-item">
            <span className="cd-info-icon"><Icon name="target" /></span>
            <div>
              <div className="cd-info-label">Effectif par classe</div>
              <div className="cd-info-value">Max. 20 élèves</div>
            </div>
          </div>
          <div className="cd-info-item">
            <span className="cd-info-icon"><Icon name="book" /></span>
            <div>
              <div className="cd-info-label">Horaire</div>
              <div className="cd-info-value">Lun – Ven · 08h00 – 14h30</div>
            </div>
          </div>
          <div className="cd-info-item">
            <span className="cd-info-icon"><Icon name="heart" /></span>
            <div>
              <div className="cd-info-label">Encadrement</div>
              <div className="cd-info-value">Enseignants qualifiés et bienveillants</div>
            </div>
          </div>
        </div>
      </div>


      {/* Final CTA */}
      <section className="cd-final-cta">
        <h2 className="cd-reveal">Prêt à rejoindre la {classInfo.title} ?</h2>
        <p className="cd-reveal">
          Offrez à votre enfant un environnement stimulant pour apprendre, grandir et réussir.
        </p>
        <Link href="/Inscription" className="cd-cta-hero cd-reveal">
          S'inscrire maintenant →
        </Link>
      </section>
    </div>
  );
}