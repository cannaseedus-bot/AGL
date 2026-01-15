export function buildNotificationPayload(title, body) {
  return {
    title,
    options: {
      body,
      icon: '/logo-primary.png',
      badge: '/logo-primary.png',
    },
  };
}

export function canNotify({ permission, supportsNotifications }) {
  return supportsNotifications && permission === 'granted';
}
