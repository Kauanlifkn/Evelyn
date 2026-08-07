'use client';

import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  level: number;
}

const segments = [
  { label: 'Baixo', color: '#1697FF', range: [0, 1] },
  { label: 'Moderado', color: '#F7B500', range: [1, 2] },
  { label: 'Alto', color: '#FF7417', range: [2, 3] },
  { label: 'Muito Alto', color: '#F12B36', range: [3, 4] },
  { label: 'Crítico', color: '#7847E8', range: [4, 5] },
];

/* SVG helpers — angles in degrees, clockwise from top (12 o'clock) */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.sin(rad)) * 100) / 100,
    y: Math.round((cy - r * Math.cos(rad)) * 100) / 100,
  };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const sweep = ((endAngle - startAngle) % 360 + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function RiskGauge({ level }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(4, level));
  const active = segments[clamped];

  /* Gauge geometry */
  const cx = 120;
  const cy = 105;
  const r = 80;
  const sw = 18; // stroke width
  const startA = 225; // lower-left (7:30)
  const totalSweep = 270;
  const segAngle = totalSweep / 5;
  const gap = 2;

  /* Needle angle (center of active segment) */
  const needleA = startA + (clamped + 0.5) * segAngle;
  const needleLen = r - sw / 2 - 10;
  const tip = polarToCartesian(cx, cy, needleLen, needleA);

  return (
    <div className="flex flex-col items-center">
      {/* Semicircular gauge */}
      <svg
        width="240"
        height="145"
        viewBox="0 0 240 145"
        role="img"
        aria-label={`Nível de risco: ${active.label} (nível ${clamped})`}
        aria-roledescription="medidor de risco"
      >
        {/* Segment arcs */}
        {segments.map((seg, i) => {
          const sA = startA + i * segAngle + gap / 2;
          const eA = startA + (i + 1) * segAngle - gap / 2;
          return (
            <path
              key={seg.label}
              d={arcPath(cx, cy, r, sA, eA)}
              fill="none"
              stroke={i <= clamped ? seg.color : '#DCE8F7'}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={i <= clamped ? 1 : 0.35}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={tip.x}
          y2={tip.y}
          stroke={active.color}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={7} fill={active.color} />
        <circle cx={cx} cy={cy} r={3} fill="white" />
      </svg>

      {/* Level labels */}
      <div className="flex justify-between w-full max-w-[220px] -mt-1 px-1">
        {segments.map((seg, i) => (
          <span
            key={seg.label}
            className={cn(
              'text-[10px] font-semibold transition-colors leading-tight text-center',
              i === clamped ? '' : 'text-hydro-text-secondary/60'
            )}
            style={i === clamped ? { color: seg.color } : undefined}
          >
            {seg.label}
          </span>
        ))}
      </div>

      {/* Current level display */}
      <div className="mt-2 flex items-center gap-2">
        <span
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: active.color }}
        >
          {active.label.toUpperCase()}
        </span>
        <span className="text-sm text-hydro-text-secondary font-medium">
          (Nível {clamped})
        </span>
      </div>
    </div>
  );
}
