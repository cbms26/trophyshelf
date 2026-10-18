import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { Book } from '../types';
import { deleteWebCover, isWebCover, saveWebCover } from './webCovers';

// expo-image-manipulator writes resized photos to the cache directory, which
// the OS may clear at any time. Covers that belong to a saved book are copied
// into the document directory so they last as long as the app does.
// On web there is no file system: covers go to IndexedDB (see webCovers.ts).

const COVERS_DIR = 'covers';

function coversDir(): Directory {
  const dir = new Directory(Paths.document, COVERS_DIR);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function isStoredCover(uri: string): boolean {
  return uri.startsWith(new Directory(Paths.document, COVERS_DIR).uri);
}

// Returns the permanent URI for a cover. Never throws: if the copy fails, the
// original URI is kept so saving a book is never blocked.
export async function persistCover(uri: string | null): Promise<string | null> {
  if (!uri) return uri;
  if (Platform.OS === 'web') {
    if (isWebCover(uri)) return uri;
    try {
      return await saveWebCover(uri);
    } catch {
      return uri;
    }
  }
  try {
    if (isStoredCover(uri)) return uri;
    const source = new File(uri);
    if (!source.exists) return uri;
    const destination = new File(coversDir(), `${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`);
    await source.copy(destination);
    return destination.uri;
  } catch {
    return uri;
  }
}

// Removes a stored cover when its book is deleted. Only touches files inside
// our covers folder.
export function deleteCover(uri: string | null): void {
  if (!uri) return;
  if (Platform.OS === 'web') {
    if (isWebCover(uri)) deleteWebCover(uri).catch(() => {});
    return;
  }
  try {
    if (!isStoredCover(uri)) return;
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A leftover file is harmless; don't fail the delete.
  }
}

// One pass over books saved before covers were made permanent: copy any cover
// still in the cache, and drop links to covers the OS has already cleared so
// the plate shows its placeholder instead of a blank image.
export async function moveCachedCovers(books: Book[]): Promise<{ books: Book[]; changed: boolean }> {
  if (Platform.OS === 'web') return { books, changed: false };
  let changed = false;
  const next: Book[] = [];
  for (const book of books) {
    if (!book.coverUri || isStoredCover(book.coverUri)) {
      next.push(book);
      continue;
    }
    let exists: boolean;
    try {
      exists = new File(book.coverUri).exists;
    } catch {
      // Not a path we can check — leave this book as it is.
      next.push(book);
      continue;
    }
    const coverUri = exists ? await persistCover(book.coverUri) : null;
    if (coverUri !== book.coverUri) changed = true;
    next.push({ ...book, coverUri });
  }
  return { books: next, changed };
}
