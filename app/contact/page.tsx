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
          max-width: 640px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }

        .form-card {
          background: var(--paper);
          border-radius: 18px;
          padding: 36px;
          box-shadow: 0 8px 28px rgba(7,27,74,0.08);
        }

        .form-card h2 {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          color: var(--navy);
          margin: 0 0 6px;
        }

        .form-card > p {
          color: var(--text-gray);
          font-size: 14px;
          margin: 0 0 24px;
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-gray);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .field input,
        .field textarea {
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          border: 1px solid #DCE1E8;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .2s ease;
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: var(--gold);
        }

        .submit-btn {
          width: 100%;
          background: var(--navy);
          color: #fff;
          border: none;
          padding: 13px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background .2s ease, transform .15s ease;
        }

        .submit-btn:hover {
          background: #0F2B6A;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .success-note {
          text-align: center;
          padding: 20px;
          color: #4C7C59;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .field-row { grid-template-columns: 1fr; }
          .form-card { padding: 24px; }
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
                      <div className="field">
                        <label>Full name</label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Email</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>Subject</label>
                      <input
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Message</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                    <button className="submit-btn" type="submit" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending...' : 'Send message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}