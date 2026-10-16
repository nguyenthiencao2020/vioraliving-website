'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LEGACY_PROGRAM, resolveSlug } from '@/lib/programs';

export const SELECT_PROGRAM_EVENT = 'viora:select-program';

type Panel = { id: string; tab: string; badge?: string; content: ReactNode };

// Tab 2 chương trình. Cả 2 panel đều render sẵn trên server (tốt cho SEO), chỉ ẩn/hiện.
// Link ?ct=<chương trình> hoặc ?vi-tri=<slug> (từ mã QR trên poster) mở đúng tab.
export default function ProgramTabs({ panels, jobPrograms }: { panels: Panel[]; jobPrograms: Record<string, string> }) {
  const [active, setActive] = useState(panels[0]?.id);
  const rootRef = useRef<HTMLDivElement>(null);

  // Panel vừa mở: hiện ngay các khối có hiệu ứng "hiện dần" (chúng chưa được kích hoạt khi panel còn ẩn)
  useEffect(() => {
    rootRef.current?.querySelectorAll(`#panel-${active} [data-reveal]`).forEach(el => el.classList.add('in'));
  }, [active]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromJob = jobPrograms[resolveSlug(params.get('vi-tri') ?? '', Object.keys(jobPrograms)) ?? ''];
    const rawCt = params.get('ct') ?? '';
    const ct = LEGACY_PROGRAM[rawCt] ?? rawCt;
    if (fromJob) setActive(fromJob);
    else if (ct && panels.some(p => p.id === ct)) setActive(ct);

    const onSelect = (e: Event) => setActive((e as CustomEvent<string>).detail);
    window.addEventListener(SELECT_PROGRAM_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_PROGRAM_EVENT, onSelect);
  }, [panels, jobPrograms]);

  return (
    <div className="ptabs" ref={rootRef}>
      <div className="ptab-list" role="tablist" aria-label="Chương trình tuyển dụng">
        {panels.map(p => (
          <button
            key={p.id} role="tab" type="button" id={`tab-${p.id}`} aria-controls={`panel-${p.id}`}
            aria-selected={active === p.id} className={`ptab ${active === p.id ? 'active' : ''} ptab-${p.id}`}
            onClick={() => setActive(p.id)}
          >
            <span>{p.tab}</span>
            {p.badge && <small>{p.badge}</small>}
          </button>
        ))}
      </div>
      {panels.map(p => (
        <div
          key={p.id} role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`}
          hidden={active !== p.id} className="ptab-panel"
        >
          {p.content}
        </div>
      ))}
    </div>
  );
}

/** Nút chuyển sang 1 chương trình rồi cuộn tới danh sách vị trí */
export function ProgramLink({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <a
      href="#vi-tri" className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(SELECT_PROGRAM_EVENT, { detail: id }))}
    >
      {children}
    </a>
  );
}
