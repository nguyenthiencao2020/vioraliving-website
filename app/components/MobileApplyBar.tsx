'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

// Thanh "Ứng tuyển" dính đáy màn hình trên điện thoại: hiện sau khi cuộn qua hero, ẩn khi đang ở form.
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
      <div>
        <b>Viora Living Saigon đang tuyển</b>
        <small>Nộp hồ sơ online chỉ 3 phút</small>
      </div>
      <a className="btn btn-primary btn-sm btn-shine" href="#ung-tuyen" tabIndex={show ? 0 : -1}>
        Ứng tuyển <Icon name="arrow" size={16} />
      </a>
    </div>
  );
}
