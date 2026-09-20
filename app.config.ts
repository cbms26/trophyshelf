import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'TrophyShelf',
  slug: 'trophyshelf',
  owner: 'coder.cbms',
  version: '1.0.0',
  scheme: 'trophyshelf',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: 'com.cbms26.trophyshelf',
    supportsTablet: false,
    infoPlist: {
      // Standard HTTPS only — skips the export-compliance prompt on every build.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.cbms26.trophyshelf',
    adaptiveIcon: {
      backgroundColor: '#f3f2f2',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    // The image picker uses the system photo picker, which needs no
    // storage permission on modern Android.
    permissions: ['android.permission.CAMERA'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission:
          "TrophyShelf uses the camera to photograph a book's cover so it can be enshrined on your shelf.",
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'TrophyShelf uses your photo library so you can pick an existing cover photo to enshrine.',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#f3f2f2',
      },
    ],
    'expo-dev-client',
  ],
  extra: {
    eas: {
      projectId: '768483a8-19e7-4141-ad76-a5e779786447',
    },
  },
};

export default config;
