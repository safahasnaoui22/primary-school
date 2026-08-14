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

// Fixed values prevent hydration mismatches.
// Do NOT use Math.random() during render.
const floatingToolStyles = [
  {
    fontSize: 42,
    left: '47%',
    top: '77%',
    animationDelay: '6.4s',
    animationDuration: '19.9s',
  },
  {
    fontSize: 31,
    left: '56%',
    top: '49%',
    animationDelay: '8.1s',
    animationDuration: '11.9s',
  },
  {
    fontSize: 21,
    left: '39%',
    top: '76%',
    animationDelay: '9.3s',
    animationDuration: '14s',
  },
  {
    fontSize: 30,
    left: '74%',
    top: '24%',
    animationDelay: '0.5s',
    animationDuration: '13.4s',
  },
  {
    fontSize: 42,
    left: '56%',
    top: '47%',
    animationDelay: '0.15s',
    animationDuration: '11s',
  },
  {
    fontSize: 22,
    left: '26%',
    top: '35%',
    animationDelay: '7.1s',
    animationDuration: '14.9s',
  },
  {
    fontSize: 27,
    left: '28%',
    top: '51%',
    animationDelay: '0.8s',
    animationDuration: '11.4s',
  },
  {
    fontSize: 26,
    left: '97%',
    top: '64%',
    animationDelay: '2.7s',
    animationDuration: '16.4s',
  },
  {
    fontSize: 32,
    left: '91%',
    top: '94%',
    animationDelay: '2.2s',
    animationDuration: '19s',
  },
  {
    fontSize: 25,
    left: '79%',
    top: '49%',
    animationDelay: '1.4s',
    animationDuration: '19.6s',
  },
  {
    fontSize: 32,
    left: '41%',
    top: '14%',
    animationDelay: '0.6s',
    animationDuration: '17.1s',
  },
  {
    fontSize: 43,
    left: '19%',
    top: '24%',
    animationDelay: '8.8s',
    animationDuration: '13s',
  },
];

export default function ClassesSection() {
  return (
    <div className={styles.classsection}>
      {/* Decorative floating icons */}
      <div className={styles.toolsLayer} aria-hidden="true">
        {floatingToolStyles.map((toolStyle, i) => (
          <i
            key={i}
            className={`fas fa-${tools[i % tools.length]} ${styles.floatingTools}`}
            style={{
              color: toolColors[i % toolColors.length],
              fontSize: `${toolStyle.fontSize}px`,
              left: toolStyle.left,
              top: toolStyle.top,
              animationDelay: toolStyle.animationDelay,
              animationDuration: toolStyle.animationDuration,
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