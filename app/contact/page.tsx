'use client';

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity .7s ease ${delay}s, transform .7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const contactCards = [
  {
    label: 'Visit us',
    value: '124 Willow Grove Ave, Springfield',
    sub: 'Main entrance via the east gate',
    icon: 'pin',
  },
  {
    label: 'Call us',
    value: '(555) 019-2044',
    sub: 'Mon–Fri, 8:00 AM – 4:00 PM',
    icon: 'phone',
  },
  {
    label: 'Email us',
    value: 'hello@yourschool.edu',
    sub: 'Replies within 1 business day',
    icon: 'mail',
  },
  {
    label: 'Office hours',
    value: '8:00 AM – 4:00 PM',
    sub: 'Closed weekends & holidays',
    icon: 'clock',
  },
];

function IconGlyph({ name }: { name: string }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#071B4A', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'pin':
      return <svg {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>;
    case 'phone':
      return <svg {...p}><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" /></svg>;
    case 'mail':
      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
    case 'clock':
      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    default:
      return null;
  }
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Wire this to a real /api/contact route once you have one —
    // for now this just simulates a send so the UI flow is complete.
    await new Promise((r) => setTimeout(r, 900));
    setStatus('sent');
  };

  return (
    <>
      <Head>
        <title>Contact us</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        .contact-page {
          --navy: #071B4A;
          --gold: #FFB400;
          --paper: #FDFBF6;
          --bg: #F4F5F8;
          --text-gray: #5A6A7A;
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          min-height: 100vh;
        }

        .contact-hero {
          text-align: center;
          padding: 64px 24px 32px;
          max-width: 560px;
          margin: 0 auto;
        }

        .contact-hero .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--navy);
          opacity: 0.6;
        }

        .contact-hero h1 {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: clamp(30px, 4.5vw, 46px);
          color: var(--navy);
          margin: 8px 0 10px;
        }

        .contact-hero p {
          color: var(--text-gray);
          font-size: 15px;
        }

        .map-wrap {
          max-width: 1000px;
          margin: 0 auto 48px;
          padding: 0 24px;
        }

        .map-frame {
          width: 100%;
          aspect-ratio: 16/6;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(7,27,74,0.14);
          border: 4px solid #fff;
        }

        .map-frame iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }

        .cards-wrap {
          max-width: 1000px;
          margin: 0 auto 60px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 20px;
        }

        .ticket-card {
          position: relative;
          background: var(--paper);
          border-radius: 14px;
          padding: 22px 20px 20px;
          box-shadow: 0 4px 16px rgba(7,27,74,0.08);
        }

        .ticket-card::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 44px;
          border-top: 2px dashed #E0E0E0;
        }

        .ticket-card::before {
          content: '';
          position: absolute;
          left: -8px;
          bottom: 36px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--bg);
        }

        .ticket-notch-right {
          position: absolute;
          right: -8px;
          bottom: 36px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--bg);
        }

        .ticket-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #FFF3D6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .ticket-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--gold);
          font-weight: 600;
        }

        .ticket-value {
          font-family: 'Fraunces', serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--navy);
          margin: 6px 0 34px;
          line-height: 1.4;
        }

        .ticket-sub {
          font-size: 12px;
          color: var(--text-gray);
        }

        .form-section {
          max-width: 920px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }

        .form-card {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          background: var(--paper);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(7,27,74,0.12);
        }

        .form-illustration {
          position: relative;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          color: #fff;
        }

        .form-illustration-bg {
          position: absolute;
          inset: 0;
          background-image: url('/contact-bg.jpg');
          background-size: cover;
          background-position: center;
          filter: blur(1.5px) brightness(0.75);
          transform: scale(1.05);
          z-index: 0;
        }

        .form-illustration-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(7,27,74,0.92), rgba(15,43,106,0.82));
          z-index: 1;
        }

        .form-illustration::before,
        .form-illustration::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(255,180,0,0.1);
          z-index: 1;
        }

        .form-illustration::before {
          width: 180px;
          height: 180px;
          top: -60px;
          right: -60px;
        }

        .form-illustration::after {
          width: 120px;
          height: 120px;
          bottom: -40px;
          left: -30px;
          background: rgba(255,255,255,0.06);
        }

        .form-illustration-top,
        .plane-scene,
        .form-illustration-bottom {
          position: relative;
          z-index: 2;
        }

        .form-illustration-top .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--gold);
        }

        .form-illustration-top h3 {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          font-weight: 600;
          margin: 10px 0 12px;
          line-height: 1.3;
        }

        .form-illustration-top p {
          font-size: 13.5px;
          color: rgba(255,255,255,0.85);
          line-height: 1.6;
        }

        .plane-scene {
          height: 90px;
          margin: 20px 0;
        }

        .plane-dots {
          position: absolute;
          top: 44px;
          left: 10px;
          right: 30px;
          border-top: 2px dashed rgba(255,255,255,0.3);
        }

        .plane-icon {
          position: absolute;
          top: 20px;
          animation: fly 3.5s ease-in-out infinite;
        }

        @keyframes fly {
          0%   { left: 0%;  transform: translateY(0) rotate(0deg); }
          50%  { left: 78%; transform: translateY(-10px) rotate(4deg); }
          100% { left: 0%;  transform: translateY(0) rotate(0deg); }
        }

        .form-illustration-bottom {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 16px;
        }

        .form-illustration-bottom .row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.9);
        }

        .form-panel {
          padding: 36px 40px;
        }

        .form-panel h2 {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          color: var(--navy);
          margin: 0 0 6px;
        }

        .form-panel > p {
          color: var(--text-gray);
          font-size: 14px;
          margin: 0 0 26px;
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .input-box {
          position: relative;
          margin-bottom: 26px;
        }

        .input-box input,
        .input-box textarea {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid #DCE1E8;
          outline: none;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          color: var(--navy);
          padding: 8px 0 8px 2px;
          transition: border-color .3s ease;
          resize: none;
        }

        .input-box textarea {
          border: 1.5px solid #DCE1E8;
          border-radius: 8px;
          padding: 12px;
        }

        .input-box input:focus,
        .input-box input:valid,
        .input-box textarea:focus,
        .input-box textarea:valid {
          border-color: var(--gold);
        }

        .input-box label {
          position: absolute;
          top: 8px;
          left: 2px;
          font-size: 14px;
          color: var(--text-gray);
          pointer-events: none;
          transition: all .3s ease;
        }

        .input-box.textarea-box label {
          top: -9px;
          left: 12px;
          background: var(--paper);
          padding: 0 6px;
          font-size: 12px;
          color: var(--gold);
        }

        .input-box input:focus ~ label,
        .input-box input:valid ~ label {
          top: -14px;
          font-size: 12px;
          color: var(--gold);
          font-weight: 600;
        }

        .submit-btn {
          width: 100%;
          background: var(--gold);
          color: var(--navy);
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,180,0,0.35);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .success-note {
          text-align: center;
          padding: 60px 32px;
          color: #4C7C59;
          font-weight: 600;
          font-size: 15px;
        }

        @media (max-width: 760px) {
          .form-card { grid-template-columns: 1fr; }
          .form-illustration { padding: 32px 28px; }
          .field-row { grid-template-columns: 1fr; }
          .form-panel { padding: 28px 24px; }
        }

        @media (max-width: 600px) {
          .map-frame { aspect-ratio: 4/5; }
        }
      `}</style>

      <div className="contact-page">
        <Reveal>
          <div className="contact-hero">
            <span className="eyebrow">We'd love to hear from you</span>
            <h1>Get in touch</h1>
            <p>Questions about admissions, a visit, or anything else — reach out any way that's easiest for you.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="map-wrap">
            <div className="map-frame">
              <iframe
                title="School location"
                loading="lazy"
                src="https://www.google.com/maps?q=Springfield&output=embed"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>

        <div className="cards-wrap">
          {contactCards.map((c, i) => (
            <Reveal key={c.label} delay={0.05 * i}>
              <div className="ticket-card">
                <span className="ticket-notch-right" />
                <div className="ticket-icon">
                  <IconGlyph name={c.icon} />
                </div>
                <div className="ticket-label">{c.label}</div>
                <div className="ticket-value">{c.value}</div>
                <div className="ticket-sub">{c.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="form-section">
            <div className="form-card">
              <div className="form-illustration">
                <div className="form-illustration-bg" />
                <div className="form-illustration-overlay" />

                <div className="form-illustration-top">
                  <span className="eyebrow">Direct line to our office</span>
                  <h3>Your message reaches a real person, same day.</h3>
                  <p>No ticket numbers, no auto-replies — just our front office team, ready to help.</p>
                </div>

                <div className="plane-scene">
                  <div className="plane-dots" />
                  <svg className="plane-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFB400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
                  </svg>
                </div>

                <div className="form-illustration-bottom">
                  <div className="row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB400" strokeWidth="1.8"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" /></svg>
                    (555) 019-2044
                  </div>
                  <div className="row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB400" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                    hello@yourschool.edu
                  </div>
                </div>
              </div>

              <div className="form-panel">
                {status === 'sent' ? (
                  <div className="success-note">
                    Thanks — your message is in. We'll get back to you within one business day.
                  </div>
                ) : (
                  <>
                    <h2>Send us a message</h2>
                    <p>Fill this out and our office will follow up directly.</p>
                    <form onSubmit={handleSubmit}>
                      <div className="field-row">
                        <div className="input-box">
                          <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                          <label>Full name</label>
                        </div>
                        <div className="input-box">
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                          <label>Email</label>
                        </div>
                      </div>

                      <div className="input-box">
                        <input
                          required
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        />
                        <label>Subject</label>
                      </div>

                      <div className="input-box textarea-box">
                        <label>Message</label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                      </div>

                      <button className="submit-btn" type="submit" disabled={status === 'sending'}>
                        {status === 'sending' ? 'Sending...' : (
                          <>
                            Send message
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#071B4A" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}