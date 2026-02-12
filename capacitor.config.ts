import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.60a7a5f094314c27a44b25601c658cda',
  appName: 'SD Móveis Projetados',
  webDir: 'dist',
  server: {
    url: 'https://60a7a5f0-9431-4c27-a44b-25601c658cda.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    Geolocation: {
      // Request background location for trip tracking
    },
  },
};

export default config;
