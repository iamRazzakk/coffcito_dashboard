import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

type ToneKey = 'brand' | 'green' | 'amber' | 'rose' | 'indigo' | 'slate';

const tones: Record<ToneKey, { bg: string; fg: string }> = {
  brand: { bg: 'bg-brand-50', fg: 'text-brand-600' },
  green: { bg: 'bg-emerald-50', fg: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', fg: 'text-amber-600' },
  rose: { bg: 'bg-rose-50', fg: 'text-rose-600' },
  indigo: { bg: 'bg-indigo-50', fg: 'text-indigo-600' },
  slate: { bg: 'bg-slate-100', fg: 'text-slate-700' },
};

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaDir?: string;
  icon?: LucideIcon;
  tone?: ToneKey;
  sub?: string;
}

export default function StatCard({ label, value, delta, deltaDir = 'up', icon: Icon, tone = 'brand', sub }: StatCardProps) {
  const t = tones[tone] || tones.brand;
  const deltaPositive = deltaDir === 'up';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] font-medium text-gray-500">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center`}>
            <Icon className={`w-[18px] h-[18px] ${t.fg}`} />
          </div>
        )}
      </div>
      <div className="text-[26px] font-semibold text-gray-900 leading-none tracking-tight">
        {value}
      </div>
      <div className="flex items-center gap-2 mt-3">
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-[12px] font-medium px-1.5 py-0.5 rounded
            ${deltaPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}
          >
            {deltaPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        )}
        {sub && <span className="text-[12px] text-gray-500">{sub}</span>}
      </div>
    </div>
  );
}
