export function formatInstallPrompt(appName) {
  return `Install ${appName} for faster offline access.`;
}

export function shouldOfferInstall({ isStandalone, hasPromptEvent }) {
  return !isStandalone && hasPromptEvent;
}
