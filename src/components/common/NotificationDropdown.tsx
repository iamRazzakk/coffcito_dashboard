import React from 'react';
import { Bell, CheckCheck, ShieldAlert, Zap, DollarSign, Info } from 'lucide-react';

import { Notification } from '../../data/mockData';

const icons: Record<string, React.ReactNode> = {
  report: <ShieldAlert className="w-4 h-4 text-red-500" />,
  system: <Zap className="w-4 h-4 text-amber-500" />,
  monetization: <DollarSign className="w-4 h-4 text-emerald-500" />,
  support: <Info className="w-4 h-4 text-blue-500" />,
  moderation: <ShieldAlert className="w-4 h-4 text-purple-500" />,
};

interface NotificationDropdownProps {
  notifications: Notification[];
  onReadAll: () => void;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationDropdown({ notifications, onReadAll, onMarkAsRead }: NotificationDropdownProps) {
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={onReadAll}
            className="text-[11px] font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
          >
            <CheckCheck className="w-3 h-3" />
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => onMarkAsRead(n.id)}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition flex gap-3 relative
                         ${n.unread ? 'bg-brand-50/30' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                             ${n.unread ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                {icons[n.type] || <Info className="w-4 h-4 text-gray-400" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[13px] leading-tight truncate ${n.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {n.title}
                  </p>
                  <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-normal">
                  {n.message}
                </p>
              </div>

              {n.unread && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-500 rounded-full" />
              )}
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center">
            <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/30">
        <button className="w-full py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition">
          View all notifications
        </button>
      </div>
    </div>
  );
}
