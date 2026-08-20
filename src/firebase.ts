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
  };
}

export function logFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errMsg = error instanceof Error ? error.message : String(error);

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
  return errInfo;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = logFirestoreError(error, operationType, path);
  throw new Error(JSON.stringify(errInfo));
}

// Seeding function: Seeds initial videos and comments if they don't exist yet in Firestore
export async function seedInitialDataIfNeeded() {
  try {
    if (typeof window !== "undefined" && window.localStorage && window.localStorage.getItem("videocites-seeded-checked") === "true") {
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

      // Check comments count for ALL videos currently stored in the system
      const commentsCol = collection(db, "comments");
      const commentsSnapshot = await getDocs(commentsCol);
      const commentsMap = new Map<string, VideoComment[]>();
      commentsSnapshot.forEach((doc) => {
        commentsMap.set(doc.id, doc.data().comments || []);
      });

      const latestVideosSnapshot = await getDocs(videosCol);
      const allVideos: Video[] = [];
      latestVideosSnapshot.forEach((doc) => {
        allVideos.push(doc.data() as Video);
      });

      let autoPopulatedCommentsCount = 0;
      for (const video of allVideos) {
        const existingComments = commentsMap.get(video.id) || [];
        if (existingComments.length === 0) {
          const randomCount = Math.floor(Math.random() * 11) + 20;
          const generated = generateCommentsForVideo(video, randomCount);
          await setDoc(doc(db, "comments", video.id), { comments: generated });
          autoPopulatedCommentsCount++;
        }
      }

      if (addedCount > 0 || updatedCount > 0 || autoPopulatedCommentsCount > 0) {
        console.log(`Incremental seeding completed. Added ${addedCount} default videos, updated ${updatedCount} dates, and backfilled ${autoPopulatedCommentsCount} videos with comments.`);
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
    // Gracefully catch any quota or connection errors without crashing the app startup
    logFirestoreError(error, OperationType.WRITE, path);
  }
}

function clearLocalCache(type: "videos" | "photos" | "comments" | "photocomments", id?: string) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (type === "videos") {
      window.localStorage.removeItem("videocites-cache-videos");
      window.localStorage.removeItem("videocites-cache-videos-time");
    } else if (type === "photos") {
      window.localStorage.removeItem("videocites-cache-photos");
      window.localStorage.removeItem("videocites-cache-photos-time");
    } else if (type === "comments" && id) {
      window.localStorage.removeItem(`videocites-cache-comments-${id}`);
      window.localStorage.removeItem(`videocites-cache-comments-${id}-time`);
    } else if (type === "photocomments" && id) {
      window.localStorage.removeItem(`videocites-cache-photocomments-${id}`);
      window.localStorage.removeItem(`videocites-cache-photocomments-${id}-time`);
    }
  } catch (e) {
    console.warn("Error clearing cache:", e);
  }
}

// Subscribe to all videos in real-time
export function subscribeToVideos(onUpdate: (videos: Video[]) => void) {
  const CACHE_KEY = "videocites-cache-videos";
  const CACHE_TIME_KEY = "videocites-cache-videos-time";
  const TTL = 300000; // 5 minutes

  // Immediately notify listener if valid cache exists
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      const cachedTime = window.localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < TTL) {
          const list = JSON.parse(cached) as Video[];
          if (list && list.length > 0) {
            onUpdate(list);
          }
        }
      }
    } catch (e) {
      console.warn("Error reading videos cache:", e);
    }
  }

  const videosCol = collection(db, "videos");
  return onSnapshot(videosCol, (snapshot) => {
    const list: Video[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Video);
    });
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    const finalList = list.length > 0 ? list : INITIAL_VIDEOS;

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(finalList));
        window.localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch (e) {
        console.warn("Error saving videos cache:", e);
      }
    }
    
    onUpdate(finalList);
  }, (error) => {
    logFirestoreError(error, OperationType.GET, "videos");
    // Gracefully provide cached videos or initial fallback on quota limit / network error
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cached = window.localStorage.getItem(CACHE_KEY);
        if (cached) {
          const list = JSON.parse(cached) as Video[];
          if (list && list.length > 0) {
            onUpdate(list);
            return;
          }
        }
      } catch (e) {}
    }
    onUpdate(INITIAL_VIDEOS);
  });
}

// Subscribe to comments for a specific video in real-time
export function subscribeToComments(videoId: string, onUpdate: (comments: VideoComment[]) => void) {
  const commentPath = `comments/${videoId}`;
  const CACHE_KEY = `videocites-cache-comments-${videoId}`;
  const CACHE_TIME_KEY = `videocites-cache-comments-${videoId}-time`;
  const TTL = 300000; // 5 minutes

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      const cachedTime = window.localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < TTL) {
          const commentsList = JSON.parse(cached) as VideoComment[];
          onUpdate(commentsList);
        }
      }
    } catch (e) {
      console.warn("Error reading comments cache:", e);
    }
  }

  const commentDoc = doc(db, "comments", videoId);
  return onSnapshot(commentDoc, (snapshot) => {
    let commentsList: VideoComment[] = [];
    if (snapshot.exists()) {
      const data = snapshot.data();
      commentsList = data.comments || [];
    } else if (MOCK_COMMENTS[videoId]) {
      commentsList = MOCK_COMMENTS[videoId];
    }
    
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(commentsList));
        window.localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch (e) {
        console.warn("Error saving comments cache:", e);
      }
    }
    
    onUpdate(commentsList);
  }, (error) => {
    logFirestoreError(error, OperationType.GET, commentPath);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cached = window.localStorage.getItem(CACHE_KEY);
        if (cached) {
          const commentsList = JSON.parse(cached) as VideoComment[];
          onUpdate(commentsList);
          return;
        }
      } catch (e) {}
    }
    onUpdate(MOCK_COMMENTS[videoId] || []);
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
    logFirestoreError(error, OperationType.GET, `videos/${videoId}`);
    // Check local storage fallback
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cached = window.localStorage.getItem("videocites-cache-videos");
        if (cached) {
          const list = JSON.parse(cached) as Video[];
          const found = list.find(v => v.id === videoId);
          if (found) return found;
        }
      } catch (e) {}
    }
    return INITIAL_VIDEOS.find(v => v.id === videoId) || null;
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
    logFirestoreError(error, OperationType.GET, `photos/${photoId}`);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cached = window.localStorage.getItem("videocites-cache-photos");
        if (cached) {
          const list = JSON.parse(cached) as Photo[];
          const found = list.find(p => p.id === photoId);
          if (found) return found;
        }
      } catch (e) {}
    }
    return INITIAL_PHOTOS.find(p => p.id === photoId) || null;
  }
}

// Add or update a video in Firestore
export async function saveVideoToFirestore(video: Video) {
  const videoPath = `videos/${video.id}`;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem("videocites-cache-videos");
      let list = cached ? (JSON.parse(cached) as Video[]) : [...INITIAL_VIDEOS];
      const idx = list.findIndex(v => v.id === video.id);
      if (idx >= 0) {
        list[idx] = video;
      } else {
        list.unshift(video);
      }
      window.localStorage.setItem("videocites-cache-videos", JSON.stringify(list));
      window.localStorage.setItem("videocites-cache-videos-time", Date.now().toString());
    } catch (e) {}
  }

  try {
    await setDoc(doc(db, "videos", video.id), video);
    clearLocalCache("videos");
  } catch (error) {
    logFirestoreError(error, OperationType.WRITE, videoPath);
  }
}

// Delete a video and its comments from Firestore
export async function deleteVideoFromFirestore(videoId: string) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem("videocites-cache-videos");
      if (cached) {
        const list = (JSON.parse(cached) as Video[]).filter(v => v.id !== videoId);
        window.localStorage.setItem("videocites-cache-videos", JSON.stringify(list));
      }
    } catch (e) {}
  }

  try {
    await deleteDoc(doc(db, "videos", videoId));
    await deleteDoc(doc(db, "comments", videoId));
    clearLocalCache("videos");
    clearLocalCache("comments", videoId);
  } catch (error) {
    logFirestoreError(error, OperationType.DELETE, `videos/${videoId}`);
  }
}

// Save comments for a video
export async function saveCommentsToFirestore(videoId: string, comments: VideoComment[]) {
  const commentPath = `comments/${videoId}`;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(`videocites-cache-comments-${videoId}`, JSON.stringify(comments));
      window.localStorage.setItem(`videocites-cache-comments-${videoId}-time`, Date.now().toString());
    } catch (e) {}
  }

  try {
    await setDoc(doc(db, "comments", videoId), { comments });
    clearLocalCache("comments", videoId);
  } catch (error) {
    logFirestoreError(error, OperationType.WRITE, commentPath);
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
    clearLocalCache("comments", oldId);
    clearLocalCache("comments", newId);
  } catch (error) {
    logFirestoreError(error, OperationType.WRITE, `comments/${newId}`);
  }
}

// Subscribe to all photos in real-time
export function subscribeToPhotos(onUpdate: (photos: Photo[]) => void) {
  const CACHE_KEY = "videocites-cache-photos";
  const CACHE_TIME_KEY = "videocites-cache-photos-time";
  const TTL = 300000; // 5 minutes

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      const cachedTime = window.localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < TTL) {
          const list = JSON.parse(cached) as Photo[];
          if (list && list.length > 0) {
            onUpdate(list);
          }
        }
      }
    } catch (e) {
      console.warn("Error reading photos cache:", e);
    }
  }

  const photosCol = collection(db, "photos");
  return onSnapshot(photosCol, (snapshot) => {
    const list: Photo[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Photo);
    });
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    const finalList = list.length > 0 ? list : INITIAL_PHOTOS;

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(finalList));
        window.localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch (e) {
        console.warn("Error saving photos cache:", e);
      }
    }
    
    onUpdate(finalList);
  }, (error) => {
    logFirestoreError(error, OperationType.GET, "photos");
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cached = window.localStorage.getItem(CACHE_KEY);
        if (cached) {
          const list = JSON.parse(cached) as Photo[];
          if (list && list.length > 0) {
            onUpdate(list);
            return;
          }
        }
      } catch (e) {}
    }
    onUpdate(INITIAL_PHOTOS);
  });
}

// Subscribe to photo comments in real-time
export function subscribeToPhotoComments(photoId: string, onUpdate: (comments: PhotoComment[]) => void) {
  const commentPath = `photoComments/${photoId}`;
  const CACHE_KEY = `videocites-cache-photocomments-${photoId}`;
  const CACHE_TIME_KEY = `videocites-cache-photocomments-${photoId}-time`;
  const TTL = 300000; // 5 minutes

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      const cachedTime = window.localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < TTL) {
          const commentsList = JSON.parse(cached) as PhotoComment[];
          onUpdate(commentsList);
        }
      }
    } catch (e) {
      console.warn("Error reading photocomments cache:", e);
    }
  }

  const commentDoc = doc(db, "photoComments", photoId);
  return onSnapshot(commentDoc, (snapshot) => {
    let commentsList: PhotoComment[] = [];
    if (snapshot.exists()) {
      const data = snapshot.data();
      commentsList = data.comments || [];
    } else if (MOCK_COMMENTS[photoId]) {
      commentsList = MOCK_COMMENTS[photoId];
    }
    
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(commentsList));
        window.localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch (e) {
        console.warn("Error saving photocomments cache:", e);
      }
    }
    
    onUpdate(commentsList);
  }, (error) => {
    logFirestoreError(error, OperationType.GET, commentPath);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cached = window.localStorage.getItem(CACHE_KEY);
        if (cached) {
          const commentsList = JSON.parse(cached) as PhotoComment[];
          onUpdate(commentsList);
          return;
        }
      } catch (e) {}
    }
    onUpdate(MOCK_COMMENTS[photoId] || []);
  });
}

// Save a photo to Firestore
export async function savePhotoToFirestore(photo: Photo) {
  const photoPath = `photos/${photo.id}`;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem("videocites-cache-photos");
      let list = cached ? (JSON.parse(cached) as Photo[]) : [...INITIAL_PHOTOS];
      const idx = list.findIndex(p => p.id === photo.id);
      if (idx >= 0) {
        list[idx] = photo;
      } else {
        list.unshift(photo);
      }
      window.localStorage.setItem("videocites-cache-photos", JSON.stringify(list));
      window.localStorage.setItem("videocites-cache-photos-time", Date.now().toString());
    } catch (e) {}
  }

  try {
    await setDoc(doc(db, "photos", photo.id), photo);
    clearLocalCache("photos");
  } catch (error) {
    logFirestoreError(error, OperationType.WRITE, photoPath);
  }
}

// Delete a photo and its comments
export async function deletePhotoFromFirestore(photoId: string) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = window.localStorage.getItem("videocites-cache-photos");
      if (cached) {
        const list = (JSON.parse(cached) as Photo[]).filter(p => p.id !== photoId);
        window.localStorage.setItem("videocites-cache-photos", JSON.stringify(list));
      }
    } catch (e) {}
  }

  try {
    await deleteDoc(doc(db, "photos", photoId));
    await deleteDoc(doc(db, "photoComments", photoId));
    clearLocalCache("photos");
    clearLocalCache("photocomments", photoId);
  } catch (error) {
    logFirestoreError(error, OperationType.DELETE, `photos/${photoId}`);
  }
}

// Save photo comments
export async function savePhotoCommentsToFirestore(photoId: string, comments: PhotoComment[]) {
  const commentPath = `photoComments/${photoId}`;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(`videocites-cache-photocomments-${photoId}`, JSON.stringify(comments));
      window.localStorage.setItem(`videocites-cache-photocomments-${photoId}-time`, Date.now().toString());
    } catch (e) {}
  }

  try {
    await setDoc(doc(db, "photoComments", photoId), { comments });
    clearLocalCache("photocomments", photoId);
  } catch (error) {
    logFirestoreError(error, OperationType.WRITE, commentPath);
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
    clearLocalCache("photocomments", oldId);
    clearLocalCache("photocomments", newId);
  } catch (error) {
    logFirestoreError(error, OperationType.WRITE, `photoComments/${newId}`);
  }
}
