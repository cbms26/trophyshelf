import { Platform } from 'react-native';

// Base URL for the web app's API routes (Gemini vision + inscriptions),
// which this app calls instead of duplicating that backend logic.
// The web (PWA) build is served from that same site, so it calls its own
// origin — which also keeps Vercel preview deploys talking to themselves.
// Override for local dev with: EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:3000
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? (Platform.OS === 'web' ? '' : 'https://trophyshelf.vercel.app');

// Base URL for the Librarian chat backend — its own repo/deployment
// (trophyshelf-librarian), separate from the web app above.
// Override for local dev with: EXPO_PUBLIC_LIBRARIAN_API_URL=http://<your-ip>:3100
export const LIBRARIAN_API_URL =
  process.env.EXPO_PUBLIC_LIBRARIAN_API_URL ?? 'https://trophy-shelf-ai-lib-assistant.vercel.app';

// Sent as `x-trophyshelf-client` on every API call; the servers' apiGuard
// accepts `mobile/<version>` and `web/<version>`.
export const CLIENT_HEADER = `${Platform.OS === 'web' ? 'web' : 'mobile'}/1.0`;
