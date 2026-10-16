'use client';

import { useEffect, useRef, useState } from 'react';

// Số chạy từ 0 → giá trị khi cuộn tới (giữ 2 chữ số, vd 05). Giảm chuyển động → hiện số luôn.
export default function CountUp({ to, pad = 2, duration = 1400 }: { to: number; pad?: number; duration?: number }) {
  const [n, setN] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setN(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{String(n).padStart(pad, '0')}</span>;
}
