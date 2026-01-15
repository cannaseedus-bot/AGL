import { buildOfflineAssets, logOfflineReady } from '../pwa/offline-cache.js';
import { buildNotificationPayload, canNotify } from '../pwa/pwa-notifications.js';
import { formatInstallPrompt, shouldOfferInstall } from '../pwa/pwa-install-prompt.js';

const assets = buildOfflineAssets();
logOfflineReady();

const installMessage = formatInstallPrompt('AGL Studio');
const shouldInstall = shouldOfferInstall({
  isStandalone: false,
  hasPromptEvent: true,
});

const notification = buildNotificationPayload(
  'AGL Studio Ready',
  'Open the app to continue where you left off.'
);
const notifyReady = canNotify({ permission: 'granted', supportsNotifications: true });

export {
  assets,
  installMessage,
  shouldInstall,
  notification,
  notifyReady,
};
