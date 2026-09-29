interface UserCellProps {
  name: string;
  email?: string;
  avatarColor?: string;
}

export default function UserCell({ name, email, avatarColor }: UserCellProps) {
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const bg = avatarColor || 'from-brand-400 to-brand-600';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${bg} text-white text-[12px] font-semibold flex items-center justify-center`}>
        {initials}
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-gray-900 truncate">{name}</div>
        {email && <div className="text-[11px] text-gray-500 truncate">{email}</div>}
      </div>
    </div>
  );
}
