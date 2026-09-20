import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Book } from '../types';

function shareText(book: Book) {
  return `${book.title} — ${book.author}\n\n"${book.inscription}"\n\nEnshrined on TrophyShelf.`;
}

// Renders the plate view to a PNG and opens the share sheet with it.
// Falls back to sharing the inscription as text if capture or file sharing
// isn't available (web, some simulators).
export async function sharePlate(book: Book, plateRef: RefObject<View | null>) {
  try {
    if (plateRef.current && (await Sharing.isAvailableAsync())) {
      const uri = await captureRef(plateRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: book.title });
      return;
    }
  } catch {
    // fall through to text
  }
  await Share.share({ message: shareText(book) }).catch(() => {});
}
