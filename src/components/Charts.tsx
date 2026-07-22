import { useId } from 'react';

interface LineChartProps {
  data: { label: string; value: number; value2?: number }[];
  height?: number;
  color?: string;
  color2?: string;
  formatValue?: (n: number) => string;
  showSecondary?: boolean;
}

export function LineChart({
  data,
  height = 240,
  color = '#2563eb',
  color2 = '#16a34a',
  formatValue = (n) => n.toFixed(0),
  showSecondary = false,
}: LineChartProps) {
  const gradId = useId();
  const width = 760;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  if (data.length === 0) return <Empty height={height} />;

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.value2 ?? 0)), 1);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const pts = data.map((d, i) => ({
    x: padL + i * stepX,
    y: padT + innerH - (d.value / maxVal) * innerH,
    y2: padT + innerH - ((d.value2 ?? 0) / maxVal) * innerH,
    ...d,
  }));

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`;
  const path2 = showSecondary ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y2}`).join(' ') : '';

  const gridLines = 4;
  const ticks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const v = (maxVal / gridLines) * i;
    return { y: padT + innerH - (v / maxVal) * innerH, v };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="#e5e7eb" strokeWidth="1" />
          <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {formatValue(t.v)}
          </text>
        </g>
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {showSecondary && path2 && (
        <path d={path2} fill="none" stroke={color2} strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {pts.map((p, i) => (
        <g key={i} className="group">
          <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" className="transition-all group-hover:r-5" />
          {showSecondary && <circle cx={p.x} cy={p.y2} r="3" fill="white" stroke={color2} strokeWidth="1.5" />}
          <text x={p.x} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">
            {p.label}
          </text>
          <title>{`${p.label}: ${formatValue(p.value)}`}</title>
        </g>
      ))}
    </svg>
  );
}

interface BarChartProps {
  data: { label: string; value: number; sublabel?: string }[];
  height?: number;
  color?: string;
  horizontal?: boolean;
  formatValue?: (n: number) => string;
}

export function BarChart({
  data,
  height = 240,
  color = '#2563eb',
  horizontal = false,
  formatValue = (n) => n.toFixed(0),
}: BarChartProps) {
  if (data.length === 0) return <Empty height={height} />;

  if (horizontal) {
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const barH = Math.min(28, (height - 8) / data.length);
    const labelW = 110;
    const chartW = 760 - labelW - 60;
    return (
      <svg viewBox={`0 0 760 ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {data.map((d, i) => {
          const y = i * (barH + 4) + 2;
          const w = (d.value / maxVal) * chartW;
          return (
            <g key={i} className="group">
              <text x={labelW - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize="11" fill="#475569">
                {d.label.length > 16 ? d.label.slice(0, 15) + '…' : d.label}
              </text>
              <rect x={labelW} y={y} width={chartW} height={barH} rx="4" fill="#f1f5f9" />
              <rect
                x={labelW}
                y={y}
                width={w}
                height={barH}
                rx="4"
                fill={color}
                className="transition-all duration-500"
                style={{ opacity: 0.85 }}
              />
              <text x={labelW + w + 6} y={y + barH / 2 + 4} fontSize="10" fill="#64748b">
                {formatValue(d.value)}
              </text>
              <title>{`${d.label}: ${formatValue(d.value)}`}</title>
            </g>
          );
        })}
      </svg>
    );
  }

  const width = 760;
  const padL = 48;
  const padR = 12;
  const padT = 12;
  const padB = 40;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const slot = innerW / data.length;
  const barW = Math.min(slot * 0.6, 42);

  const gridLines = 4;
  const ticks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const v = (maxVal / gridLines) * i;
    return { y: padT + innerH - (v / maxVal) * innerH, v };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="#e5e7eb" strokeWidth="1" />
          <text x={padL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {formatValue(t.v)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = padL + i * slot + (slot - barW) / 2;
        const h = (d.value / maxVal) * innerH;
        const y = padT + innerH - h;
        return (
          <g key={i} className="group">
            <rect x={x} y={y} width={barW} height={h} rx="4" fill={color} className="transition-all duration-500" style={{ opacity: 0.85 }} />
            <text x={x + barW / 2} y={height - 18} textAnchor="middle" fontSize="10" fill="#64748b">
              {d.label.length > 10 ? d.label.slice(0, 9) + '…' : d.label}
            </text>
            <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {d.sublabel ?? ''}
            </text>
            <title>{`${d.label}: ${formatValue(d.value)}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

interface DonutChartProps {
  data: { label: string; value: number }[];
  height?: number;
  formatValue?: (n: number) => string;
}

const DONUT_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7'];

export function DonutChart({ data, height = 220, formatValue = (n) => n.toFixed(0) }: DonutChartProps) {
  if (data.length === 0) return <Empty height={height} />;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 110;
  const cy = height / 2;
  const r = 80;
  const rInner = 48;

  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const frac = d.value / total;
    const a2 = angle + frac * Math.PI * 2;
    const slice = { ...d, color: DONUT_COLORS[i % DONUT_COLORS.length], frac, a1: angle, a2 };
    angle = a2;
    return slice;
  });

  const arc = (a1: number, a2: number, ro: number, ri: number) => {
    const x1 = cx + ro * Math.cos(a1);
    const y1 = cy + ro * Math.sin(a1);
    const x2 = cx + ro * Math.cos(a2);
    const y2 = cy + ro * Math.sin(a2);
    const x3 = cx + ri * Math.cos(a2);
    const y3 = cy + ri * Math.sin(a2);
    const x4 = cx + ri * Math.cos(a1);
    const y4 = cy + ri * Math.sin(a1);
    const large = a2 - a1 > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${ro} ${ro} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ri} ${ri} 0 ${large} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 220 ${height}`} style={{ height }} preserveAspectRatio="xMidYMid meet">
        {slices.map((s, i) => (
          <path key={i} d={arc(s.a1, s.a2, r, rInner)} fill={s.color} className="transition-opacity hover:opacity-80" stroke="white" strokeWidth="1.5">
            <title>{`${s.label}: ${formatValue(s.value)} (${(s.frac * 100).toFixed(1)}%)`}</title>
          </path>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#94a3b8">Total</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">
          {formatValue(total)}
        </text>
      </svg>
      <div className="flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="flex-1 truncate text-slate-600">{s.label}</span>
            <span className="font-semibold text-slate-800">{(s.frac * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HeatmapProps {
  data: { row: string; col: string; value: number }[];
  formatValue?: (n: number) => string;
}

export function Heatmap({ data, formatValue = (n) => n.toFixed(0) }: HeatmapProps) {
  const rows = [...new Set(data.map((d) => d.row))];
  const cols = [...new Set(data.map((d) => d.col))];
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const cellW = 54;
  const cellH = 34;
  const labelW = 80;
  const labelH = 22;

  const color = (v: number) => {
    const t = v / maxVal;
    const r = Math.round(255 - t * (255 - 37));
    const g = Math.round(255 - t * (255 - 99));
    const b = Math.round(255 - t * (255 - 235));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <svg viewBox={`0 0 ${labelW + cols.length * cellW + 8} ${labelH + rows.length * cellH + 4}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {cols.map((c, ci) => (
        <text key={ci} x={labelW + ci * cellW + cellW / 2} y={labelH - 6} textAnchor="middle" fontSize="10" fill="#64748b">{c}</text>
      ))}
      {rows.map((r, ri) => (
        <g key={ri}>
          <text x={labelW - 6} y={labelH + ri * cellH + cellH / 2 + 4} textAnchor="end" fontSize="10" fill="#475569">{r}</text>
          {cols.map((c, ci) => {
            const cell = data.find((d) => d.row === r && d.col === c);
            const v = cell?.value ?? 0;
            return (
              <g key={ci}>
                <rect x={labelW + ci * cellW + 1} y={labelH + ri * cellH + 1} width={cellW - 2} height={cellH - 2} rx="3" fill={color(v)}>
                  <title>{`${r} × ${c}: ${formatValue(v)}`}</title>
                </rect>
                <text x={labelW + ci * cellW + cellW / 2} y={labelH + ri * cellH + cellH / 2 + 4} textAnchor="middle" fontSize="9" fill={v / maxVal > 0.5 ? 'white' : '#475569'}>
                  {v > 0 ? formatValue(v) : ''}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

function Empty({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center text-sm text-slate-400" style={{ height }}>
      No data
    </div>
  );
}
