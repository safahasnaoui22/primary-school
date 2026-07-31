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
    title: "Apprentissage Moderne",
    description:
      "Notre école primaire en Tunisie privilégie un apprentissage interactif où jeux éducatifs, ateliers créatifs et activités collaboratives permettent à chaque enfant d'apprendre avec plaisir et confiance.",
    image:
      "https://i.pinimg.com/1200x/dd/c2/1f/ddc21f7f791460cf26ee45033c5c7710.jpg",
  },
  {
    id: "blue",
    title: "Enseignement de Qualité",
    description:
      "Nous suivons le programme officiel tunisien avec des enseignants qualifiés, un accompagnement personnalisé et des méthodes modernes favorisant la réussite scolaire de chaque élève.",
    image:
      "https://i.pinimg.com/1200x/03/d1/71/03d171ab20f7868c006e5bab42339b46.jpg",
  },
  {
    id: "pink",
    title: "Épanouissement de l'Enfant",
    description:
      "À travers des activités sportives, artistiques et culturelles, nous développons la confiance en soi, l'autonomie, la créativité et l'esprit d'équipe pour former des enfants équilibrés.",
    image:
      "https://i.pinimg.com/736x/d1/1c/21/d11c21182a955a542fd863c4a6d1d8b9.jpg",
  },
  {
    id: "orange",
    title: "Cadre Sûr et Bienveillant",
    description:
      "Notre établissement offre un environnement sécurisé, propre et accueillant où chaque enfant évolue sereinement grâce à une équipe attentive et un climat de confiance avec les familles.",
    image:
      "https://i.pinimg.com/736x/81/59/27/815927097111fd8f1c4b7f0096c4f1bf.jpg",
  },
];

  return (
    <div className={styles.container} ref={sectionRef}>
      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <h1
          className={styles.h1methode}
          style={{
           
            marginBottom: "10px",
          }}
        >
         Pourquoi Nous Choisir
        </h1>
<p
  className="hide-on-mobile"
  style={{ fontSize: "18px", opacity: 0.8, color: "#374151" }}
>
  Les valeurs qui font de notre école un choix de confiance pour votre enfant.
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