import { DetectedCover } from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  Shelf: undefined;
  Year: undefined;
  Settings: undefined;
  Capture: undefined;
  Analyzing: { photoUri: string; base64: string };
  Confirm:
    | { mode: 'create'; photoUri: string | null; detected: DetectedCover }
    | { mode: 'edit'; bookId: string };
  Plaque: { bookId: string };
  Detail: { bookId: string };
};
