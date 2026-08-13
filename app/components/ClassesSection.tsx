'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ClassesSection.module.css';
import { classesData } from '@/lib/classesData';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const tools = ['calculator', 'ruler', 'book', 'pen-fancy', 'backpack', 'globe-americas'];
const toolColors = ['#4a6bff', '#ff6b6b', '#4cff8f', '#ffc04c', '#b84cff', '#4cc3ff'];

export default function ClassesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play reverse play reverse',
        },
      });

      boxRefs.current.forEach((box, i) => {
        if (!box) return;
        gsap.from(box, {
          opacity: 0,
          y: 60,
          scale: 0.96,
          duration: 0.7,
          delay: (i % 3) * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: box,
            start: 'top 90%',
            toggleActions: 'play reverse play reverse',
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.classsection} ref={sectionRef}>
      {/* Decorative floating icons — now scoped to this section only */}
      <div className={styles.toolsLayer} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <i
            key={i}
            className={`fas fa-${tools[i % tools.length]} ${styles.floatingTools}`}
            style={{
              color: toolColors[i % toolColors.length],
              fontSize: `${20 + Math.random() * 26}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.headerclasses} ref={headerRef}>
        <h1 className={styles.h1classes}>Les Classes que Nous Proposons</h1>
        <p className={styles.pclasses}>
          Découvrez nos classes de la 1ʳᵉ à la 6ᵉ année primaire, où chaque enfant apprend, grandit et s'épanouit
          dans un environnement sûr et stimulant.
        </p>
      </div>

      <div className={styles.container}>
        {classesData.map((classItem, index) => (
          <div
            key={classItem.slug}
            className={styles.box}
            ref={(el) => {
              boxRefs.current[index] = el;
            }}
          >
            <div className={styles.imgBox} title={classItem.title}>
              <Image src={classItem.image} alt={classItem.title} width={310} height={450} />
            </div>
            <div className={styles.content}>
              <h2 className={styles.h2classes}>{classItem.subtitle}</h2>
              <p>{classItem.description}</p>
             <Link
  href={`/classes/${classItem.slug}`}
  className={styles.ghostBtn}
  onClick={(e) => e.stopPropagation()}
>
  En savoir plus
</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}