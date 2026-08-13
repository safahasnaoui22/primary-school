export function getSubjectIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('math')) return 'calculator';
  if (n.includes('lecture') || n.includes('écriture') || n.includes('français') || n.includes('grammaire') || n.includes('compréhension'))
    return 'book';
  if (n.includes('science') || n.includes('éveil')) return 'flask';
  if (n.includes('histoire') || n.includes('géographie')) return 'map';
  if (n.includes('art')) return 'palette';
  if (n.includes('physique')) return 'runner';
  if (n.includes('langue') || n.includes('anglais')) return 'globe';
  if (n.includes('informatique')) return 'laptop';
  if (n.includes('méthodologie')) return 'target';
  return 'star';
}

export function getSubjectDescription(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('math')) return 'Raisonnement logique, calcul et résolution de problèmes.';
  if (n.includes('lecture') || n.includes('écriture') || n.includes('français') || n.includes('grammaire') || n.includes('compréhension'))
    return "Maîtrise de la langue, expression écrite et orale.";
  if (n.includes('science') || n.includes('éveil')) return "Découverte du monde par l'observation et l'expérimentation.";
  if (n.includes('histoire') || n.includes('géographie')) return 'Compréhension du monde, du temps et de l\'espace.';
  if (n.includes('art')) return 'Expression créative et développement de la sensibilité artistique.';
  if (n.includes('physique')) return 'Motricité, esprit d\'équipe et bien-être physique.';
  if (n.includes('langue') || n.includes('anglais')) return "Ouverture sur le monde et compétences linguistiques.";
  if (n.includes('informatique')) return 'Premiers pas dans la pensée computationnelle.';
  if (n.includes('méthodologie')) return "Techniques de travail et d'organisation personnelle.";
  return 'Développement des compétences fondamentales.';
}