import { createStore, del, get, set, type UseStore } from 'idb-keyval';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Web (PWA) cover storage. Browsers have no app file system and localStorage
// tops out around 5 MB, so cover photos live in IndexedDB as Blobs and books
// point at them with an `idb:<key>` URI. Native builds never touch this.

const PREFIX = 'idb:';

let store: UseStore | null = null;
const covers = () => (store ??= createStore('trophyshelf', 'covers'));

export const isWebCover = (uri: string | null | undefined): uri is string =>
  !!uri && uri.startsWith(PREFIX);

// Saves any fetchable image URI (blob:, data:, https:) and returns its idb: URI.
export async function saveWebCover(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  const key = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  await set(key, blob, covers());
  requestPersistentStorage();
  return PREFIX + key;
}

export async function deleteWebCover(uri: string): Promise<void> {
  await del(uri.slice(PREFIX.length), covers());
}

// Ask the browser not to evict our data under storage pressure. Installed
// PWAs are usually granted this; a plain tab may be refused, which is fine.
let persistRequested = false;
function requestPersistentStorage() {
  if (persistRequested) return;
  persistRequested = true;
  navigator.storage?.persist?.().catch(() => {});
}

// Resolves a book's cover URI to something <Image> can show: idb: covers
// become object URLs (revoked when no longer shown); anything else passes
// straight through.
export function useCoverSource(uri: string | undefined): string | undefined {
  const needsLookup = Platform.OS === 'web' && isWebCover(uri);
  const [resolved, setResolved] = useState<string | undefined>(needsLookup ? undefined : uri);

  useEffect(() => {
    if (!needsLookup) {
      setResolved(uri);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    setResolved(undefined);
    get<Blob>(uri!.slice(PREFIX.length), covers())
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setResolved(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uri, needsLookup]);

  return resolved;
}
