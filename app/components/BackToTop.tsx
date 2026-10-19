'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

// Nút "Lên đầu trang": hiện khi đã cuộn xuống quá 1 màn hình
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { setShow(window.scrollY > window.innerHeight * 0.9); ticking = false; });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button type="button" className={`to-top ${show ? 'show' : ''}`} onClick={toTop} aria-label="Lên đầu trang" title="Lên đầu trang" tabIndex={show ? 0 : -1}>
      <Icon name="arrow" size={20} />
    </button>
  );
}
