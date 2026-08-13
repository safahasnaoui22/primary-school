export interface ClassInfo {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ageRange: string;
  weeklyHours: string;
  subjects: string[];
  highlights: string[];
}

export const classesData: ClassInfo[] = [
  {
    slug: '1ere-annee',
    title: '1ʳᵉ année primaire',
    subtitle: "Premiers pas dans l'apprentissage",
    description:
      "Notre programme de 1ʳᵉ année initie les enfants aux bases de la lecture, de l'écriture et des mathématiques dans un environnement ludique et stimulant. Nous favorisons la curiosité et la socialisation.",
    image: 'https://i.pinimg.com/1200x/ad/63/bf/ad63bf4b9c7143ff3e8c0cf1c141e7e4.jpg',
    ageRange: '6 – 7 ans',
    weeklyHours: '24h / semaine',
    subjects: ['Lecture', 'Écriture', 'Mathématiques', 'Éveil scientifique', 'Arts plastiques', 'Éducation physique'],
    highlights: [
      'Reconnaissance des lettres et premiers mots',
      'Compter et manipuler les nombres jusqu\'à 20',
      'Développement de la motricité fine',
      'Apprentissage par le jeu et les activités sensorielles',
    ],
  },
  {
    slug: '2eme-annee',
    title: '2ᵉ année primaire',
    subtitle: 'Consolidation des bases',
    description:
      "La 2ᵉ année renforce les compétences en lecture et en mathématiques tout en introduisant la science et les arts. L'objectif est de développer la confiance et l'envie d'apprendre.",
    image: 'https://i.pinimg.com/1200x/c2/49/0a/c2490a2601c770f4fa38d2097dd1400e.jpg',
    ageRange: '7 – 8 ans',
    weeklyHours: '25h / semaine',
    subjects: ['Lecture fluide', 'Grammaire', 'Mathématiques', 'Sciences', 'Arts', 'Éducation physique'],
    highlights: [
      'Lecture autonome de petits textes',
      'Addition et soustraction à deux chiffres',
      'Premières expériences scientifiques simples',
      'Travail en petits groupes',
    ],
  },
  {
    slug: '3eme-annee',
    title: '3ᵉ année primaire',
    subtitle: 'Exploration et créativité',
    description:
      'Les élèves approfondissent la compréhension en lecture, les mathématiques et les matières créatives. Nous encourageons la réflexion critique, la curiosité et le travail en équipe.',
    image: 'https://i.pinimg.com/1200x/55/81/f5/5581f531f322cfb5d66912f9a0053b30.jpg',
    ageRange: '8 – 9 ans',
    weeklyHours: '26h / semaine',
    subjects: ['Compréhension écrite', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Arts', 'Langues'],
    highlights: [
      'Rédaction de textes courts structurés',
      'Multiplication et division de base',
      'Introduction à l\'histoire et à la géographie',
      'Projets de groupe et exposés',
    ],
  },
  {
    slug: '4eme-annee',
    title: '4ᵉ année primaire',
    subtitle: 'Approfondissement des matières',
    description:
      'La 4ᵉ année consolide les compétences académiques et introduit des concepts avancés en sciences, mathématiques et langues. Les élèves participent aussi à des activités artistiques et sportives.',
    image: 'https://i.pinimg.com/1200x/30/0a/eb/300aeb4165381bfa01b10fe235b52804.jpg',
    ageRange: '9 – 10 ans',
    weeklyHours: '27h / semaine',
    subjects: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Langues étrangères', 'Arts'],
    highlights: [
      'Fractions et géométrie de base',
      'Rédaction argumentée',
      'Débats et prises de parole en public',
      'Projets scientifiques en équipe',
    ],
  },
  {
    slug: '5eme-annee',
    title: '5ᵉ année primaire',
    subtitle: 'Préparation aux défis',
    description:
      'La 5ᵉ année développe la résolution de problèmes, la pensée critique et le leadership. Les élèves combinent apprentissage académique et activités créatives.',
    image: 'https://i.pinimg.com/1200x/51/14/73/5114730a8ab32444e2287ed24da0458d.jpg',
    ageRange: '10 – 11 ans',
    weeklyHours: '28h / semaine',
    subjects: ['Français', 'Mathématiques avancées', 'Sciences', 'Histoire-Géographie', 'Langues', 'Informatique'],
    highlights: [
      'Résolution de problèmes complexes',
      'Introduction à la programmation',
      'Rôles de leadership dans les projets de classe',
      'Préparation aux exposés longs',
    ],
  },
  {
    slug: '6eme-annee',
    title: '6ᵉ année primaire',
    subtitle: 'Prêts pour le collège',
    description:
      'La 6ᵉ année prépare les élèves au collège avec des cours avancés en mathématiques, sciences et langues, tout en renforçant la confiance et l\'autonomie.',
    image: 'https://i.pinimg.com/736x/15/ae/ed/15aeed976be9d402544804e87a10e704.jpg',
    ageRange: '11 – 12 ans',
    weeklyHours: '29h / semaine',
    subjects: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Langues', 'Méthodologie'],
    highlights: [
      'Consolidation de toutes les matières fondamentales',
      'Techniques de travail autonome',
      'Simulation d\'examens et méthodologie',
      'Transition en douceur vers le collège',
    ],
  },
];

export function getClassBySlug(slug: string): ClassInfo | undefined {
  return classesData.find((c) => c.slug === slug);
}