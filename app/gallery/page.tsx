'use client';

import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { img: 'https://i.pinimg.com/736x/be/bb/e4/bebbe47b6ebb9f6c392a744e58c835a4.jpg' },
  { img: 'https://i.pinimg.com/1200x/e0/f9/ce/e0f9ceb1f3c6c08f3c5bc1d5875a82a1.jpg' },
  { img: 'https://i.pinimg.com/736x/39/99/f7/3999f75b6a7115c86816edcf0b971103.jpg' },
  { img: 'https://i.pinimg.com/1200x/e8/5d/19/e85d19a82e1620f0a7494db78a51ab4d.jpg' },
  { img: 'https://i.pinimg.com/1200x/8e/23/14/8e23147d8a346240f4b8ab43e6fa60c7.jpg' },
  { img: 'https://i.pinimg.com/1200x/18/34/b0/1834b08aa77109ede7a8fce77daf1102.jpg' },
  { img: 'https://i.pinimg.com/736x/9e/34/44/9e34447b5d8a2dad007bef6ec8a9da2f.jpg' },
  { img: 'https://i.pinimg.com/736x/db/e3/cc/dbe3cc05923e524ea659bba0defd7e0c.jpg' },
  { img: 'https://i.pinimg.com/736x/d9/37/a1/d937a1358d58039b36a2d48d4f647aca.jpg' },
  { img: 'https://i.pinimg.com/736x/63/2b/fc/632bfcf25e89b31f1010f3ac5f23201b.jpg' },
];

const SPEED_WHEEL = 0.02;
const SPEED_DRAG = -0.1;

export default function Gallery() {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursor2Ref = useRef<HTMLDivElement | null>(null);

  const progressRef = useRef(50);
  const activeRef = useRef(0);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);

  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTitleVisible(true), 150);

    const items = itemRefs.current;

    const getZindex = (array: unknown[], index: number) =>
      array.map((_, i) => (index === i ? array.length : array.length - Math.abs(index - i)));

    const displayItems = (item: HTMLDivElement, index: number, active: number) => {
      const zIndex = getZindex(items, active)[index];
      item.style.setProperty('--zIndex', String(zIndex));
      item.style.setProperty('--active', String((index - active) / items.length));
    };

    const animate = () => {
      progressRef.current = Math.max(0, Math.min(progressRef.current, 100));
      activeRef.current = Math.floor((progressRef.current / 100) * (items.length - 1));

      items.forEach((item, index) => {
        if (item) displayItems(item, index, activeRef.current);
      });
    };
    animate();

    const handleWheel = (e: WheelEvent) => {
      const wheelProgress = e.deltaY * SPEED_WHEEL;
      progressRef.current += wheelProgress;
      animate();
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (e.type === 'mousemove') {
        const mouseEvent = e as MouseEvent;
        [cursorRef.current, cursor2Ref.current].forEach((cursor) => {
          if (cursor) {
            cursor.style.transform = `translate(${mouseEvent.clientX}px, ${mouseEvent.clientY}px)`;
          }
        });
      }
      if (!isDownRef.current) return;

      let x = 0;
      if ('clientX' in e) {
        x = e.clientX;
      } else if ('touches' in e && e.touches && e.touches[0]) {
        x = e.touches[0].clientX;
      }

      const mouseProgress = (x - startXRef.current) * SPEED_DRAG;
      progressRef.current += mouseProgress;
      startXRef.current = x;
      animate();
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      isDownRef.current = true;
      if ('clientX' in e) {
        startXRef.current = e.clientX;
      } else if ('touches' in e && e.touches && e.touches[0]) {
        startXRef.current = e.touches[0].clientX;
      } else {
        startXRef.current = 0;
      }
    };

    const handleMouseUp = () => {
      isDownRef.current = false;
    };

    document.addEventListener('mousewheel', handleWheel as EventListener);
    document.addEventListener('mousedown', handleMouseDown as EventListener);
    document.addEventListener('mousemove', handleMouseMove as EventListener);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleMouseDown as EventListener);
    document.addEventListener('touchmove', handleMouseMove as EventListener);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      clearTimeout(t);
      document.removeEventListener('mousewheel', handleWheel as EventListener);
      document.removeEventListener('mousedown', handleMouseDown as EventListener);
      document.removeEventListener('mousemove', handleMouseMove as EventListener);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleMouseDown as EventListener);
      document.removeEventListener('touchmove', handleMouseMove as EventListener);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const handleItemClick = (i: number) => {
    progressRef.current = (i / ITEMS.length) * 100 + 10;

    const items = itemRefs.current;
    const getZindex = (array: unknown[], index: number) =>
      array.map((_, idx) => (index === idx ? array.length : array.length - Math.abs(index - idx)));

    progressRef.current = Math.max(0, Math.min(progressRef.current, 100));
    activeRef.current = Math.floor((progressRef.current / 100) * (items.length - 1));

    items.forEach((item, index) => {
      if (!item) return;
      const zIndex = getZindex(items, activeRef.current)[index];
      item.style.setProperty('--zIndex', String(zIndex));
      item.style.setProperty('--active', String((index - activeRef.current) / items.length));
    });
  };

  return (
    <div className="gallery-root">
      <style jsx>{`
        .gallery-root {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          font-family: 'Roboto', serif;
          background: linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 40%, var(--navy-soft) 70%, var(--amber-dark) 100%);
          position: relative;
        }

        .gallery-title {
          position: absolute;
          z-index: 20;
          top: 32px;
          right: 40px;
          text-align: right;
          pointer-events: none;
          opacity: 0;
          transform: translateY(-14px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gallery-title.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .gallery-title .eyebrow {
          display: block;
          font-family: 'Roboto Mono', 'Roboto', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #ffcf66;
          opacity: 0.85;
          margin-bottom: 6px;
        }

  .gallery-title h2 {
  margin: 0;
  font-family: 'Fairytale', 'Georgia', 'Times New Roman', serif;   /* ← changed */
  font-size: clamp(26px, 3.4vw, 44px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1px;
  background: linear-gradient(100deg, #ffffff 0%, #ffe6a8 45%, #ffb400 75%, #ffffff 100%);
  background-size: 250% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 6s ease-in-out infinite;
}
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .gallery-title .underline {
          margin: 10px 0 0 auto;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, transparent, #ffb400, transparent);
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
        }

        .gallery-title.visible .underline {
          width: 140px;
        }

        @media (max-width: 700px) {
          .gallery-title {
            top: 20px;
            right: 20px;
          }
          .gallery-title.visible .underline {
            width: 90px;
          }
        }

        .gallery-root .carousel {
          position: relative;
          z-index: 1;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
        }

        .gallery-root .carousel-item {
          --items: 10;
          --width: clamp(150px, 30vw, 300px);
          --height: clamp(200px, 40vw, 400px);
          --x: calc(var(--active) * 800%);
          --y: calc(var(--active) * 200%);
          --rot: calc(var(--active) * 120deg);
          --opacity: calc(var(--zIndex) / var(--items) * 3 - 2);
          overflow: hidden;
          position: absolute;
          z-index: var(--zIndex);
          width: var(--width);
          height: var(--height);
          margin: calc(var(--height) * -0.5) 0 0 calc(var(--width) * -0.5);
          border-radius: 10px;
          top: 50%;
          left: 50%;
          user-select: none;
          transform-origin: 0% 100%;
          box-shadow: 0 8px 30px 6px rgba(13, 27, 62, 0.4);
          background: var(--navy);
          pointer-events: all;
          transform: translate(var(--x), var(--y)) rotate(var(--rot));
          transition: transform 0.8s cubic-bezier(0, 0.02, 0, 1);
        }

        .gallery-root .carousel-item .carousel-box {
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 0.8s cubic-bezier(0, 0.02, 0, 1);
          opacity: var(--opacity);
          font-family: 'Orelo-sw-db', serif;
        }

        .gallery-root .carousel-item .carousel-box:before {
          content: '';
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(13, 27, 62, 0.25), rgba(13, 27, 62, 0) 30%, rgba(13, 27, 62, 0) 50%, rgba(13, 27, 62, 0.45));
        }

        .gallery-root .carousel-item .title {
          position: absolute;
          z-index: 1;
          color: var(--white);
          bottom: 20px;
          left: 20px;
          transition: opacity 0.8s cubic-bezier(0, 0.02, 0, 1);
          font-size: clamp(20px, 3vw, 30px);
          text-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
        }

        .gallery-root .carousel-item .num {
          position: absolute;
          z-index: 1;
          color: var(--white);
          top: 10px;
          left: 20px;
          transition: opacity 0.8s cubic-bezier(0, 0.02, 0, 1);
          font-size: clamp(20px, 10vw, 80px);
        }

        .gallery-root .carousel-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        .gallery-root .layout {
          position: absolute;
          z-index: 0;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .gallery-root .layout:before {
          content: '';
          position: absolute;
          z-index: 1;
          top: 0;
          left: 90px;
          width: 10px;
          height: 100%;
          border: 1px solid var(--white);
          border-top: none;
          border-bottom: none;
          opacity: 0.15;
        }

        .gallery-root .layout .box {
          position: absolute;
          bottom: 0;
          left: 30px;
          color: var(--white);
          transform-origin: 0% 10%;
          transform: rotate(-90deg);
          font-size: 9px;
          line-height: 1.4;
          text-transform: uppercase;
          opacity: 0.4;
        }

        .gallery-root .logo {
          position: absolute;
          z-index: 2;
          top: 28px;
          right: 28px;
          width: 30px;
          height: 30px;
          background: var(--white);
          border-radius: 50%;
          opacity: 0.5;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Orelo-sw-db', serif;
          pointer-events: all;
          color: var(--navy);
          text-decoration: none;
          font-size: 20px;
          overflow: hidden;
          padding-bottom: 0.1em;
        }

        .gallery-root .social {
          position: absolute;
          z-index: 10;
          bottom: 20px;
          right: 25px;
          color: var(--white);
          opacity: 0.4;
        }

        .gallery-root .social a {
          display: inline-block;
          margin-left: 3px;
        }

        .gallery-root .social svg {
          --fill: var(--white);
          width: 35px;
          height: 35px;
        }

        .gallery-root .cursor {
          position: fixed;
          z-index: 10;
          top: 0;
          left: 0;
          --size: 40px;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin: calc(var(--size) * -0.5) 0 0 calc(var(--size) * -0.5);
          transition: transform 0.85s cubic-bezier(0, 0.02, 0, 1);
          display: none;
          pointer-events: none;
        }

        @media (pointer: fine) {
          .gallery-root .cursor {
            display: block;
          }
        }

        .gallery-root .cursor2 {
          --size: 2px;
          transition-duration: 0.7s;
        }
      `}</style>

      <div className={`gallery-title ${titleVisible ? 'visible' : ''}`}>
        <span className="eyebrow">Explore</span>
        <h2> Our Gallery</h2>
        <div className="underline" />
      </div>

      <div className="carousel">
        {ITEMS.map((item, i) => (
          <div
            className="carousel-item"
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => handleItemClick(i)}
          >
            <div className="carousel-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.img} alt="" />
            </div>
          </div>
        ))}
      </div>

      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor cursor2" ref={cursor2Ref}></div>
    </div>
  );
}