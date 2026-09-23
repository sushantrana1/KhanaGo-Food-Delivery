import { useEffect, useState, useCallback } from "react";

const NOTIF_KEY = "khanago_notifications";
const MAX_NOTIFS = 20;

/* Read from localStorage */
const readStored = () => {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/* Write to localStorage */
const writeStored = (list) => {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, MAX_NOTIFS)));
  } catch {
    /* ignore */
  }
};

export default function useNotifications() {
  const [notifications, setNotifications] = useState(() => readStored());

  // Persist to localStorage whenever it changes
  useEffect(() => {
    writeStored(notifications);
  }, [notifications]);

  // Add a notification
  const push = useCallback((notif) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [item, ...prev].slice(0, MAX_NOTIFS));
    return item.id;
  }, []);

  // Mark one as read
  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Remove one
  const remove = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all
  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    push,
    markRead,
    markAllRead,
    remove,
    clear,
  };
}