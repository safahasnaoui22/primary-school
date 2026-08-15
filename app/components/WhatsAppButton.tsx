'use client';

export default function WhatsAppButton() {
  const phoneNumber = '21654812998'; // no + or spaces for wa.me links

  return (
    <>
      <style jsx>{`
        .whatsapp-fab {
          position: fixed;
          left: 16px;
          bottom: 20px;
          z-index: 9997;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #25d366;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
          text-decoration: none;
        }
        .whatsapp-fab svg {
          width: 24px;
          height: 24px;
          position: relative;
          z-index: 2;
        }
        .whatsapp-fab .wave {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #25d366;
          opacity: 0.55;
          animation: soft-wave 2.4s ease-out infinite;
        }
        .whatsapp-fab .wave--delay {
          animation-delay: 1.2s;
        }
        @keyframes soft-wave {
          0% {
            transform: scale(1);
            opacity: 0.45;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .whatsapp-fab .wave {
            animation: none;
            display: none;
          }
        }
      `}</style>

      <a
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Contact us on WhatsApp"
      >
        <span className="wave" aria-hidden="true" />
        <span className="wave wave--delay" aria-hidden="true" />
        <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2Zm5.8 14.09c-.24.68-1.19 1.25-1.95 1.41-.52.11-1.2.2-3.48-.75-2.92-1.21-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2 .9 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.29.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.16-.19.7-.81.88-1.09.19-.29.37-.24.62-.14.26.1 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.35Z" />
        </svg>
      </a>
    </>
  );
}