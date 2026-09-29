import React from 'react';

export interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsBarProps {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
  rightSlot?: React.ReactNode;
}

export default function TabsBar({ tabs, value, onChange, rightSlot }: TabsBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 mb-5">
      <div className="flex items-center gap-1 ">
        {tabs.map(t => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${active ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <span className="flex items-center gap-2">
                {t.label}
                {typeof t.count === 'number' && (
                  <span className={`inline-flex items-center text-[11px] px-1.5 rounded-full
                    ${active ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.count}
                  </span>
                )}
              </span>
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-500 rounded" />
              )}
            </button>
          );
        })}
      </div>
      {rightSlot && <div className="pb-2">{rightSlot}</div>}
    </div>
  );
}
