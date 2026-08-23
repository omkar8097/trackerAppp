export function getNotificationPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
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

export async function enableNotificationsWithTest(): Promise<{ success: boolean; state: string; message: string }> {
  if (!('Notification' in window)) {
    return { success: false, state: 'unsupported', message: 'Web Notifications are not supported in this browser.' };
  }

  try {
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      await sendLocalNotification('🔔 Notifications Active!', {
        body: 'ExpenseFlow will notify you for every transaction and budget alert.',
        tag: 'notifications-test'
      });
      return { success: true, state: 'granted', message: 'Mobile notifications enabled!' };
    } else if (permission === 'denied') {
      return { success: false, state: 'denied', message: 'Notifications blocked in browser/device settings.' };
    } else {
      return { success: false, state: 'default', message: 'Notification prompt dismissed.' };
    }
  } catch (e: any) {
    return { success: false, state: 'error', message: e?.message || 'Failed to request notification permission.' };
  }
}

export async function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('[PWA Notifications] Notification permission not granted or unsupported.');
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
