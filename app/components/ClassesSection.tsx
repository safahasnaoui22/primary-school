'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './ClassesSection.module.css';
import { classesData } from '@/lib/classesData';

const tools = [
  'calculator',
  'ruler',
  'book',
  'pen-fancy',
  'backpack',
  'globe-americas',
];

const toolColors = [
  '#4a6bff',
  '#ff6b6b',
  '#4cff8f',
  '#ffc04c',
  '#b84cff',
  '#4cc3ff',
];

export default function ClassesSection() {
  return (
    <div className={styles.classsection}>
      {/* Decorative floating icons */}
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

      <div className={styles.headerclasses}>
        <h1 className={styles.h1classes}>
          Les Classes que Nous Proposons
        </h1>

        <p className={styles.pclasses}>
          Découvrez nos classes de la 1ʳᵉ à la 6ᵉ année primaire, où chaque
          enfant apprend, grandit et s&apos;épanouit dans un environnement sûr
          et stimulant.
        </p>
      </div>

      <div className={styles.container}>
        {classesData.map((classItem) => (
          <div
            key={classItem.slug}
            className={styles.box}
          >
            <div
              className={styles.imgBox}
              title={classItem.title}
            >
              <Image
                src={classItem.image}
                alt={classItem.title}
                width={310}
                height={450}
              />
            </div>

            <div className={styles.content}>
              <h2 className={styles.h2classes}>
                {classItem.subtitle}
              </h2>

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