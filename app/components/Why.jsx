'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './why.module.css';

// ----- DONNÉES DES DIAPOSITIVES -----
const slides = [
  {
    img: 'https://i.pinimg.com/1200x/50/99/10/509910afe7c026ddee800eedcfe01bbc.jpg',
    title: 'Un environnement <span>bienveillant</span>',
    caption: "Chez EduSmart, chaque enfant évolue dans un espace chaleureux où il se sent en sécurité et valorisé.",
    alt: 'Salle de classe chaleureuse et accueillante à l\'école primaire EduSmart',
  },
  {
    img: 'https://i.pinimg.com/736x/f6/87/a3/f687a352d082d6f8368dacc5c28af009.jpg',
    title: 'Apprentissage <span>par le jeu</span>',
    caption: 'Des activités concrètes qui éveillent la curiosité et stimulent la créativité de nos élèves.',
    alt: 'Enfants participant à des activités pédagogiques ludiques à EduSmart',
  },
  {
    img: 'https://i.pinimg.com/736x/f9/bf/3d/f9bf3db0089096ffbf3173952772dca4.jpg',
    title: 'Enseignants <span>qualifiés</span>',
    caption: 'Une équipe pédagogique expérimentée, passionnée par le développement de la petite enfance.',
    alt: 'Enseignante qualifiée avec des élèves à l\'école primaire EduSmart',
  },
  {
    img: 'https://i.pinimg.com/736x/99/c8/6b/99c86b3d855879076c52a0fba756dc20.jpg',
    title: 'Petits <span>effectifs</span>',
    caption: 'Une attention individuelle qui permet à chaque élève de s\'épanouir pleinement.',
    alt: 'Petite classe avec attention individualisée à EduSmart',
  },
  {
    img: 'https://i.pinimg.com/736x/40/ca/9d/40ca9d797fbee2833a2f45a0ab2ae8a0.jpg',
    title: 'Infrastructures <span>sécurisées</span>',
    caption: 'Des salles de classe modernes et des aires de jeux sécurisées, pensées pour votre tranquillité.',
    alt: 'Cour de récréation sécurisée de l\'école primaire EduSmart',
  },
  {
    img: 'https://i.pinimg.com/736x/03/b1/b3/03b1b3bb3e4e088a24aba3b37c83bbeb.jpg',
    title: 'Esprit de <span>communauté</span>',
    caption: 'Une forte implication des familles et des amitiés durables au sein de la communauté EduSmart.',
    alt: 'Événement communautaire réunissant familles et élèves à EduSmart',
  },
];

const totalSlides = slides.length;

const Why = () => {
  const [indices, setIndices] = useState([0, 1, 2]);
  const [isAnimating, setIsAnimating] = useState(false);

  const imgOneRefs = useRef([]);
  const imgTwoRefs = useRef([]);

  const currentSlide = slides[indices[0]];

  // ---- Fonctions utilitaires ----
  const preload = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve();
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = src;
    });

  const whenTransitionEnd = (el, timeout = 1000) =>
    new Promise((resolve) => {
      let done = false;
      const timer = setTimeout(() => {
        if (!done) resolve();
        done = true;
      }, timeout + 200);

      const handler = (e) => {
        if (done) return;
        if (e.target === el && e.propertyName === 'transform') {
          done = true;
          clearTimeout(timer);
          el.removeEventListener('transitionend', handler);
          resolve();
        }
      };
      el.addEventListener('transitionend', handler);
    });

  const slide = useCallback(
    async (direction) => {
      if (isAnimating) return;
      setIsAnimating(true);

      let newIndices;
      if (direction === 'next') {
        newIndices = [indices[1], indices[2], (indices[2] + 1) % totalSlides];
      } else {
        newIndices = [
          (indices[0] - 1 + totalSlides) % totalSlides,
          indices[0],
          indices[1],
        ];
      }

      const newSrcs = newIndices.map((idx) => slides[idx].img);
      await Promise.all(newSrcs.map(preload));

      imgTwoRefs.current.forEach((imgTwo, i) => {
        if (!imgTwo) return;
        imgTwo.style.transition = 'none';
        imgTwo.style.transform =
          direction === 'next'
            ? 'translate(100%, 100%)'
            : 'translate(-100%, -100%)';
        imgTwo.style.opacity = '1';
        imgTwo.style.zIndex = '2';
        imgTwo.src = newSrcs[i];
      });

      void document.body.offsetHeight;

      imgTwoRefs.current.forEach((imgTwo) => {
        if (!imgTwo) return;
        imgTwo.style.transition = 'transform 0.8s cubic-bezier(.2,.9,.2,1)';
        imgTwo.style.transform = 'translate(0, 0)';
      });

      await Promise.all(
        imgTwoRefs.current.map((imgTwo) =>
          imgTwo ? whenTransitionEnd(imgTwo, 800) : Promise.resolve()
        )
      );

      imgOneRefs.current.forEach((imgOne, i) => {
        if (imgOne && imgTwoRefs.current[i]) {
          imgOne.src = imgTwoRefs.current[i].src;
        }
      });

      imgTwoRefs.current.forEach((imgTwo) => {
        if (!imgTwo) return;
        imgTwo.style.transition = 'none';
        imgTwo.style.transform =
          direction === 'next'
            ? 'translate(100%, 100%)'
            : 'translate(-100%, -100%)';
        imgTwo.style.opacity = '0';
        imgTwo.style.zIndex = '2';
      });

      setIndices(newIndices);
      setIsAnimating(false);
    },
    [indices, isAnimating]
  );

  const handleNext = useCallback(() => slide('next'), [slide]);
  const handlePrev = useCallback(() => slide('prev'), [slide]);

  // Chargement initial des images
  useEffect(() => {
    imgOneRefs.current.forEach((imgOne, i) => {
      if (imgOne && indices[i] !== undefined) {
        imgOne.src = slides[indices[i]].img;
      }
    });
  }, []);

  return (
    <section
      className={styles.whyUs}
      aria-label="Pourquoi choisir l'école primaire EduSmart"
    >
      {/* Données structurées pour le référencement (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'School',
            name: 'EduSmart',
            description:
              "École primaire offrant un environnement bienveillant, un apprentissage par le jeu, des enseignants qualifiés et des infrastructures sécurisées.",
            '@id': 'https://www.edusmart.fr/#ecole',
          }),
        }}
      />

      <div className={styles.content}>
        <p className={styles.sectionLabel}>Pourquoi choisir EduSmart</p>
        <div key={indices[0]}>
          <h2
            className={`${styles.heading} ${styles.animateIn}`}
            dangerouslySetInnerHTML={{ __html: currentSlide.title }}
          />
          <p className={`${styles.caption} ${styles.animateIn}`}>
            {currentSlide.caption}
          </p>
        </div>
      </div>

      <div className={styles.images}>
        {[0, 1, 2].map((i) => (
          <figure className={styles.image} key={i}>
            <img
              src={slides[indices[i]]?.img}
              alt={slides[indices[i]]?.alt ?? 'École primaire EduSmart'}
              className={styles.imgOne}
              ref={(el) => (imgOneRefs.current[i] = el)}
            />
            <img
              src={slides[indices[i]]?.img}
              alt=""
              aria-hidden="true"
              className={styles.imgTwo}
              ref={(el) => (imgTwoRefs.current[i] = el)}
              style={{ transform: 'translate(100%, 100%)', opacity: 0, zIndex: 2 }}
            />
          </figure>
        ))}

        <div className={styles.controls}>
          <button
            className={styles.control}
            onClick={handlePrev}
            disabled={isAnimating}
            aria-label="Diapositive précédente"
          >
            Précédent
          </button>
          <button
            className={styles.control}
            onClick={handleNext}
            disabled={isAnimating}
            aria-label="Diapositive suivante"
          >
            Suivant
          </button>
        </div>
      </div>
    </section>
  );
};

export default Why;