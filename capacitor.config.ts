import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.khamarkhata.app',
  appName: 'Khamar Khata',
  webDir: 'out',
  server: {
    url: 'https://khamar-khata.vercel.app/',
    cleartext: true
  }
};

export default config;
