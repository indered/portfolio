import { useState, useEffect, useRef } from 'react';

export function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(null);
  const ratioMap = useRef({});

  useEffect(() => {
    if (!sectionIds || sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratioMap.current[entry.target.id] = entry.intersectionRatio;
        });

        let maxRatio = 0;
        let maxId = null;

        for (const id of sectionIds) {
          const ratio = ratioMap.current[id] || 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        }

        if (maxId && maxRatio > 0) {
          setActiveSection(maxId);
        }
      },
      { threshold: 0.3, rootMargin: '-20% 0px -20% 0px' }
    );

    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}
