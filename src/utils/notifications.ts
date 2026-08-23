export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[PWA Notifications] Notification API is not supported in this browser environment.');
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export async function sendLocalNotification(title: string, options?: NotificationOptions) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('[PWA Notifications] Permission not granted to show notification.');
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
