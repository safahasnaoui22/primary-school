'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './why.module.css';

// ----- SLIDE DATA -----
const slides = [
  {
    img: 'https://i.pinimg.com/1200x/50/99/10/509910afe7c026ddee800eedcfe01bbc.jpg ',
    title: 'Nurturing <span>Environment</span>',
    caption: 'A warm, welcoming space where every child feels safe and valued.',
  },
  {
    img: 'https://i.pinimg.com/736x/f6/87/a3/f687a352d082d6f8368dacc5c28af009.jpg',
    title: 'Play‑Based <span>Learning</span>',
    caption: 'Hands‑on activities that spark curiosity and creativity.',
  },
  {
    img: 'https://i.pinimg.com/736x/f9/bf/3d/f9bf3db0089096ffbf3173952772dca4.jpg',
    title: 'Qualified <span>Teachers</span>',
    caption: 'Experienced educators passionate about early childhood development.',
  },
  {
    img: 'https://i.pinimg.com/736x/99/c8/6b/99c86b3d855879076c52a0fba756dc20.jpg',
    title: 'Small <span>Class Sizes</span>',
    caption: 'Individual attention that helps every student thrive.',
  },
  {
    img: 'https://i.pinimg.com/736x/40/ca/9d/40ca9d797fbee2833a2f45a0ab2ae8a0.jpg',
    title: 'Safe <span>Facilities</span>',
    caption: 'Modern classrooms and secure playgrounds you can trust.',
  },
  {
    img: 'https://i.pinimg.com/736x/03/b1/b3/03b1b3bb3e4e088a24aba3b37c83bbeb.jpg',
    title: 'Community <span>Spirit</span>',
    caption: 'Strong family involvement and lasting friendships.',
  },
];

const totalSlides = slides.length;

const Why = () => {
  const [indices, setIndices] = useState([0, 1, 2]);
  const [isAnimating, setIsAnimating] = useState(false);

  const imgOneRefs = useRef([]);
  const imgTwoRefs = useRef([]);

  const currentSlide = slides[indices[0]];

  // ---- Helpers (same as original) ----
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

  // Initial image load
  useEffect(() => {
    imgOneRefs.current.forEach((imgOne, i) => {
      if (imgOne && indices[i] !== undefined) {
        imgOne.src = slides[indices[i]].img;
      }
    });
  }, []);

  return (
    <section className={styles.whyUs}>
      <div className={styles.content}>
        <p className={styles.sectionLabel}>Why Choose Us</p>
        <div key={indices[0]}>
          <h1
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
              src="https://i.pinimg.com/736x/4a/59/d9/4a59d9d67f42a6687f5264860649fe42.jpg"
              alt=""
              className={styles.imgOne}
              ref={(el) => (imgOneRefs.current[i] = el)}
            />
            <img
              src="https://i.pinimg.com/736x/4a/59/d9/4a59d9d67f42a6687f5264860649fe42.jpg"
              alt=""
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
          >
            Prev
          </button>
          <button
            className={styles.control}
            onClick={handleNext}
            disabled={isAnimating}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default Why;