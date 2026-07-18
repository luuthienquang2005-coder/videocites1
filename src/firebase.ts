import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { Video, VideoComment, Photo, PhotoComment } from "./types";
import { INITIAL_VIDEOS, MOCK_COMMENTS, INITIAL_PHOTOS } from "./data";
import { generateCommentsForVideo, generateCommentsForPhoto } from "./utils/commentGenerator";

// Load configuration from firebase-applet-config.json
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the databaseId from config if provided
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || "(default)"
);

console.log("Firebase initialized with project:", firebaseConfig.projectId, "and DB:", firebaseConfig.firestoreDatabaseId);

// Error handling helper as mandated by firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Status Listener system for UI notifications and fallback trigger
export type FirestoreStatusCallback = (status: { error: string | null; isQuota: boolean }) => void;
const statusListeners = new Set<FirestoreStatusCallback>();
export let isQuotaExceeded = false;
let lastQuotaErrorMsg = "";

export function addFirestoreStatusListener(cb: FirestoreStatusCallback) {
  statusListeners.add(cb);
  if (isQuotaExceeded) {
    cb({ error: lastQuotaErrorMsg || "Quota limit exceeded", isQuota: true });
  }
  return () => {
    statusListeners.delete(cb);
  };
}

export function notifyFirestoreStatus(errorMsg: string | null, isQuota: boolean) {
  if (isQuota) {
    lastQuotaErrorMsg = errorMsg || "Quota limit exceeded";
    isQuotaExceeded = true;
  }
  statusListeners.forEach((cb) => cb({ error: errorMsg, isQuota }));
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuota = errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("resource_exhausted") || errMsg.toLowerCase().includes("quota limit exceeded");

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  if (isQuota) {
    isQuotaExceeded = true;
    lastQuotaErrorMsg = errMsg;
    notifyFirestoreStatus(errMsg, true);
    console.warn("Firestore service notice (Quota limit exceeded):", errMsg, "Operation:", operationType, "Path:", path);
    return; // Return gracefully without throwing to avoid uncaught exceptions
  }

  throw new Error(JSON.stringify(errInfo));
}

// Seeding function: Seeds initial videos and comments if they don't exist yet in Firestore
export async function seedInitialDataIfNeeded() {
  if (isQuotaExceeded) {
    console.warn("Firestore quota is exceeded, skipping seedInitialDataIfNeeded");
    return;
  }

  try {
    if (typeof window !== "undefined" && window.localStorage && window.localStorage.getItem("videocites-seeded-checked") === "true") {
      console.log("Database has already been seeded or verified in a previous session. Skipping collection scans to conserve free daily read quota.");
      return;
    }
  } catch (e) {
    console.warn("localStorage check failed:", e);
  }

  const path = "videos";
  try {
    const videosCol = collection(db, "videos");
    const snapshot = await getDocs(videosCol);
    
    // Track existing video IDs
    const existingIds = new Set<string>();
    snapshot.forEach((doc) => {
      existingIds.add(doc.id);
    });

    if (snapshot.empty) {
      console.log("Firestore videos collection is empty, seeding initial data...");
      
      // Seed videos
      for (const video of INITIAL_VIDEOS) {
        await setDoc(doc(db, "videos", video.id), video);
        
        // Seed comments (20-30 comments each)
        const randomCount = Math.floor(Math.random() * 11) + 20; // 20-30 comments
        const commentList = generateCommentsForVideo(video, randomCount);
        await setDoc(doc(db, "comments", video.id), { comments: commentList });
      }
      
      console.log("Firestore seeding completed successfully.");
    } else {
      console.log("Firestore database already has data, checking for missing default videos, updated publication dates, and comments auto-filling...");
      let addedCount = 0;
      let updatedCount = 0;
      for (const video of INITIAL_VIDEOS) {
        if (!existingIds.has(video.id)) {
          await setDoc(doc(db, "videos", video.id), video);
          
          // Seed initial comments (20-30 comments each)
          const randomCount = Math.floor(Math.random() * 11) + 20;
          const commentList = generateCommentsForVideo(video, randomCount);
          await setDoc(doc(db, "comments", video.id), { comments: commentList });
          addedCount++;
        } else {
          // Check if publication date has updated
          const matchingDoc = snapshot.docs.find((d) => d.id === video.id);
          if (matchingDoc) {
            const data = matchingDoc.data() as Video;
            if (data.publishedAt !== video.publishedAt) {
              await setDoc(doc(db, "videos", video.id), {
                ...data,
                publishedAt: video.publishedAt
              });
              updatedCount++;
            }
          }
        }
      }

      // Check comments count for ALL videos currently stored in the system (existing & new)
      const commentsCol = collection(db, "comments");
      const commentsSnapshot = await getDocs(commentsCol);
      const commentsMap = new Map<string, VideoComment[]>();
      commentsSnapshot.forEach((doc) => {
        commentsMap.set(doc.id, doc.data().comments || []);
      });

      // Reload latest video entries to cover any new ones just added
      const latestVideosSnapshot = await getDocs(videosCol);
      const allVideos: Video[] = [];
      latestVideosSnapshot.forEach((doc) => {
        allVideos.push(doc.data() as Video);
      });

      let autoPopulatedCommentsCount = 0;
      for (const video of allVideos) {
        const existingComments = commentsMap.get(video.id) || [];
        if (existingComments.length === 0) {
          // Automatically generate 20-30 comments based on caption/description/tags
          const randomCount = Math.floor(Math.random() * 11) + 20;
          const generated = generateCommentsForVideo(video, randomCount);
          await setDoc(doc(db, "comments", video.id), { comments: generated });
          autoPopulatedCommentsCount++;
        }
      }

      if (addedCount > 0 || updatedCount > 0 || autoPopulatedCommentsCount > 0) {
        console.log(`Incremental seeding completed. Added ${addedCount} default videos, updated ${updatedCount} dates, and backfilled ${autoPopulatedCommentsCount} videos with 20-30 comments.`);
      } else {
        console.log("Firestore already fully synchronized and populated with comments.");
      }
    }

    // --- PHOTO SEEDING PORTION ---
    const photosCol = collection(db, "photos");
    const photoSnapshot = await getDocs(photosCol);
    const existingPhotoIds = new Set<string>();
    photoSnapshot.forEach((doc) => {
      existingPhotoIds.add(doc.id);
    });

    if (photoSnapshot.empty) {
      console.log("Firestore photos collection is empty, seeding initial photos...");
      for (const photo of INITIAL_PHOTOS) {
        await setDoc(doc(db, "photos", photo.id), photo);
        const randomCount = Math.floor(Math.random() * 11) + 20;
        const commentList = generateCommentsForPhoto(photo, randomCount);
        await setDoc(doc(db, "photoComments", photo.id), { comments: commentList });
      }
      console.log("Firestore photo seeding completed successfully.");
    } else {
      let addedPhotos = 0;
      for (const photo of INITIAL_PHOTOS) {
        if (!existingPhotoIds.has(photo.id)) {
          await setDoc(doc(db, "photos", photo.id), photo);
          const randomCount = Math.floor(Math.random() * 11) + 20;
          const commentList = generateCommentsForPhoto(photo, randomCount);
          await setDoc(doc(db, "photoComments", photo.id), { comments: commentList });
          addedPhotos++;
        }
      }
      
      const photoCommentsCol = collection(db, "photoComments");
      const photoCommentsSnapshot = await getDocs(photoCommentsCol);
      const photoCommentsMap = new Map<string, PhotoComment[]>();
      photoCommentsSnapshot.forEach((doc) => {
        photoCommentsMap.set(doc.id, doc.data().comments || []);
      });

      const latestPhotosSnapshot = await getDocs(photosCol);
      const allPhotos: Photo[] = [];
      latestPhotosSnapshot.forEach((doc) => {
        allPhotos.push(doc.data() as Photo);
      });

      let autoPopulatedPhotoComments = 0;
      for (const photo of allPhotos) {
        const existingComments = photoCommentsMap.get(photo.id) || [];
        if (existingComments.length === 0) {
          const randomCount = Math.floor(Math.random() * 11) + 20;
          const generated = generateCommentsForPhoto(photo, randomCount);
          await setDoc(doc(db, "photoComments", photo.id), { comments: generated });
          autoPopulatedPhotoComments++;
        }
      }
      if (addedPhotos > 0 || autoPopulatedPhotoComments > 0) {
        console.log(`Incremental photo seeding completed. Added ${addedPhotos} photos and backfilled comments for ${autoPopulatedPhotoComments} photos.`);
      }
    }

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("videocites-seeded-checked", "true");
      }
    } catch (e) {
      console.warn("Could not save seeding status to localStorage:", e);
    }

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to all videos in real-time
export function subscribeToVideos(onUpdate: (videos: Video[]) => void) {
  const videosCol = collection(db, "videos");
  return onSnapshot(videosCol, (snapshot) => {
    const list: Video[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Video);
    });
    // Sort or preserve default order if needed, or by title/publishedAt
    // Let's sort by publishedAt descending to keep new videos on top
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "videos");
  });
}

// Subscribe to comments for a specific video in real-time
export function subscribeToComments(videoId: string, onUpdate: (comments: VideoComment[]) => void) {
  const commentPath = `comments/${videoId}`;
  const commentDoc = doc(db, "comments", videoId);
  return onSnapshot(commentDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      onUpdate(data.comments || []);
    } else {
      onUpdate([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, commentPath);
  });
}

// Fetch a single video from Firestore
export async function getVideoFromFirestore(videoId: string): Promise<Video | null> {
  try {
    const docSnap = await getDoc(doc(db, "videos", videoId));
    if (docSnap.exists()) {
      return docSnap.data() as Video;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `videos/${videoId}`);
    return null;
  }
}

// Fetch a single photo from Firestore
export async function getPhotoFromFirestore(photoId: string): Promise<Photo | null> {
  try {
    const docSnap = await getDoc(doc(db, "photos", photoId));
    if (docSnap.exists()) {
      return docSnap.data() as Photo;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `photos/${photoId}`);
    return null;
  }
}

// Add or update a video in Firestore
export async function saveVideoToFirestore(video: Video) {
  const videoPath = `videos/${video.id}`;
  try {
    await setDoc(doc(db, "videos", video.id), video);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, videoPath);
  }
}

// Delete a video and its comments from Firestore
export async function deleteVideoFromFirestore(videoId: string) {
  try {
    await deleteDoc(doc(db, "videos", videoId));
    await deleteDoc(doc(db, "comments", videoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `videos/${videoId}`);
  }
}

// Save comments for a video
export async function saveCommentsToFirestore(videoId: string, comments: VideoComment[]) {
  const commentPath = `comments/${videoId}`;
  try {
    await setDoc(doc(db, "comments", videoId), { comments });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, commentPath);
  }
}

// Migrate comments when a video ID is changed
export async function migrateCommentsInFirestore(oldId: string, newId: string) {
  try {
    const oldCommentDoc = doc(db, "comments", oldId);
    const newCommentDoc = doc(db, "comments", newId);
    
    const snapshot = await getDocs(collection(db, "comments"));
    const oldCommentsData = snapshot.docs.find(d => d.id === oldId)?.data();
    
    if (oldCommentsData) {
      await setDoc(newCommentDoc, oldCommentsData);
      await deleteDoc(oldCommentDoc);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `comments/${newId}`);
  }
}

// Subscribe to all photos in real-time
export function subscribeToPhotos(onUpdate: (photos: Photo[]) => void) {
  const photosCol = collection(db, "photos");
  return onSnapshot(photosCol, (snapshot) => {
    const list: Photo[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Photo);
    });
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "photos");
  });
}

// Subscribe to photo comments in real-time
export function subscribeToPhotoComments(photoId: string, onUpdate: (comments: PhotoComment[]) => void) {
  const commentPath = `photoComments/${photoId}`;
  const commentDoc = doc(db, "photoComments", photoId);
  return onSnapshot(commentDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      onUpdate(data.comments || []);
    } else {
      onUpdate([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, commentPath);
  });
}

// Save a photo to Firestore
export async function savePhotoToFirestore(photo: Photo) {
  const photoPath = `photos/${photo.id}`;
  try {
    await setDoc(doc(db, "photos", photo.id), photo);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, photoPath);
  }
}

// Delete a photo and its comments
export async function deletePhotoFromFirestore(photoId: string) {
  try {
    await deleteDoc(doc(db, "photos", photoId));
    await deleteDoc(doc(db, "photoComments", photoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `photos/${photoId}`);
  }
}

// Save photo comments
export async function savePhotoCommentsToFirestore(photoId: string, comments: PhotoComment[]) {
  const commentPath = `photoComments/${photoId}`;
  try {
    await setDoc(doc(db, "photoComments", photoId), { comments });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, commentPath);
  }
}

// Migrate photo comments when photo ID changes
export async function migratePhotoCommentsInFirestore(oldId: string, newId: string) {
  try {
    const oldCommentDoc = doc(db, "photoComments", oldId);
    const newCommentDoc = doc(db, "photoComments", newId);
    
    const snapshot = await getDocs(collection(db, "photoComments"));
    const oldCommentsData = snapshot.docs.find(d => d.id === oldId)?.data();
    
    if (oldCommentsData) {
      await setDoc(newCommentDoc, oldCommentsData);
      await deleteDoc(oldCommentDoc);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `photoComments/${newId}`);
  }
}

