import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.sdis53.peac.test',
  appName: 'PEAC Test',
  webDir: 'www',
  // No live reload server — fully bundled for offline use
  server: {
    androidScheme: 'https',
    // Preserve localStorage across WebView updates
    cleartext: false,
  },
  android: {
    // Allow mixed content for local file loading
    allowMixedContent: false,
    // Keep WebView data on app updates
    webContentsDebuggingEnabled: true,
    // Minimum SDK for Galaxy Tab Active5 (Android 14)
    minSdkVersion: 26,
    // Build target
    targetSdkVersion: 34,
  },
  plugins: {
    // Preserve data when app is killed or updated
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;
