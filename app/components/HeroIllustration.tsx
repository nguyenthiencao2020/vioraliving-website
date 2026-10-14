// Hình minh họa hero: caregiver dìu người cao tuổi. Thay bằng ảnh thật khi có (xem HERO_PHOTO trong app/page.tsx).
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 440" role="img" aria-label="Nhân viên chăm sóc dìu người cao tuổi đi dạo" className="hero-svg">
      <defs>
        <linearGradient id="hg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3efed" />
          <stop offset="1" stopColor="#f6efe4" />
        </linearGradient>
        <linearGradient id="hg-scrub" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b8580" />
          <stop offset="1" stopColor="#2f6f6a" />
        </linearGradient>
      </defs>

      {/* nền */}
      <path d="M60 70C120 10 260 0 360 40s120 140 100 230-80 150-200 160S40 400 20 300 0 130 60 70z" fill="url(#hg-sky)" />
      <circle cx="360" cy="110" r="46" fill="#f4d9bf" />
      <circle cx="360" cy="110" r="30" fill="#efc59c" />

      {/* cây */}
      <g>
        <rect x="70" y="210" width="10" height="150" rx="5" fill="#8a6a4f" />
        <circle cx="75" cy="190" r="48" fill="#7fb3a6" />
        <circle cx="45" cy="225" r="30" fill="#6aa395" />
        <circle cx="105" cy="222" r="32" fill="#8fc0b3" />
      </g>
      <g>
        <rect x="416" y="250" width="8" height="110" rx="4" fill="#8a6a4f" />
        <circle cx="420" cy="236" r="34" fill="#9cc8bb" />
        <circle cx="400" cy="262" r="20" fill="#7fb3a6" />
      </g>

      {/* mặt đất */}
      <ellipse cx="250" cy="372" rx="210" ry="22" fill="#e4d6c3" />
      <path d="M30 372c80-16 340-16 440 0" stroke="#d6c4ac" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* người cao tuổi */}
      <g>
        {/* gậy */}
        <path d="M186 268 L176 368" stroke="#7a5a40" strokeWidth="6" strokeLinecap="round" />
        <path d="M186 268c0-10 12-12 14-2" stroke="#7a5a40" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* chân */}
        <rect x="200" y="300" width="16" height="66" rx="8" fill="#5b6770" />
        <rect x="222" y="300" width="16" height="66" rx="8" fill="#6b7780" />
        <ellipse cx="206" cy="368" rx="13" ry="6" fill="#3d454b" />
        <ellipse cx="232" cy="368" rx="13" ry="6" fill="#3d454b" />
        {/* thân */}
        <path d="M194 214c0-14 12-24 26-24s28 10 28 24v96h-54z" fill="#c8875a" />
        <path d="M206 200l14 22 14-22" fill="#f6efe4" />
        {/* tay cầm gậy */}
        <path d="M198 226c-8 16-12 30-12 42" stroke="#c8875a" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="186" cy="268" r="7" fill="#f0c4a0" />
        {/* đầu */}
        <rect x="213" y="172" width="14" height="20" rx="6" fill="#e9b892" />
        <circle cx="220" cy="156" r="24" fill="#f0c4a0" />
        <path d="M196 154c0-18 12-26 24-26s25 8 25 24c-6-8-14-12-24-12s-18 6-25 14z" fill="#f2f2f0" />
        <circle cx="200" cy="158" r="5" fill="#f2f2f0" />
        <path d="M222 162c3 3 7 3 10 0" stroke="#a0694a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="216" cy="152" r="2" fill="#4a3a30" />
        <circle cx="230" cy="152" r="2" fill="#4a3a30" />
      </g>

      {/* caregiver */}
      <g>
        <rect x="282" y="290" width="17" height="76" rx="8" fill="#24524f" />
        <rect x="304" y="290" width="17" height="76" rx="8" fill="#2a5e5a" />
        <ellipse cx="290" cy="368" rx="13" ry="6" fill="#f6efe4" stroke="#d6c4ac" />
        <ellipse cx="313" cy="368" rx="13" ry="6" fill="#f6efe4" stroke="#d6c4ac" />
        <path d="M274 210c0-16 14-28 28-28s28 12 28 28v92h-56z" fill="url(#hg-scrub)" />
        <path d="M290 186l12 18 12-18" fill="#f6efe4" />
        <rect x="312" y="222" width="12" height="9" rx="2" fill="#e3efed" />
        {/* tay dìu */}
        <path d="M280 222c-14 10-26 18-34 24" stroke="#3b8580" strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="244" cy="248" r="7" fill="#e9b892" />
        <path d="M324 224c6 20 6 38 2 52" stroke="#2f6f6a" strokeWidth="13" strokeLinecap="round" fill="none" />
        {/* đầu */}
        <rect x="295" y="164" width="14" height="22" rx="6" fill="#d9a47c" />
        <circle cx="302" cy="146" r="24" fill="#e9b892" />
        <path d="M278 146c0-20 12-28 25-28 14 0 24 9 24 24-8-6-18-9-28-9-8 0-15 5-21 13z" fill="#2b211c" />
        <circle cx="325" cy="132" r="11" fill="#2b211c" />
        <path d="M296 154c3 3 7 3 10 0" stroke="#a0694a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="294" cy="144" r="2" fill="#2b211c" />
        <circle cx="308" cy="144" r="2" fill="#2b211c" />
      </g>

      {/* trái tim */}
      <g className="hero-heart">
        <path d="M262 108c-6-10-24-8-24 6 0 12 24 26 24 26s24-14 24-26c0-14-18-16-24-6z" fill="#e07a5f" />
      </g>
      <circle cx="160" cy="96" r="5" fill="#c8875a" opacity=".5" />
      <circle cx="330" cy="70" r="4" fill="#2f6f6a" opacity=".4" />
      <circle cx="120" cy="140" r="3" fill="#2f6f6a" opacity=".4" />
    </svg>
  );
}
