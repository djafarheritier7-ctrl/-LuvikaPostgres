// components/layout/ExtensionCleaner.tsx
'use client';
import { useEffect } from 'react';

export default function ExtensionCleaner() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const clean = () => {
      document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
    };
    clean();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
          const target = m.target as Element;
          if (target.hasAttribute('bis_skin_checked')) target.removeAttribute('bis_skin_checked');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
    return () => observer.disconnect();
  }, []);

  return null;
}