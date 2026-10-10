/**
 * IndexedDB storage utility for persistent media blobs (videos, images)
 * This allows storing large video/image files locally in the user's browser,
 * persisting across page reloads and tab closures even if offline or using local files.
 */

const DB_NAME = "videocites_media_db";
const DB_VERSION = 1;
const STORE_NAME = "media_blobs";

interface StoredMediaItem {
  id: string;
  blob: Blob;
  mimeType: string;
  fileName?: string;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("IndexedDB open error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

/**
 * Stores a video or image file/blob in IndexedDB and returns a persistent id
 */
export async function storeMediaBlob(id: string, fileOrBlob: Blob, fileName?: string): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record: StoredMediaItem = {
      id,
      blob: fileOrBlob,
      mimeType: fileOrBlob.type || "video/mp4",
      fileName: fileName || "uploaded-video.mp4",
      updatedAt: Date.now()
    };

    const request = store.put(record);

    request.onsuccess = () => resolve(id);
    request.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

/**
 * Retrieves a stored media file/blob from IndexedDB by id
 */
export async function getMediaBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result as StoredMediaItem | undefined;
      resolve(result ? result.blob : null);
    };
    request.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

/**
 * Deletes a stored media blob from IndexedDB by id
 */
export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  } catch (e) {
    console.warn("Could not delete from IndexedDB:", e);
  }
}

/**
 * Creates an active Blob Object URL for a given media id stored in IndexedDB.
 */
export async function getMediaBlobUrl(id: string): Promise<string | null> {
  try {
    const blob = await getMediaBlob(id);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (e) {
    console.error("Failed to load blob URL from IndexedDB:", e);
    return null;
  }
}

/**
 * Check if a URL is an IndexedDB reference pointer (e.g., idb://video-123)
 */
export function isIndexedDbUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith("idb://");
}

export function getIndexedDbId(url: string): string {
  return url.replace("idb://", "");
}

/**
 * Extracts a frame from a video File as an image Data URL to use as cover thumbnail
 */
export function extractThumbnailFromVideoFile(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const blobUrl = URL.createObjectURL(file);
    video.src = blobUrl;

    const cleanup = () => {
      URL.revokeObjectURL(blobUrl);
      video.remove();
    };

    video.onloadeddata = () => {
      // Seek slightly into the video to avoid a black opening frame
      const seekTime = Math.min(1.0, video.duration > 2 ? 1.0 : video.duration * 0.2);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          cleanup();
          resolve(dataUrl);
          return;
        }
      } catch (err) {
        console.warn("Could not capture video frame canvas:", err);
      }
      cleanup();
      resolve("");
    };

    video.onerror = () => {
      cleanup();
      resolve("");
    };

    // Fallback timer if metadata loading hangs
    setTimeout(() => {
      cleanup();
      resolve("");
    }, 4000);
  });
}
