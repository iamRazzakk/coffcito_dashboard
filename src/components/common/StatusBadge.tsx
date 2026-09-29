type StatusType = 'active' | 'suspended' | 'banned' | 'pending' | 'reviewed' | 'paid' | 'refunded' | 'failed' | 'trial' | 'expired' | 'default';

const variants: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  suspended: 'bg-amber-50  text-amber-700  border-amber-100',
  banned:    'bg-rose-50   text-rose-700   border-rose-100',
  pending:   'bg-amber-50  text-amber-700  border-amber-100',
  approved:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  accepted:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  rejected:  'bg-rose-50   text-rose-700   border-rose-100',
  reviewed:  'bg-slate-100 text-slate-700  border-slate-200',
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-100',
  refunded:  'bg-rose-50   text-rose-700   border-rose-100',
  failed:    'bg-rose-50   text-rose-700   border-rose-100',
  trial:     'bg-indigo-50 text-indigo-700 border-indigo-100',
  expired:   'bg-slate-100 text-slate-600  border-slate-200',
  cancel:    'bg-rose-50   text-rose-700   border-rose-100',
  delete:    'bg-rose-50   text-rose-700   border-rose-100',
  default:   'bg-gray-100  text-gray-700   border-gray-200',
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cls = variants[status?.toLowerCase()] || variants.default;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span className="capitalize">{status}</span>
    </span>
  );
}
