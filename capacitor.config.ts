import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.satyamlabs.ide',
  appName: 'SatyamLabs',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
