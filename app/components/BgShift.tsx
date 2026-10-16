'use client';

import { useEffect } from 'react';

// Nền trang chuyển màu mượt theo phần đang xem (section có [data-bg]).
// Không JS / bật "giảm chuyển động" → dùng nền gradient tĩnh có mép mờ (xem globals.css).
export default function BgShift() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-bg]'));
    if (!sections.length) return;
    root.classList.add('bg-shift');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('bg-shift-instant');

    // Phần nào chạm dải giữa màn hình thì đổi màu nền theo phần đó
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) root.style.setProperty('--page-bg', (e.target as HTMLElement).dataset.bg!); }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach(s => io.observe(s));
    root.style.setProperty('--page-bg', sections[0].dataset.bg!);
    return () => { io.disconnect(); root.classList.remove('bg-shift', 'bg-shift-instant'); };
  }, []);
  return null;
}
