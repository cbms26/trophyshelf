// Base URL for the web app's API routes (Gemini vision + inscriptions),
// which this app calls instead of duplicating that backend logic.
// Override for local dev with: EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:3000
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://trophyshelf.vercel.app';
