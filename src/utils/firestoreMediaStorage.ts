import { doc, setDoc, getDoc, getDocs, collection, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { getMediaBlob, storeMediaBlob, deleteMediaBlob } from "./indexedDbStorage";

/**
 * Chunk size in bytes for storing large video files in Firestore documents.
 * Firestore limit per doc is 1,048,576 bytes.
 * Base64 encoding expands binary data by 4/3 (~133%).
 * 600,000 bytes binary * 1.33 ≈ 800,000 bytes Base64, comfortably below the 1MB limit.
 */
const CHUNK_SIZE = 600 * 1024; // 600 KB

export interface VideoMediaMeta {
  videoId: string;
  fileName: string;
  mimeType: string;
  totalSize: number;
  chunkCount: number;
  createdAt: string;
  status: "uploading" | "ready" | "error";
}

/**
 * Checks if a given media URL is a Firestore-stored media URI
 */
export function isFirestoreMediaUrl(url: string): boolean {
  return typeof url === "string" && (url.startsWith("firestore://") || url.startsWith("db://"));
}

/**
 * Extracts video ID from firestore://{videoId}
 */
export function getFirestoreMediaId(url: string): string {
  if (!url) return "";
  return url.replace(/^firestore:\/\//, "").replace(/^db:\/\//, "");
}

/**
 * Helper: Convert a Blob/File slice to a Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result) {
        resolve("");
        return;
      }
      // Remove data:*/*;base64, prefix
      const commaIndex = result.indexOf(",");
      if (commaIndex !== -1) {
        resolve(result.substring(commaIndex + 1));
      } else {
        resolve(result);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper: Convert a Base64 string back to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Uploads a video File directly into Firestore database collections.
 * Splits into chunks and writes each chunk into Firestore.
 * Anyone on ANY machine/network can access and stream it via Firestore.
 */
export async function saveVideoFileToFirestore(
  videoId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const totalSize = file.size;
  const mimeType = file.type || "video/mp4";
  const chunkCount = Math.ceil(totalSize / CHUNK_SIZE);

  // 1. Write metadata doc marking status as "uploading"
  const metaRef = doc(db, "video_media", videoId);
  await setDoc(metaRef, {
    videoId,
    fileName: file.name,
    mimeType,
    totalSize,
    chunkCount,
    createdAt: new Date().toISOString(),
    status: "uploading"
  });

  // 2. Upload chunks sequentially
  for (let i = 0; i < chunkCount; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const slice = file.slice(start, end, mimeType);
    const base64Data = await blobToBase64(slice);

    const chunkRef = doc(db, "video_media", videoId, "chunks", String(i));
    await setDoc(chunkRef, {
      index: i,
      data: base64Data,
      size: slice.size
    });

    if (onProgress) {
      const percent = Math.round(((i + 1) / chunkCount) * 100);
      onProgress(percent);
    }
  }

  // 3. Mark status as "ready"
  await setDoc(metaRef, { status: "ready" }, { merge: true });

  // 4. Cache in local IndexedDB for immediate zero-latency playback on uploader machine
  try {
    await storeMediaBlob(videoId, file, file.name);
  } catch (err) {
    console.warn("Failed to cache in IndexedDB:", err);
  }

  return `firestore://${videoId}`;
}

/**
 * Downloads a video from Firestore database (across any browser or computer),
 * reassembles the binary chunks into a single playable Blob.
 */
export async function loadVideoBlobFromFirestore(
  videoId: string,
  onProgress?: (percent: number) => void
): Promise<Blob | null> {
  if (!videoId) return null;

  // 1. Check local IndexedDB cache first
  try {
    const cachedBlob = await getMediaBlob(videoId);
    if (cachedBlob && cachedBlob.size > 0) {
      return cachedBlob;
    }
  } catch (e) {
    console.warn("IndexedDB cache read error:", e);
  }

  // 2. Fetch metadata from Firestore
  const metaRef = doc(db, "video_media", videoId);
  const metaSnap = await getDoc(metaRef);
  if (!metaSnap.exists()) {
    console.warn(`Firestore video_media document not found for id: ${videoId}`);
    return null;
  }

  const meta = metaSnap.data() as VideoMediaMeta;
  const chunkCount = meta.chunkCount || 0;
  const mimeType = meta.mimeType || "video/mp4";

  if (chunkCount === 0) return null;

  // 3. Fetch all chunks from Firestore
  const chunksCol = collection(db, "video_media", videoId, "chunks");
  const chunksSnapshot = await getDocs(chunksCol);

  if (chunksSnapshot.empty) {
    console.warn(`No chunks found in Firestore for video id: ${videoId}`);
    return null;
  }

  const chunkList: { index: number; data: string }[] = [];
  chunksSnapshot.forEach((docSnap) => {
    const d = docSnap.data();
    chunkList.push({
      index: d.index ?? parseInt(docSnap.id, 10),
      data: d.data
    });
  });

  // Sort chunks by index to ensure proper byte ordering
  chunkList.sort((a, b) => a.index - b.index);

  // 4. Reconstruct byte arrays
  const byteArrays: Uint8Array[] = [];
  for (let i = 0; i < chunkList.length; i++) {
    const chunk = chunkList[i];
    const bytes = base64ToUint8Array(chunk.data);
    byteArrays.push(bytes);

    if (onProgress) {
      const percent = Math.round(((i + 1) / chunkList.length) * 100);
      onProgress(percent);
    }
  }

  // 5. Create final Blob
  const finalBlob = new Blob(byteArrays, { type: mimeType });

  // 6. Cache into IndexedDB for instant playback in subsequent views
  try {
    await storeMediaBlob(videoId, finalBlob, meta.fileName || `video-${videoId}.mp4`);
  } catch (err) {
    console.warn("Failed to cache reconstructed blob to IndexedDB:", err);
  }

  return finalBlob;
}

/**
 * Deletes video media and its chunks from Firestore
 */
export async function deleteVideoMediaFromFirestore(videoId: string): Promise<void> {
  if (!videoId) return;

  try {
    // 1. Delete local cache
    deleteMediaBlob(videoId);

    // 2. Delete chunks
    const chunksCol = collection(db, "video_media", videoId, "chunks");
    const snapshot = await getDocs(chunksCol);
    const batch = writeBatch(db);

    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // 3. Delete metadata doc
    batch.delete(doc(db, "video_media", videoId));
    await batch.commit();
  } catch (err) {
    console.warn("Error deleting video media from Firestore:", err);
  }
}
