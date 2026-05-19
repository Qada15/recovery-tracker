
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.recoverytracker.app',
  appName: 'Recovery Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
