'use client';

import { useEffect, useState } from 'react';
import { CONTACT } from '@/lib/constants';
import Icon from './Icon';

// Thanh Gọi · Ứng tuyển dính đáy màn hình điện thoại: hiện sau khi cuộn qua hero, ẩn khi đang ở form.
export default function MobileApplyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const form = document.getElementById('ung-tuyen');
    let formVisible = false;
    const io = form ? new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; update(); }) : null;
    if (form && io) io.observe(form);
    function update() { setShow(window.scrollY > window.innerHeight * 0.8 && !formVisible); }
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', update); io?.disconnect(); };
  }, []);

  return (
    <div className={`mobile-bar ${show ? 'show' : ''}`} aria-hidden={!show}>
      <a className="mb-icon mb-call" href={`tel:${CONTACT.phoneTel}`} aria-label={`Gọi ${CONTACT.phone}`} tabIndex={show ? 0 : -1}>
        <Icon name="phone" size={20} />
      </a>
      <a className="btn btn-primary btn-shine mb-apply" href="#ung-tuyen" tabIndex={show ? 0 : -1}>
        Ứng tuyển ngay <Icon name="arrow" size={16} />
      </a>
    </div>
  );
}
