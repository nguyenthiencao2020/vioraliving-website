'use client';

export const SELECT_JOB_EVENT = 'viora:select-job';

export default function JobApplyButton({ slug }: { slug: string }) {
  return (
    <a
      href="#ung-tuyen"
      className="btn btn-primary"
      onClick={() => window.dispatchEvent(new CustomEvent(SELECT_JOB_EVENT, { detail: slug }))}
    >
      Ứng tuyển vị trí này
    </a>
  );
}
