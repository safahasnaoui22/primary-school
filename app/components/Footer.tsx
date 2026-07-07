'use client';

import { useEffect, useRef } from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.15 }
    );

    const els = [
      sectionRef.current,
      ctaRef.current,
      ...document.querySelectorAll(`.${styles.revealItem}`),
    ];
    els.forEach((el) => el && observer.observe(el));

    return () => {
      els.forEach((el) => el && observer.unobserve(el));
    };
  }, []);

  return (
    <>
      {/* ── CTA BANNER ── */}
      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.ctaInner}>
          <div className={`${styles.ctaText} ${styles.revealItem}`}>
            <h2>Ready to Join the EduSmart Family?</h2>
            <p>Take the first step towards a bright future for your child.</p>
          </div>
          <div
            className={`${styles.ctaActions} ${styles.revealItem}`}
            style={{ animationDelay: '0.2s' }}
          >
            <button className={styles.btnCtaAmber}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Apply Now
            </button>
            <button className={styles.btnCtaGhost}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer} ref={sectionRef}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={`${styles.footerBrand} ${styles.revealItem}`}>
            <div className={styles.footerLogo}>
              <div className={styles.footerLogoMark}>
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
                <div className={styles.fBrandName}>EduSmart</div>
                <div className={styles.fBrandSub}>Primary School</div>
              </div>
            </div>
            <p>
              We are committed to nurturing young minds and building bright
              futures through quality education and holistic development.
            </p>
            <div className={styles.socialRow}>
              <a href="#" aria-label="Facebook">
                <svg
                  width="14"
                  height="14"
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
              <a href="#" aria-label="Twitter">
                <svg
                  width="14"
                  height="14"
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
                  width="14"
                  height="14"
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
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${styles.footerCol} ${styles.revealItem}`}>
            <h5>Quick Links</h5>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Academics</a></li>
              <li><a href="#">Admissions</a></li>
              <li><a href="#">Activities</a></li>
              <li><a href="#">School News</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Programs */}
          <div className={`${styles.footerCol} ${styles.revealItem}`}>
            <h5>Programs</h5>
            <ul>
              <li><a href="#">Kindergarten</a></li>
              <li><a href="#">Primary 1 – 2</a></li>
              <li><a href="#">Primary 3 – 4</a></li>
              <li><a href="#">Primary 5 – 6</a></li>
              <li><a href="#">Clubs &amp; Activities</a></li>
              <li><a href="#">Summer Program</a></li>
            </ul>
          </div>

          {/* Parents */}
          <div className={`${styles.footerCol} ${styles.revealItem}`}>
            <h5>Parents</h5>
            <ul>
              <li><a href="#">Parent Login</a></li>
              <li><a href="#">Student Portal</a></li>
              <li><a href="#">Calendar</a></li>
              <li><a href="#">Get Involved</a></li>
              <li><a href="#">Parent Resources</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={`${styles.footerCol} ${styles.revealItem}`}>
            <h5>Contact Us</h5>
            <div className={styles.fContact}>
              <div className={styles.fContactRow}>
                <svg
                  width="14"
                  height="14"
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
                <span>123 Education Street, Smart City, SC 12345</span>
              </div>
              <div className={styles.fContactRow}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className={styles.fContactRow}>
                <svg
                  width="14"
                  height="14"
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
                <span>info@edusmart.edu</span>
              </div>
              <div className={styles.fContactRow}>
                <svg
                  width="14"
                  height="14"
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
                <span>Mon – Fri: 7:30 AM – 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2025 EduSmart Primary School. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
}