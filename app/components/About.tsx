'use client';

import { useEffect, useRef, useCallback } from 'react';

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const titleCursorRef = useRef<HTMLSpanElement>(null);
  const titleAccentRef = useRef<HTMLSpanElement>(null);
  const dividerRef = useRef<HTMLHRElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const connectorPathsRef = useRef<(SVGPathElement | null)[]>([]);
  const revealObserverRef = useRef<IntersectionObserver | null>(null);
  const sectionObserverRef = useRef<IntersectionObserver | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTypingStarted = useRef(false);

  // ---------- helper: set connector path refs ----------
  const setConnectorPathRef = (index: number) => (el: SVGPathElement | null) => {
    connectorPathsRef.current[index] = el;
  };

  // ---------- split paragraph into words (once) ----------
  useEffect(() => {
    if (!paragraphRef.current) return;
    const p = paragraphRef.current;
    const text = p.textContent?.trim() || '';
    const words = text.split(/\s+/);
    p.innerHTML = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.classList.add('word');
      span.textContent = word;
      span.style.transitionDelay = `${i * 0.06}s`;
      p.appendChild(span);
      if (i < words.length - 1) {
        p.appendChild(document.createTextNode(' '));
      }
    });
  }, []);

  // ---------- reveal / hide all words ----------
  const revealAllWords = useCallback(() => {
    if (!paragraphRef.current) return;
    paragraphRef.current.querySelectorAll('.word').forEach((span) => {
      span.classList.add('is-revealed');
    });
  }, []);

  const hideAllWords = useCallback(() => {
    if (!paragraphRef.current) return;
    paragraphRef.current.querySelectorAll('.word').forEach((span) => {
      span.classList.remove('is-revealed');
    });
  }, []);

  // ---------- typing animation ----------
  const resetTitleForTyping = useCallback(() => {
    if (titleTextRef.current) titleTextRef.current.textContent = '';
    if (titleCursorRef.current) {
      titleCursorRef.current.classList.remove('is-done');
      titleCursorRef.current.style.opacity = '1';
    }
    if (titleAccentRef.current) titleAccentRef.current.classList.remove('is-drawn');
    if (dividerRef.current) dividerRef.current.classList.remove('is-extended');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    hasTypingStarted.current = false;
  }, []);

  const startTypingAnimation = useCallback(() => {
    if (!titleTextRef.current || hasTypingStarted.current) return;
    hasTypingStarted.current = true;
    const textSpan = titleTextRef.current;
    textSpan.textContent = '';
    if (titleCursorRef.current) {
      titleCursorRef.current.classList.remove('is-done');
      titleCursorRef.current.style.opacity = '1';
    }
    if (titleAccentRef.current) titleAccentRef.current.classList.remove('is-drawn');
    if (dividerRef.current) dividerRef.current.classList.remove('is-extended');

    const chars = 'Notre école'.split(''); // <-- French title
    let charIndex = 0;

    const typeNextChar = () => {
      if (charIndex < chars.length) {
        textSpan.textContent += chars[charIndex];
        charIndex++;
        const delay = 70 + Math.random() * 90;
        typingTimeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        hasTypingStarted.current = false;
        if (titleCursorRef.current) {
          titleCursorRef.current.classList.add('is-done');
        }
        setTimeout(() => {
          if (titleAccentRef.current) titleAccentRef.current.classList.add('is-drawn');
          if (dividerRef.current) dividerRef.current.classList.add('is-extended');
        }, 400);
      }
    };

    typingTimeoutRef.current = setTimeout(typeNextChar, 120);
  }, []);

  // ---------- connector path animation ----------
  const drawConnectorPath = useCallback((path: SVGPathElement | null) => {
    if (!path) return;
    path.classList.remove('is-reset');
    path.classList.add('is-drawing');
  }, []);

  const resetConnectorPath = useCallback((path: SVGPathElement | null) => {
    if (!path) return;
    path.classList.remove('is-drawing');
    path.classList.add('is-reset');
  }, []);

  // ---------- main intersection observers ----------
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      if (titleAccentRef.current) titleAccentRef.current.classList.add('is-drawn');
      if (dividerRef.current) dividerRef.current.classList.add('is-extended');
      revealAllWords();
      connectorPathsRef.current.forEach((path) => {
        if (path) {
          path.classList.add('is-drawing');
          path.classList.remove('is-reset');
        }
      });
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const revealElements = section.querySelectorAll<HTMLElement>('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            el.classList.remove('is-hidden');

            if (el.classList.contains('card')) {
              const path = el.querySelector<SVGPathElement>('.card__connector path');
              if (path) {
                const cardDelay = parseFloat(el.style.transitionDelay) || 0;
                setTimeout(() => drawConnectorPath(path), cardDelay * 1000 + 100);
              }
            }
          } else {
            el.classList.remove('is-visible');
            el.classList.add('is-hidden');

            if (el.classList.contains('card')) {
              const path = el.querySelector<SVGPathElement>('.card__connector path');
              if (path) resetConnectorPath(path);
            }
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -50px 0px" }
    );
    revealElements.forEach((el) => {
      if (el.dataset.reveal === 'right') {
        const siblingIndex = Array.from(el.parentElement?.children || []).indexOf(el);
        el.style.transitionDelay = `${siblingIndex * 0.09}s`;
      }
      revealObserver.observe(el);
    });
    revealObserverRef.current = revealObserver;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            resetTitleForTyping();
            hideAllWords();
            setTimeout(() => startTypingAnimation(), 350);
            setTimeout(() => revealAllWords(), 900);
          } else {
            resetTitleForTyping();
            hideAllWords();
            connectorPathsRef.current.forEach((path) => resetConnectorPath(path));
            if (titleAccentRef.current) titleAccentRef.current.classList.remove('is-drawn');
            if (dividerRef.current) dividerRef.current.classList.remove('is-extended');
          }
        });
      },
      { threshold: 0.08 }
    );
    sectionObserver.observe(section);
    sectionObserverRef.current = sectionObserver;

    const rect = section.getBoundingClientRect();
    const isInitiallyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInitiallyVisible) {
      setTimeout(() => {
        resetTitleForTyping();
        startTypingAnimation();
        setTimeout(() => revealAllWords(), 900);
      }, 400);
    }

    connectorPathsRef.current.forEach((path) => {
      if (path) {
        const length = path.getTotalLength();
        path.style.setProperty('--path-length', String(length));
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length);
        path.classList.add('is-reset');
      }
    });

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [drawConnectorPath, resetConnectorPath, resetTitleForTyping, startTypingAnimation, revealAllWords, hideAllWords]);

  // ---------- donut segment click -> highlight corresponding card ----------
  const handleDonutClick = (index: number) => {
    const card = document.querySelectorAll<HTMLElement>('.card')[index];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      card.focus({ preventScroll: true });
      card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
      card.style.transform = 'translateX(10px) scale(1.02)';
      card.style.boxShadow = '0 0 0 6px rgba(245,154,61,0.35)';
      setTimeout(() => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.transition = '';
      }, 600);
    }
  };

  // ---------- card click -> highlight donut segment ----------
  const handleCardClick = (index: number) => {
    const segs = document.querySelectorAll<HTMLElement>('.donut__seg');
    if (segs[index]) {
      segs[index].style.transition = 'transform 0.15s ease, filter 0.15s ease';
      segs[index].style.transform = 'scale(1.08)';
      segs[index].style.filter = 'brightness(1.4) saturate(1.5)';
      setTimeout(() => {
        segs[index].style.transform = '';
        segs[index].style.filter = '';
        segs[index].style.transition = '';
      }, 600);
    }
  };

  return (
    <section className="about" id="about-section" ref={sectionRef} aria-labelledby="about-title">
      {/* Animated background */}
      <div className="about__bg" aria-hidden="true">
        <div className="about__bg-dots" />
        <div className="about__bg-shimmer" />
        <div className="about__bg-orb about__bg-orb--1" />
        <div className="about__bg-orb about__bg-orb--2" />
        <div className="about__bg-orb about__bg-orb--3" />
        <div className="about__bg-orb about__bg-orb--4" />
        <div className="about__bg-orb about__bg-orb--5" />
      </div>

      {/* LEFT COLUMN */}
      <div className="about__left reveal" data-reveal="up">
        <p className="badge">À propos de nous</p>
        <h2 className="about__title" id="about-title">
          <span className="about__title-text" ref={titleTextRef}>Notre école </span>
          <span className="about__title-cursor" ref={titleCursorRef} aria-hidden="true">|</span>
          <span className="about__title-accent" ref={titleAccentRef} aria-hidden="true" />
        </h2>
        <hr className="divider" ref={dividerRef} />
        <p className="about__text" ref={paragraphRef}>
          Nous nous engageons à offrir un environnement stimulant et bienveillant où les enfants peuvent apprendre, grandir et s'épanouir. Notre mission est de bâtir une base solide pour un apprentissage tout au long de la vie, fondé sur des valeurs, la créativité et l'excellence.
        </p>
      </div>

      {/* CENTER COLUMN (teacher) */}
      <figure className="about__teacher reveal" data-reveal="scale">
        <img
          src="/teacher.png"
          alt="Enseignant accueillant les élèves à l'école"
        />
      </figure>

      {/* RIGHT COLUMN : INFOGRAPHIC */}
      <div className="info">
        <div className="donut reveal" data-reveal="pop">
          {['01', '02', '03', '04'].map((num, i) => (
            <span
              key={num}
              className={`donut__seg donut__seg--${i + 1}`}
              data-num={num}
              tabIndex={0}
              role="button"
              aria-label={`Segment ${num}`}
              onClick={() => handleDonutClick(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDonutClick(i);
                }
              }}
            />
          ))}
          <p className="donut__label">
            Nos <br />avantages<br />
          </p>
        </div>

        <ul className="cards">
          {[
            {
              title: 'Éducation de qualité',
              text: "Nous offrons une base académique solide avec des méthodes d'enseignement engageantes et efficaces.",
              d: 'M0 30 L90 170 L900 170 L865 145 L900 170 L865 195'
            },
            {
              title: 'Enseignants expérimentés',
              text: 'Nos enseignants passionnés et expérimentés soutiennent la croissance individuelle de chaque enfant.',
              d: 'M0 30 L90 170 L900 170 L865 145 L900 170 L865 195'
            },
            {
              title: 'Environnement sécurisé',
              text: 'Nous garantissons un espace sûr, inclusif et accueillant pour que chaque enfant apprenne et joue.',
              d: 'M0 190 L90 170 L900 170 L865 145 L900 170 L865 195'
            },
            {
              title: 'Apprentissage créatif',
              text: 'Nous mettons l’accent sur le développement scolaire, social, émotionnel et physique.',
              d: 'M0 190 L90 170 L900 170 L865 145 L900 170 L865 195'
            },
          ].map((card, i) => (
            <li key={i}>
              <article
                className={`card card--${i + 1} reveal`}
                data-reveal="right"
                tabIndex={0}
                onClick={() => handleCardClick(i)}
              >
                <h3 className="card__title">{card.title}</h3>
                <p className="card__text">{card.text}</p>
                <svg className="card__connector" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
                  <path ref={setConnectorPathRef(i)} d={card.d} />
                </svg>
              </article>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= STYLES (dark‑background adaption) ================= */}
      <style jsx>{`
        /* ----- Variables (scoped inside .about) ----- */
        .about {
          --bg: transparent;
          --white: #ffffff;
          --dark: #2c2625;
          --orange: #f59a3d;
          --orange-light: #f7b85d;
          --orange-pale: #f9d7a0;
          --text: #ffffff;
          --muted: rgba(255,255,255,0.75);
          --divider: rgba(255,255,255,0.25);
          --badge: rgba(255,255,255,0.12);
          --shadow-soft: 0 18px 40px -22px rgba(0,0,0,0.35);
          --shadow-hover: 0 24px 50px -20px rgba(0,0,0,0.5);
          --circle: 280px;
          --donut: 400px;
          --ring: 60px;
          --ease: cubic-bezier(0.22, 0.68, 0.36, 1);
          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
          --section-height: 100vh;
          display: grid;
          grid-template-columns: minmax(220px, 300px) minmax(150px, 240px) minmax(560px, 1fr);
          align-items: center;
          gap: 24px;
         
          margin: 0 auto;
          padding: 0 48px;
          height: var(--section-height);
          min-height: 680px;
          width: 100%;
          overflow: hidden;
          position: relative;
          isolation: isolate;
        }
.about{
background: linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 40%, var(--navy-soft) 70%, var(--amber-dark) 100%);

}
        /* ----- Animated background (keep subtle) ----- */
        .about__bg {
          position: absolute;
          inset: -80px;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .about__bg-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1.2px, transparent 1.2px);
          background-size: 34px 34px;
          animation: bgDrift 28s linear infinite;
        }
        @keyframes bgDrift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(8px, -6px); }
          50% { transform: translate(-4px, 10px); }
          75% { transform: translate(-10px, -4px); }
          100% { transform: translate(0, 0); }
        }
        .about__bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.15;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          will-change: transform;
        }
        .about__bg-orb--1 {
          width: 340px; height: 340px; background: rgba(245, 154, 61, 0.15);
          top: -8%; left: -5%; animation-name: orbFloat1; animation-duration: 14s;
        }
        .about__bg-orb--2 {
          width: 260px; height: 260px; background: rgba(247, 184, 93, 0.12);
          bottom: -10%; right: -4%; animation-name: orbFloat2; animation-duration: 18s;
        }
        .about__bg-orb--3 {
          width: 200px; height: 200px; background: rgba(249, 215, 160, 0.18);
          top: 40%; left: 55%; animation-name: orbFloat3; animation-duration: 16s;
        }
        .about__bg-orb--4 {
          width: 180px; height: 180px; background: rgba(245, 154, 61, 0.1);
          top: 25%; right: 20%; animation-name: orbFloat4; animation-duration: 20s;
        }
        .about__bg-orb--5 {
          width: 150px; height: 150px; background: rgba(247, 184, 93, 0.12);
          bottom: 15%; left: 30%; animation-name: orbFloat5; animation-duration: 15s;
        }
        @keyframes orbFloat1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(60px, -40px) scale(1.25); } }
        @keyframes orbFloat2 { 0% { transform: translate(0, 0) scale(0.9); } 100% { transform: translate(-50px, 35px) scale(1.3); } }
        @keyframes orbFloat3 { 0% { transform: translate(0, 0) scale(1.1); } 100% { transform: translate(-35px, -50px) scale(0.85); } }
        @keyframes orbFloat4 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(45px, 30px) scale(1.35); } }
        @keyframes orbFloat5 { 0% { transform: translate(0, 0) scale(0.95); } 100% { transform: translate(-40px, -25px) scale(1.2); } }
        .about__bg-shimmer {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 55%);
          animation: shimmerSweep 22s ease-in-out infinite;
        }
        @keyframes shimmerSweep {
          0% { transform: translate(-30%, -30%) rotate(0deg); }
          33% { transform: translate(15%, -15%) rotate(8deg); }
          66% { transform: translate(-10%, 20%) rotate(-5deg); }
          100% { transform: translate(-30%, -30%) rotate(0deg); }
        }

        /* ----- Left column (light text) ----- */
        .about__left { position: relative; z-index: 2; }
        .badge {
          display: inline-block;
          background: var(--badge);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          transition: all 0.4s var(--ease-smooth);
        }
        .badge:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,154,61,0.3); }

        .about__title {
          margin-top: 32px;
          font-size: clamp(38px, 3.4vw, 62px);
          white-space: nowrap;
          font-weight: 800;
          letter-spacing: 0.03em;
          line-height: 1.1;
          text-transform: uppercase;
          position: relative;
          display: inline-block;
        }
        .about__title-text {
          background: linear-gradient(135deg, #ffffff 0%, #b8d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .about__title-accent {
          position: absolute;
          bottom: -6px;
          left: 0;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(200,220,255,0.8), transparent);
          width: 0;
          transition: width 0.9s var(--ease-spring);
          z-index: -1;
        }
        .about__title-accent.is-drawn { width: 100%; }
        .about__title-cursor {
          display: inline-block;
          font-weight: 300;
          color: #ffffff;
          animation: cursorBlink 0.8s step-end infinite;
          margin-left: 2px;
          opacity: 1;
          transition: opacity 0.5s ease;
        }
        .about__title-cursor.is-done {
          animation: cursorBlink 0.8s step-end 3;
          opacity: 0;
          transition: opacity 0.6s ease 2.4s;
        }
        @keyframes cursorBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        .divider {
          border: 0;
          border-top: 1px solid var(--divider);
          margin: 24px 0 28px;
          max-width: 300px;
          transition: max-width 0.8s var(--ease-smooth);
        }
        .divider.is-extended { max-width: 340px; }

        .about__text {
          max-width: 340px;
          font-size: 15px;
          line-height: 1.7;
          color: var(--muted);
        }
        .about__text :global(.word) {
          display: inline-block;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s var(--ease-smooth), transform 0.5s var(--ease-smooth);
        }
        .about__text :global(.word.is-revealed) { opacity: 1; transform: translateY(0); }

        /* ----- Center column (teacher) ----- */
        .about__teacher {
          position: relative; z-index: 2; display: flex; justify-content: center;
          align-items: center; margin-right: -50px; align-self: center; margin-top: -20px;
          animation: teacherFloat 6s ease-in-out infinite;
        }
        .about__teacher img {
          height: 500px; width: auto; object-fit: contain;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.4));
          transition: filter 0.5s var(--ease-smooth);
        }
        .about__teacher:hover img { filter: drop-shadow(0 16px 40px rgba(0,0,0,0.5)); }
        .about__teacher::after {
          content: ""; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 210px; height: 52px; border-radius: 50%; background: var(--badge);
          opacity: 0.25; z-index: -1; animation: shadowPulse 6s ease-in-out infinite;
        }
        @keyframes teacherFloat {
          0%,100% { transform: translateY(0); }
          30% { transform: translateY(-14px); }
          60% { transform: translateY(-6px); }
          85% { transform: translateY(-18px); }
        }
        @keyframes shadowPulse {
          0%,100% { transform: translateX(-50%) scale(1); opacity: 0.25; }
          50% { transform: translateX(-50%) scale(1.08); opacity: 0.4; }
        }

        /* ----- Infographic wrapper ----- */
        .info { position: relative; z-index: 2; display: grid; grid-template-columns: var(--donut) 1fr; align-items: center; gap: 12px; }
        .donut { position: relative; width: var(--donut); height: var(--donut); display: grid; place-items: center; }

        .donut__label {
          position: relative; z-index: 3; display: grid; place-items: center;
          width: var(--circle); height: var(--circle); border-radius: 50%; background: #ffffff;
          box-shadow: var(--shadow-soft); font-size: 34px; font-weight: 800; line-height: 1.2;
          letter-spacing: 0.04em; text-align: center; text-transform: uppercase; color: #1e1e2f;
          transition: box-shadow 0.5s var(--ease-smooth), transform 0.4s var(--ease-spring);
        }
        .donut__label:hover { box-shadow: var(--shadow-hover); transform: scale(1.03); }

        .donut__seg {
          position: absolute; inset: 0; border-radius: 50%; transform-origin: 50% 50%;
          transition: transform 0.25s var(--ease), filter 0.25s var(--ease); cursor: pointer;
          -webkit-mask: radial-gradient(circle at center, transparent 0 calc(var(--circle)/2 - 8px), #000 calc(var(--circle)/2 - 8px) 100%);
          mask: radial-gradient(circle at center, transparent 0 calc(var(--circle)/2 - 8px), #000 calc(var(--circle)/2 - 8px) 100%);
        }
        .donut__seg--1 { background: conic-gradient(from 0deg, #6e7b8c 0 45deg, transparent 45deg 360deg); }
        .donut__seg--2 { background: conic-gradient(from 45deg, var(--orange) 0 45deg, transparent 45deg 360deg); }
        .donut__seg--3 { background: conic-gradient(from 90deg, var(--orange-light) 0 45deg, transparent 45deg 360deg); }
        .donut__seg--4 { background: conic-gradient(from 135deg, var(--orange-pale) 0 45deg, transparent 45deg 360deg); }
        .donut__seg:hover { filter: brightness(1.2) saturate(1.3); transform: scale(1.04); }
        .donut__seg::after {
          content: attr(data-num); position: absolute; top: 50%; left: 50%;
          font-size: 25px; font-weight: 800; letter-spacing: 0.03em; color: #ffffff;
          transition: transform 0.25s var(--ease);
        }
        .donut__seg--1::after { transform: translate(-50%, -50%) rotate(-67.5deg) translate(calc((var(--donut) - var(--ring))/2)) rotate(67.5deg); }
        .donut__seg--2::after { transform: translate(-50%, -50%) rotate(-22.5deg) translate(calc((var(--donut) - var(--ring))/2)) rotate(22.5deg); }
        .donut__seg--3::after { transform: translate(-50%, -50%) rotate(22.5deg) translate(calc((var(--donut) - var(--ring))/2)) rotate(-22.5deg); }
        .donut__seg--4::after { transform: translate(-50%, -50%) rotate(67.5deg) translate(calc((var(--donut) - var(--ring))/2)) rotate(-67.5deg); color: #2c2625; }

        /* ----- Cards & connectors (light text, visible lines) ----- */
        .cards { display: grid; gap: 10px; padding-left: 70px; position: relative; }
        .card {
          position: relative; min-height: 88px; padding: 8px 20px 24px 0;
          display: flex; flex-direction: column; justify-content: center; --c: var(--white); cursor: default;
        }
        .card__title {
          position: relative; z-index: 2; font-size: 16px; font-weight: 700; letter-spacing: 0.01em;
          color: #ffffff; margin-bottom: 4px; transition: color 0.3s var(--ease-smooth);
        }
        .card--4 .card__title { color: #f9d7a0; }
        .card__text {
          position: relative; z-index: 2; max-width: 220px; font-size: 13px; line-height: 1.45;
          color: rgba(255,255,255,0.7); transition: color 0.3s var(--ease-smooth);
        }
        .card__connector { position: absolute; left: -70px; right: 0; bottom: 0; height: 70px; pointer-events: none; overflow: visible; z-index: 1; }
        .card__connector path {
          fill: none; stroke: var(--c); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round;
          transition: stroke-width 0.25s var(--ease), filter 0.25s var(--ease), stroke-dashoffset 0.8s var(--ease-smooth);
        }
        .card--1 { --c: #90a4c4; }
        .card--2 { --c: var(--orange); }
        .card--3 { --c: var(--orange-light); }
        .card--4 { --c: var(--orange-pale); }
        .card--1 { margin-left: -8px; }
        .card--2 { margin-left: 34px; }
        .card--3 { margin-left: 34px; }
        .card--4 { margin-left: -8px; }

        .card:hover,
        .card:focus-visible { transform: translateX(6px); transition: transform 0.3s var(--ease); }
        .card:hover .card__connector path,
        .card:focus-visible .card__connector path { stroke-width: 6.5; filter: brightness(1.3) saturate(1.3); }
        .card:hover .card__title,
        .card:focus-visible .card__title { color: var(--orange); }
        .card__connector path.is-drawing { stroke-dashoffset: 0 !important; }
        .card__connector path.is-reset { stroke-dashoffset: var(--path-length) !important; transition: stroke-dashoffset 0.01s ease !important; }

        /* ----- Scroll animations ----- */
        .reveal {
          opacity: 0;
          transition: opacity 0.65s var(--ease-smooth), transform 0.65s var(--ease-smooth), filter 0.65s var(--ease-smooth);
          will-change: opacity, transform, filter;
        }
        .reveal[data-reveal="up"] { transform: translateY(36px); filter: blur(3px); }
        .reveal[data-reveal="scale"] { transform: translateY(36px) scale(0.94); filter: blur(2px); }
        .reveal[data-reveal="pop"] { transform: scale(0.75) rotate(-12deg); filter: blur(4px); }
        .reveal[data-reveal="right"] { transform: translateX(55px); filter: blur(2px); }
        .reveal.is-visible { opacity: 1; transform: none; filter: blur(0); }
        .reveal.is-hidden { opacity: 0 !important; filter: blur(3px) !important; transition: opacity 0.45s ease, transform 0.45s ease, filter 0.45s ease; }

        /* ----- Responsive ----- */
        @media (max-width: 1440px) {
          .about { --donut: 360px; --circle: 250px; --ring: 54px; padding: 0 40px; gap: 20px; }
          .about__teacher img { height: 460px; }
          .about__teacher { margin-right: -45px; }
          .cards { padding-left: 60px; }
          .card__connector { left: -60px; height: 30px; }
        }
        @media (max-width: 1280px) {
          .about { --donut: 320px; --circle: 220px; --ring: 48px; grid-template-columns: minmax(180px,250px) minmax(130px,190px) minmax(500px,1fr); padding: 0 32px; }
          .about__teacher img { height: 420px; }
          .donut__label { font-size: 28px; }
          .card { min-height: 80px; padding: 6px 16px 20px 0; }
          .card__title { font-size: 15px; }
          .card__text { max-width: 190px; font-size: 12.5px; }
          .cards { padding-left: 52px; gap: 8px; }
          .card__connector { left: -52px; height: 26px; }
        }
        @media (max-width: 1024px) {
          .about { grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 32px; padding: 48px 36px; height: auto; min-height: 100vh; }
          .about__left { max-width: 520px; }
          .divider, .about__text { max-width: none; margin-inline: auto; }
          .about__teacher { margin-right: 0; align-self: center; margin-top: 0; }
          .info { grid-template-columns: 1fr; justify-items: center; gap: 44px; width: 100%; }
          .cards { width: 100%; max-width: 600px; text-align: left; padding-left: 0; }
          .card, .card--1, .card--2, .card--3, .card--4 { margin-left: 0; }
          .card { padding-bottom: 18px; }
          .card__connector { display: none; }
          .card__text { max-width: none; }
          .about__title { white-space: normal; }
          .about__title-accent { display: none; }
        }
        @media (max-width: 768px) {
          .about { padding: 52px 28px; gap: 36px; }
          .about__teacher img { height: 380px; }
          .about__bg-orb--1 { width: 200px; height: 200px; }
          .about__bg-orb--2 { width: 160px; height: 160px; }
          .about__bg-orb--3 { width: 130px; height: 130px; }
          .about__bg-orb--4 { width: 110px; height: 110px; }
          .about__bg-orb--5 { width: 100px; height: 100px; }
        }
        @media (max-width: 480px) {
          .about { --donut: 270px; --circle: 195px; --ring: 42px; padding: 44px 20px; gap: 32px; }
          .about__title { margin-top: 24px; }
          .about__teacher img { height: 320px; }
          .about__teacher::after { width: 160px; height: 40px; }
          .donut__label { font-size: 24px; }
          .donut__seg::after { font-size: 19px; }
          .card { padding: 14px 12px 18px 0; }
          .about__bg-orb { filter: blur(35px); opacity: 0.1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; filter: none; transition: none; }
          .about__bg-orb, .about__bg-dots, .about__bg-shimmer, .about__teacher, .about__teacher::after { animation: none !important; }
          .about__title-cursor { display: none; }
        }
      `}</style>
    </section>
  );
};

export default About;