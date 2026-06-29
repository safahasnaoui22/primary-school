"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import styles from "./MethodSection.module.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function MethodSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll — minimal options for compatibility
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Set z-index for images
    document.querySelectorAll(`.${styles.imgWrapper}`).forEach((element) => {
      const order = element.getAttribute("data-index");
      if (order !== null) {
        (element as HTMLElement).style.zIndex = order;
      }
    });

    // Mobile layout handler
    function handleMobileLayout() {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const leftItems = gsap.utils.toArray(`.${styles.arch__info}`);
      const rightItems = gsap.utils.toArray(`.${styles.imgWrapper}`);

      if (isMobile) {
        leftItems.forEach((item: any, i) => {
          item.style.order = i * 2;
        });
        rightItems.forEach((item: any, i) => {
          item.style.order = i * 2 + 1;
        });
      } else {
        leftItems.forEach((item: any) => {
          item.style.order = "";
        });
        rightItems.forEach((item: any) => {
          item.style.order = "";
        });
      }
    }

    // Debounce resize
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleMobileLayout, 100);
    });

    handleMobileLayout();

    const imgs = gsap.utils.toArray(`.${styles.imgWrapper} img`);
    const bgColors = ["#EDF9FF", "#FFECF2", "#FFE8DB"];

    // GSAP Animation with Media Query
    let mm = gsap.matchMedia();

    /* ================= DESKTOP ================= */
    mm.add("(min-width: 769px)", () => {
      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: `.${styles.arch}`,
          start: "top top",
          end: "bottom bottom",
          pin: `.${styles.arch__right}`,
          scrub: true,
        },
      });

      gsap.set(imgs, {
        clipPath: "inset(0)",
        objectPosition: "0px 0%",
      });

      imgs.forEach((_: any, index: number) => {
        const currentImage = imgs[index] as HTMLElement;
        const nextImage = imgs[index + 1] || null;

        if (!nextImage) return;

        const sectionTimeline = gsap.timeline();

        sectionTimeline
          .to(
            "body",
            {
              backgroundColor: bgColors[index],
              duration: 1.5,
              ease: "power2.inOut",
            },
            0
          )
          .to(
            currentImage,
            {
              clipPath: "inset(0px 0px 100%)",
              objectPosition: "0px 60%",
              duration: 1.5,
              ease: "none",
            },
            0
          )
          .to(
            nextImage,
            {
              objectPosition: "0px 40%",
              duration: 1.5,
              ease: "none",
            },
            0
          );

        mainTimeline.add(sectionTimeline);
      });
    });

    /* ================= MOBILE ================= */
    mm.add("(max-width: 768px)", () => {
      gsap.set(imgs, {
        objectPosition: "0px 60%",
      });

      imgs.forEach((image: any, index: number) => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: image,
              start: "top-=70% top+=50%",
              end: "bottom+=200% bottom",
              scrub: true,
            },
          })
          .to(image, {
            objectPosition: "0px 30%",
            duration: 5,
            ease: "none",
          })
          .to("body", {
            backgroundColor: bgColors[index],
            duration: 1.5,
            ease: "power2.inOut",
          });
      });
    });

    // Cleanup
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const methods = [
    {
      id: "green",
      title: "Apprentissage Ludique",
      description:
        "Nous croyons que chaque enfant apprend mieux lorsqu'il se sent motivé, valorisé et impliqué. Notre approche pédagogique repose sur un apprentissage ludique et interactif combinant jeux éducatifs, ateliers créatifs, travaux de groupe et outils numériques adaptés à l'âge des élèves. Cette méthode stimule la curiosité naturelle des enfants, développe leur esprit critique et renforce leur autonomie tout en rendant l'école agréable et motivante.",
      image:
        "https://i.pinimg.com/1200x/af/ab/5b/afab5ba8d0099e903260235d13cfbbba.jpg",
    },
    {
      id: "blue",
      title: "Excellence Académique",
      description:
        "Nous suivons rigoureusement le programme officiel tunisien tout en l'enrichissant par des méthodes pédagogiques modernes et innovantes. Nos enseignants qualifiés accompagnent chaque élève afin de consolider les bases fondamentales en arabe, français, mathématiques et sciences. Un suivi régulier, des évaluations constructives et un encadrement personnalisé permettent d'assurer la réussite scolaire et la progression continue de chaque enfant.",
      image:
        "https://i.pinimg.com/1200x/08/46/9d/08469d77ca5bd335a9e5b5ebe6741961.jpg",
    },
    {
      id: "pink",
      title: "Développement Personnel",
      description:
        "Au-delà des apprentissages académiques, nous accordons une grande importance au développement personnel et social de nos élèves. À travers des activités sportives, artistiques et culturelles, nous cultivons la confiance en soi, le respect des autres, l'esprit d'équipe et le sens des responsabilités. Notre objectif est de former des enfants épanouis, équilibrés et prêts à relever les défis de demain.",
      image:
        "https://i.pinimg.com/736x/90/63/86/9063869ee7d203627958bcccbf004a5c.jpg",
    },
    {
      id: "orange",
      title: "Environnement Sécurisé",
      description:
        "La sécurité, le bien-être et l'épanouissement des enfants sont au cœur de nos priorités. Notre établissement offre un environnement propre, organisé et entièrement sécurisé, avec une surveillance constante et une équipe pédagogique attentive. Nous favorisons un climat de confiance entre l'école, les élèves et les parents afin de garantir un cadre rassurant et propice à l'apprentissage.",
      image:
        "https://i.pinimg.com/736x/6e/f1/55/6ef155e25a6a517d8c89a46ebba37d71.jpg",
    },
  ];

  return (
    <div className={styles.container} ref={sectionRef}>
      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <h1
          className={styles.h1methode}
          style={{
            fontSize: "48px",
            fontWeight: 800,
            marginBottom: "10px",
          }}
        >
          Notre Méthode Pédagogique
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.8 }}>
          Une approche moderne et bienveillante adaptée aux enfants du primaire
          en Tunisie
        </p>
      </div>

      <div className={styles.arch}>
        <div className={styles.arch__left}>
          {methods.map((method, index) => (
            <div
              key={index}
              className={styles.arch__info}
              id={`${method.id}-arch`}
            >
              <div className={styles.content}>
                <h2 className={styles.header}>{method.title}</h2>
                <p className={styles.desc}>{method.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.arch__right}>
          {methods.map((method, index) => (
            <div
              key={index}
              className={styles.imgWrapper}
              data-index={methods.length - index}
            >
              <Image
                src={method.image}
                alt={`${method.title} Architecture`}
                width={540}
                height={400}
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}