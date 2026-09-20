import { DetectedCover } from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  Shelf: undefined;
  Year: undefined;
  Capture: undefined;
  Analyzing: { photoUri: string | null };
  Confirm: { photoUri: string | null; detected: DetectedCover };
  Plaque: { bookId: string };
  Detail: { bookId: string };
};
