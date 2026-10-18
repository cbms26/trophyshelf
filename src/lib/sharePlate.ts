import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { Platform, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Book } from '../types';

function shareText(book: Book) {
  return `${book.title} — ${book.author}\n\n"${book.inscription}"\n\nEnshrined on TrophyShelf.`;
}

// Shares plain text. On web, browsers without the Web Share API (most
// desktops) get the text copied to the clipboard instead.
export async function shareMessage(message: string) {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
    try {
      await navigator.clipboard.writeText(message);
      window.alert('Copied to your clipboard.');
    } catch {
      // Clipboard blocked too — nothing more we can do.
    }
    return;
  }
  await Share.share({ message }).catch(() => {});
}

// Web: share the plate as an image where the browser can share files
// (mobile Safari/Chrome), otherwise fall back to text.
async function sharePlateWeb(book: Book, plateRef: RefObject<View | null>) {
  try {
    if (plateRef.current && navigator.canShare) {
      const dataUri = await captureRef(plateRef, { format: 'png', quality: 1, result: 'data-uri' });
      const blob = await (await fetch(dataUri)).blob();
      const file = new File([blob], 'trophyshelf-plate.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: book.title, text: shareText(book) });
        return;
      }
    }
  } catch (err) {
    // The user dismissing the share sheet is not a failure.
    if (err instanceof Error && err.name === 'AbortError') return;
  }
  await shareMessage(shareText(book));
}

// Renders the plate view to a PNG and opens the share sheet with it.
// Falls back to sharing the inscription as text if capture or file sharing
// isn't available (some simulators, desktop browsers).
export async function sharePlate(book: Book, plateRef: RefObject<View | null>) {
  if (Platform.OS === 'web') return sharePlateWeb(book, plateRef);
  try {
    if (plateRef.current && (await Sharing.isAvailableAsync())) {
      const uri = await captureRef(plateRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: book.title });
      return;
    }
  } catch {
    // fall through to text
  }
  await shareMessage(shareText(book));
}
