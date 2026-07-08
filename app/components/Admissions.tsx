'use client';

import { useEffect, useRef, useState } from 'react';
import { Baloo_2, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './admissions.css';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--adm-font-display',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--adm-font-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--adm-font-mono',
});

type Step = {
  number: string;
  title: string;
  description: string;
  icon: JSX.Element;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Prise de contact',
    description:
      "Remplissez le formulaire en ligne ou appelez notre secrétariat. Nous vous présentons le programme et répondons à vos premières questions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3.5 6.5 12 13 20.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Visite & évaluation',
    description:
      "Rencontrez l'équipe pédagogique lors d'une visite du campus. Un test simple nous aide à orienter votre enfant vers la classe adaptée.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 9.5 12.8 12.8 9.5 14.5 11.2 11.2 14.5 9.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '03',
    title: "Dossier d'inscription",
    description:
      'Déposez les documents requis — extrait de naissance, carnet de vaccination, bulletin précédent. Notre équipe vous accompagne à chaque étape.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2.5h8.5A1.5 1.5 0 0 1 21 10v7.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-10Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Confirmation & bienvenue',
    description:
      "Réception de la confirmation d'inscription et du kit de rentrée. Votre enfant rejoint officiellement la famille EduSmart.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 15 7 4l3 8 2-5 2 5 3-8 3 11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15h16v3.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5V15Z" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const PATH_D =
  'M 60 340 C 260 340, 260 100, 420 100 S 620 340, 780 340 S 980 100, 1140 100';

export default function Admissions() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [markerPos, setMarkerPos] = useState({ x: 60, y: 340 });
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handleChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const section = sectionRef.current;
    if (!path || !section) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    if (reduceMotion) {
      path.style.strokeDashoffset = '0';
      setProgress(1);
      const end = path.getPointAtLength(length);
      setMarkerPos({ x: end.x, y: end.y });
      return;
    }

    path.style.strokeDashoffset = `${length}`;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = -rect.height * 0.35;
      const raw = (start - rect.top) / (start - end);
      const clamped = Math.min(Math.max(raw, 0), 1);
      const point = path.getPointAtLength(length * clamped);
      path.style.strokeDashoffset = `${length * (1 - clamped)}`;
      setMarkerPos({ x: point.x, y: point.y });
      setProgress(clamped);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className={`adm-section ${baloo.variable} ${jakarta.variable} ${mono.variable}`}
    >
      <div className="adm-container">
        <span className="adm-eyebrow">Places limitées · Rentrée 2025 – 2026</span>
        <h2 className="adm-heading">Le chemin de votre enfant vers EduSmart</h2>
        <p className="adm-subheading">
          De la première prise de contact au premier jour de classe : quatre étapes
          simples, accompagnées par notre équipe à chaque instant.
        </p>

        <div className="adm-path-wrap">
          <svg
            className="adm-path-svg"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="adm-path-track"
              d={PATH_D}
              fill="none"
            />
            <path
              ref={pathRef}
              className="adm-path-line"
              d={PATH_D}
              fill="none"
            />
            <g
              className="adm-path-marker"
              transform={`translate(${markerPos.x} ${markerPos.y})`}
            >
              <circle r="11" />
              <circle r="4.5" className="adm-path-marker-dot" />
            </g>
          </svg>

          <ol className="adm-steps">
            {steps.map((step, i) => {
              const threshold = i / (steps.length - 1);
              const active = progress >= threshold - 0.08;
              return (
                <li
                  key={step.number}
                  className={`adm-step ${i % 2 === 0 ? 'adm-step-top' : 'adm-step-bottom'} ${
                    active ? 'adm-step-active' : ''
                  } ${i === steps.length - 1 ? 'adm-step-final' : ''}`}
                >
                  <span className="adm-step-number">{step.number}</span>
                  <div className="adm-step-icon">{step.icon}</div>
                  <h3 className="adm-step-title">{step.title}</h3>
                  <p className="adm-step-desc">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <a href="/Inscription" className="adm-cta">
          Commencer l&apos;inscription
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}