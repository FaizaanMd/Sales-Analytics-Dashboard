import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Panel({ title, subtitle, children, className = '', action }: PanelProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

interface DataTableProps {
  headers: string[];
  rows: (string | number)[][];
  align?: ('left' | 'right' | 'center')[];
}

export function DataTable({ headers, rows, align }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`pb-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${align?.[i] === 'right' ? 'text-right' : align?.[i] === 'center' ? 'text-center' : 'text-left'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`py-2.5 pr-4 ${align?.[ci] === 'right' ? 'text-right' : align?.[ci] === 'center' ? 'text-center' : 'text-left'} ${ci === 0 ? 'font-medium text-slate-700' : 'text-slate-600'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
