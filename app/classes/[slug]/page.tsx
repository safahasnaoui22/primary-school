import { notFound } from 'next/navigation';
import { getClassBySlug, classesData } from '@/lib/classesData';
import ClassDetailClient from './ClassDetailClient';

export function generateStaticParams() {
  return classesData.map((c) => ({ slug: c.slug }));
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const classInfo = getClassBySlug(slug);

  if (!classInfo) notFound();

  const currentIndex = classesData.findIndex((c) => c.slug === slug);
  const otherClasses = classesData.filter((c) => c.slug !== slug);

  return <ClassDetailClient classInfo={classInfo} otherClasses={otherClasses} />;
}