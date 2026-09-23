import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Package,
  CheckCircle2,
  X,
} from "lucide-react";

/* Relative time */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationBell({
  notifications,
  unreadCount,
  markRead,
  markAllRead,
  remove,
  clear,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const hasUnread = unreadCount > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((p) => !p);
          if (!open && hasUnread) {
            // mark all as read once opened
            setTimeout(() => markAllRead(), 800);
          }
        }}
        className="group relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
        aria-label="Notifications"
      >
        {hasUnread ? (
          <BellRing
            size={20}
            className="transition-transform group-hover:scale-110"
          />
        ) : (
          <Bell
            size={20}
            className="transition-transform group-hover:scale-110"
          />
        )}

        {hasUnread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] z-50 w-[320px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 sm:w-[360px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-orange-500" />
              <h3 className="text-sm font-bold text-slate-800">
                Notifications
              </h3>
              {hasUnread && (
                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-emerald-600"
                  aria-label="Mark all as read"
                >
                  <CheckCheck size={15} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-500"
                  aria-label="Clear all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="text-slate-400" size={22} />
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  No notifications yet
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  You are all caught up
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((n) => {
                  const Icon =
                    n.type === "order_status" ? CheckCircle2 : Package;
                  const iconBg =
                    n.type === "order_status"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-500";

                  const Wrapper = n.link ? Link : "div";
                  const wrapperProps = n.link
                    ? {
                        to: n.link,
                        onClick: () => {
                          markRead(n.id);
                          setOpen(false);
                        },
                      }
                    : {};

                  return (
                    <li key={n.id}>
                      <Wrapper
                        {...wrapperProps}
                        className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${
                          n.link ? "cursor-pointer" : ""
                        } ${!n.read ? "bg-orange-50/40" : ""}`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                            )}
                          </div>
                          {n.body && (
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                              {n.body}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] font-medium text-slate-400">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            remove(n.id);
                          }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-100 hover:text-red-500"
                          aria-label="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </Wrapper>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}