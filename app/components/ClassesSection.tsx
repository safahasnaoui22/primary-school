// components/ClassesSection.tsx
"use client";

import { useEffect } from "react";
import Image from "next/image";
import styles from "./ClassesSection.module.css";

export default function ClassesSection() {
  useEffect(() => {
    // Create floating tool icons
    const tools = ['calculator', 'ruler', 'book', 'pen-fancy', 'backpack', 'globe-americas'];
    const colors = ['#4a6bff', '#ff6b6b', '#4cff8f', '#ffc04c', '#b84cff', '#4cc3ff'];
    
    for (let i = 0; i < 15; i++) {
      const tool = document.createElement('div');
      tool.className = styles.floatingTools;
      tool.innerHTML = `<i class="fas fa-${tools[i % tools.length]}"></i>`;
      tool.style.color = colors[i % colors.length];
      tool.style.fontSize = `${Math.random() * 30 + 20}px`;
      tool.style.left = `${Math.random() * 100}%`;
      tool.style.top = `${Math.random() * 100}%`;
      tool.style.animationDelay = `${Math.random() * 10}s`;
      tool.style.animationDuration = `${Math.random() * 10 + 10}s`;
      document.body.appendChild(tool);
    }

    // Cleanup
    return () => {
      const floatingTools = document.querySelectorAll(`.${styles.floatingTools}`);
      floatingTools.forEach(tool => tool.remove());
    };
  }, []);

  const classes = [
    {
      title: "1ʳᵉ année primaire",
      subtitle: "Premiers pas dans l'apprentissage",
      description: "Notre programme de 1ʳᵉ année initie les enfants aux bases de la lecture, de l'écriture et des mathématiques dans un environnement ludique et stimulant. Nous favorisons la curiosité et la socialisation.",
      image: "https://i.pinimg.com/1200x/ad/63/bf/ad63bf4b9c7143ff3e8c0cf1c141e7e4.jpg",
    },
    {
      title: "2ᵉ année primaire",
      subtitle: "Consolidation des bases",
      description: "La 2ᵉ année renforce les compétences en lecture et en mathématiques tout en introduisant la science et les arts. L'objectif est de développer la confiance et l'envie d'apprendre.",
      image: "https://i.pinimg.com/1200x/c2/49/0a/c2490a2601c770f4fa38d2097dd1400e.jpg",
    },
    {
      title: "3ᵉ année primaire",
      subtitle: "Exploration et créativité",
      description: "Les élèves approfondissent la compréhension en lecture, les mathématiques et les matières créatives. Nous encourageons la réflexion critique, la curiosité et le travail en équipe.",
      image: "https://i.pinimg.com/1200x/55/81/f5/5581f531f322cfb5d66912f9a0053b30.jpg",
    },
    {
      title: "4ᵉ année primaire",
      subtitle: "4ᵉ année primaire",
      description: "La 4ᵉ année consolide les compétences académiques et introduit des concepts avancés en sciences, mathématiques et langues. Les élèves participent aussi à des activités artistiques et sportives.",
      image: "https://i.pinimg.com/1200x/30/0a/eb/300aeb4165381bfa01b10fe235b52804.jpg",
    },
    {
      title: "5ᵉ année primaire",
      subtitle: "Préparation aux défis",
      description: "La 5ᵉ année développe la résolution de problèmes, la pensée critique et le leadership. Les élèves combinent apprentissage académique et activités créatives.",
      image: "https://i.pinimg.com/1200x/51/14/73/5114730a8ab32444e2287ed24da0458d.jpg",
    },
    {
      title: "6ᵉ année primaire",
      subtitle: "Prêts pour le collège",
      description: "La 6ᵉ année prépare les élèves au collège avec des cours avancés en mathématiques, sciences et langues, tout en renforçant la confiance et l'autonomie.",
      image: "https://i.pinimg.com/736x/15/ae/ed/15aeed976be9d402544804e87a10e704.jpg",
    },
  ];

  return (
    <div className={styles.classsection}>
      <div className={styles.headerclasses}>
        <h1 className={styles.h1classes}>Les Classes que Nous Proposons</h1>
        <p className={styles.pclasses}>
          Découvrez nos classes de la 1ʳᵉ à la 6ᵉ année primaire, où chaque enfant apprend, grandit et s'épanouit dans un environnement sûr et stimulant.
        </p>
      </div>

      <div className={styles.container}>
        {classes.map((classItem, index) => (
          <div key={index} className={styles.box}>
            <div className={styles.imgBox} title={classItem.title}>
              <Image src={classItem.image} alt={classItem.title} width={310} height={450} />
            </div>
            <div className={styles.content}>
              <h2 className={styles.h2classes}>{classItem.subtitle}</h2>
              <p>{classItem.description}</p>
              <button className={styles.ghostBtn}>En savoir plus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}