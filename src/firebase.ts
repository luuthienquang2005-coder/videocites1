import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { Video, VideoComment } from "./types";
import { INITIAL_VIDEOS, MOCK_COMMENTS } from "./data";
import { generateCommentsForVideo } from "./utils/commentGenerator";

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  throw new Error(JSON.stringify(errInfo));
}

// Seeding function: Seeds initial videos and comments if they don't exist yet in Firestore
export async function seedInitialDataIfNeeded() {
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
        if (existingComments.length < 20) {
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
