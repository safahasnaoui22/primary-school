'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './why.module.css';

// ----- DONNÉES DES DIAPOSITIVES -----
const slides = [
  {
    img: 'https://i.pinimg.com/1200x/93/5a/7c/935a7c5d2efaac6267c22be0a37a454d.jpg',
    title: 'Un cadre <span>bienveillant</span>',
    caption:
      "Chaque enfant évolue dans un environnement sécurisé, chaleureux et respectueux, où il se sent écouté, accompagné et encouragé à grandir en toute confiance.",
    alt: "Environnement bienveillant dans une école primaire moderne",
  },
  {
    img: 'https://i.pinimg.com/736x/8b/3e/b3/8b3eb335df526d626ab21c4601b22b78.jpg',
    title: 'Apprendre avec <span>plaisir</span>',
    caption:
      "Des méthodes pédagogiques modernes, des ateliers interactifs et des activités variées permettent aux élèves d'apprendre avec curiosité, enthousiasme et motivation.",
    alt: "Enfants apprenant à travers des activités interactives",
  },
  {
    img: 'https://i.pinimg.com/736x/3c/87/4e/3c874e2e8d3c1803066e4e4b4a308394.jpg',
    title: 'Une équipe <span>engagée</span>',
    caption:
      "Nos enseignants qualifiés accompagnent chaque élève avec attention, bienveillance et exigence afin de favoriser sa réussite scolaire et son épanouissement.",
    alt: "Enseignants qualifiés accompagnant les élèves",
  },
  {
    img: 'https://i.pinimg.com/736x/ad/3e/88/ad3e886939172f2ff068ce513dbd0a42.jpg',
    title: 'Grandir avec <span>confiance</span>',
    caption:
      "Au-delà des apprentissages, nous développons l'autonomie, la créativité, l'esprit d'équipe et les valeurs qui préparent les enfants aux défis de demain.",
    alt: "Élèves développant leur confiance et leur autonomie",
  },
  {
    img: 'https://i.pinimg.com/736x/40/ca/9d/40ca9d797fbee2833a2f45a0ab2ae8a0.jpg',
    title: 'Des espaces <span>adaptés</span>',
    caption:
      "Des salles de classe lumineuses, des équipements modernes et des espaces de vie sécurisés offrent aux élèves les meilleures conditions pour apprendre et s'épanouir.",
    alt: "Espaces modernes et sécurisés d'une école primaire",
  },
  {
    img: 'https://i.pinimg.com/736x/03/b1/b3/03b1b3bb3e4e088a24aba3b37c83bbeb.jpg',
    title: 'Une école <span>ouverte aux familles</span>',
    caption:
      "Nous construisons une relation de confiance avec les parents grâce à une communication régulière et un accompagnement fondé sur l'écoute et la collaboration.",
    alt: "Parents et enseignants échangeant dans une école primaire",
  },
];
const totalSlides = slides.length;
const AUTOPLAY_DELAY = 4000; // 4 secondes

const Why = () => {
  const [indices, setIndices] = useState([0, 1, 2]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const imgOneRefs = useRef([]);
  const imgTwoRefs = useRef([]);
  const sectionRef = useRef(null);
  const autoplayRef = useRef(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Détection de visibilité au scroll (fade in / fade out) ----
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.25, // se déclenche dès que 25% de la section est visible
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // ---- Autoplay : change de diapositive toutes les 4 secondes ----
  useEffect(() => {
    // On ne lance l'autoplay que si la section est visible à l'écran
    // et qu'aucune transition n'est déjà en cours.
    if (!isVisible || isAnimating) return;

    autoplayRef.current = setTimeout(() => {
      handleNext();
    }, AUTOPLAY_DELAY);

    return () => clearTimeout(autoplayRef.current);
  }, [isVisible, isAnimating, indices, handleNext]);

  // Relance le minuteur d'autoplay depuis zéro après une action manuelle
  const restartAutoplay = () => {
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
  };

  const onManualNext = () => {
    restartAutoplay();
    handleNext();
  };

  const onManualPrev = () => {
    restartAutoplay();
    handlePrev();
  };

  return (
    <section
      className={`${styles.whyUs} ${isVisible ? styles.inView : styles.outOfView}`}
      aria-label="Pourquoi choisir l'école primaire EduSmart"
      ref={sectionRef}
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
        <p className={styles.sectionLabel}>Notre Univers</p>
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
            onClick={onManualPrev}
            disabled={isAnimating}
            aria-label="Diapositive précédente"
          >
            Précédent
          </button>
          <button
            className={styles.control}
            onClick={onManualNext}
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