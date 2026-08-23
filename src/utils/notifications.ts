const NOTIF_ENABLED_STORAGE_KEY = 'expense_tracker_notifications_enabled';

export function getNotificationPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function isNotificationEnabledByUser(): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const saved = localStorage.getItem(NOTIF_ENABLED_STORAGE_KEY);
    if (saved !== null) {
      return JSON.parse(saved) === true;
    }
  } catch (e) {
    console.error('Failed reading notification preference', e);
  }
  return Notification.permission === 'granted';
}

export function setNotificationEnabledByUser(enabled: boolean) {
  try {
    localStorage.setItem(NOTIF_ENABLED_STORAGE_KEY, JSON.stringify(enabled));
  } catch (e) {
    console.error('Failed saving notification preference', e);
  }
  if (!enabled && reminderTimerId) {
    clearTimeout(reminderTimerId);
    reminderTimerId = null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[PWA Notifications] Notification API is not supported in this browser environment.');
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('[PWA Notifications] requestPermission error:', e);
      return false;
    }
  }
  return false;
}

export async function toggleNotifications(): Promise<{ isEnabled: boolean; state: string; message: string }> {
  if (!('Notification' in window)) {
    return { isEnabled: false, state: 'unsupported', message: 'Notifications are not supported in this browser.' };
  }

  const currentlyEnabled = isNotificationEnabledByUser();

  if (currentlyEnabled) {
    // Turn OFF
    setNotificationEnabledByUser(false);
    return { isEnabled: false, state: Notification.permission, message: 'Notifications & Daily Reminders turned OFF.' };
  } else {
    // Turn ON
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      setNotificationEnabledByUser(true);
      await sendLocalNotification('🔔 Notifications Active!', {
        body: 'ExpenseFlow will notify you daily at 9:00 PM IST with your financial summary.',
        tag: 'notifications-test'
      });
      return { isEnabled: true, state: 'granted', message: 'Notifications & Daily 9 PM Reminders turned ON!' };
    } else if (permission === 'denied') {
      setNotificationEnabledByUser(false);
      return { isEnabled: false, state: 'denied', message: 'Notifications blocked in browser settings.' };
    } else {
      setNotificationEnabledByUser(false);
      return { isEnabled: false, state: 'default', message: 'Notification prompt dismissed.' };
    }
  }
}

export async function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (!isNotificationEnabledByUser()) {
    console.log('[PWA Notifications] Notifications are turned OFF by user setting.');
    return;
  }

  const iconUrl = `${import.meta.env.BASE_URL}pwa-192x192.svg`;
  const badgeUrl = `${import.meta.env.BASE_URL}favicon.svg`;

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        icon: iconUrl,
        badge: badgeUrl,
        ...options,
      } as any);
      return;
    } catch (e) {
      console.warn('[PWA Notifications] ServiceWorker showNotification failed, using fallback:', e);
    }
  }

  // Fallback to Window Notification API
  try {
    new Notification(title, {
      icon: iconUrl,
      ...options,
    });
  } catch (e) {
    console.error('[PWA Notifications] Notification display error:', e);
  }
}

let reminderTimerId: ReturnType<typeof setTimeout> | null = null;

export function scheduleDaily9PMReminder(getDailySummary: () => { todayExpense: number; todayIncome: number; todayCount: number }) {
  if (reminderTimerId) {
    clearTimeout(reminderTimerId);
    reminderTimerId = null;
  }

  if (!isNotificationEnabledByUser()) {
    return;
  }

  const now = new Date();
  const target = new Date();
  target.setHours(21, 0, 0, 0); // 9:00 PM IST (21:00)

  if (now >= target) {
    target.setDate(target.getDate() + 1); // Next day 9 PM if past 9 PM today
  }

  const msUntilTarget = target.getTime() - now.getTime();

  reminderTimerId = setTimeout(async () => {
    const summary = getDailySummary();
    const formattedExpense = summary.todayExpense.toLocaleString('en-IN');
    const formattedIncome = summary.todayIncome.toLocaleString('en-IN');

    await sendLocalNotification('🌙 Daily Expense Summary (9:00 PM IST)', {
      body: `Today: Spent ₹${formattedExpense} | Income +₹${formattedIncome} (${summary.todayCount} entries). Tap to review your tracker!`,
      tag: 'daily-9pm-summary'
    });

    // Re-schedule for the next day's 9:00 PM
    scheduleDaily9PMReminder(getDailySummary);
  }, msUntilTarget);
}
