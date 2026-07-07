"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** optional short label, e.g. "Our Method" — omit for a plain rule */
  label?: string;
};

export default function SectionDivider({ label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`section-divider ${visible ? "is-visible" : ""}`}>
      <span className="section-divider__line section-divider__line--left" />
      <span className="section-divider__mark" aria-hidden="true" />
      {label && <span className="section-divider__label">{label}</span>}
      <span className="section-divider__line section-divider__line--right" />
    </div>
  );
}