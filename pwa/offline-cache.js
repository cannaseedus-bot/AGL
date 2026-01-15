export const OFFLINE_CACHE_NAME = 'agl-offline-v1';

export function buildOfflineAssets() {
  return [
    '/',
    '/index.html',
    '/manifest.json',
  ];
}

export function logOfflineReady(logger = console) {
  logger.info('Offline cache is ready for the AGL PWA.');
}
