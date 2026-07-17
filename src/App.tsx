import React, { useState, useEffect } from "react";
import { Video, VideoComment, Photo, PhotoComment } from "./types";
import { INITIAL_VIDEOS, MOCK_COMMENTS, INITIAL_PHOTOS } from "./data";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import VideoWatchPage from "./components/VideoWatchPage";
import PhotosPage from "./components/PhotosPage";
import PhotoWatchPage from "./components/PhotoWatchPage";
import AdminSeedingPanel from "./components/AdminSeedingPanel";
import LegalPage from "./components/LegalPage";
import ContactPage from "./components/ContactPage";
import MegaFooter from "./components/MegaFooter";
import AdminLogin from "./components/AdminLogin";
import VideosPage from "./components/VideosPage";
import { safeStorage } from "./utils/safeStorage";
import { generateCommentsForVideo, generateCommentsForPhoto } from "./utils/commentGenerator";
import { 
  seedInitialDataIfNeeded, 
  subscribeToVideos, 
  subscribeToComments, 
  saveVideoToFirestore, 
  deleteVideoFromFirestore, 
  saveCommentsToFirestore,
  migrateCommentsInFirestore,
  subscribeToPhotos,
  subscribeToPhotoComments,
  savePhotoToFirestore,
  deletePhotoFromFirestore,
  savePhotoCommentsToFirestore,
  migratePhotoCommentsInFirestore,
  getVideoFromFirestore,
  getPhotoFromFirestore,
  addFirestoreStatusListener
} from "./dbService";

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  const [comments, setComments] = useState<Record<string, VideoComment[]>>({});
  const [photoComments, setPhotoComments] = useState<Record<string, PhotoComment[]>>({});

  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const localMode = false;
  const quotaExceeded = false;

  // Listen for Firestore errors
  useEffect(() => {
    const removeListener = addFirestoreStatusListener(({ error }) => {
      if (error) {
        setFirestoreError(error);
      }
    });
    return () => removeListener();
  }, []);

  // Populate fallback data if we are in Local mode
  useEffect(() => {
    if (localMode) {
      if (videos.length === 0) {
        setVideos(INITIAL_VIDEOS);
        setSelectedVideoId((prev) => prev || INITIAL_VIDEOS[0]?.id || "videocites-sintel-cinematic");
      }
      if (photos.length === 0) {
        setPhotos(INITIAL_PHOTOS);
        setSelectedPhotoId((prev) => prev || INITIAL_PHOTOS[0]?.id || "videocites-photo-deep-space");
      }
    }
  }, [localMode, videos.length, photos.length]);

  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (window.location.pathname.startsWith("/watch") || params.has("v")) {
        // Distinguish photo-watch from video watch based on pathname
        if (window.location.pathname.startsWith("/photo")) {
          return "photo-watch";
        }
        return "watch";
      }
      if (window.location.pathname === "/login" || params.get("page") === "login") return "login";
      return params.get("page") || "home";
    }
    return "home";
  });

  const [selectedVideoId, setSelectedVideoId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (!window.location.pathname.startsWith("/photo")) {
        return params.get("v") || "videocites-sintel-cinematic";
      }
    }
    return "videocites-sintel-cinematic";
  });

  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (window.location.pathname.startsWith("/photo")) {
        return params.get("v") || "videocites-photo-deep-space";
      }
    }
    return "videocites-photo-deep-space";
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return safeStorage.getItem("videocites-is-admin") === "true";
  });
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (safeStorage.getItem("videocites-theme") as "dark" | "light") || "dark";
  });

  // Toggle theme class on document element
  useEffect(() => {
    safeStorage.setItem("videocites-theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Handle popstate for browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const mediaId = params.get("v");
      const page = params.get("page");
      
      if (window.location.pathname === "/login") {
        setCurrentView("login");
      } else if (window.location.pathname.startsWith("/photo")) {
        setCurrentView("photo-watch");
        if (mediaId) {
          setSelectedPhotoId(mediaId);
        }
      } else if (window.location.pathname.startsWith("/watch") || mediaId) {
        setCurrentView("watch");
        if (mediaId) {
          setSelectedVideoId(mediaId);
        }
      } else if (page) {
        setCurrentView(page);
      } else {
        setCurrentView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Professional routing handler that updates history state
  const navigateTo = (view: string, id?: string) => {
    setCurrentView(view);
    if (view === "watch" && id) {
      setSelectedVideoId(id);
    } else if (view === "photo-watch" && id) {
      setSelectedPhotoId(id);
    }
    
    if (typeof window !== "undefined") {
      let newUrl = "/";
      const params = new URLSearchParams();
      
      if (view === "watch") {
        const vid = id || selectedVideoId || "videocites-sintel-cinematic";
        params.set("v", vid);
        newUrl = `/watch?${params.toString()}`;
      } else if (view === "photo-watch") {
        const pid = id || selectedPhotoId || "videocites-photo-deep-space";
        params.set("v", pid);
        newUrl = `/photo?${params.toString()}`;
      } else if (view === "login") {
        newUrl = "/login";
      } else if (view !== "home") {
        params.set("page", view);
        newUrl = `/?${params.toString()}`;
      } else {
        newUrl = "/";
      }
      
      window.history.pushState(null, "", newUrl);
    }
  };

  // Initialize application states with real-time Firestore synchronization
  useEffect(() => {
    // Seed initial values in Firestore if database is empty
    seedInitialDataIfNeeded().catch((err) => {
      console.warn("Seeding failed or database unreachable:", err);
    });

    // Subscribe to all videos dynamically in real-time
    const unsubscribeVideos = subscribeToVideos((fetchedVideos) => {
      setVideos(fetchedVideos);

      // Set default selected video if not specified in URL or not loaded yet
      const params = new URLSearchParams(window.location.search);
      const urlVideoId = params.get("v");
      if (urlVideoId && !window.location.pathname.startsWith("/photo")) {
        setSelectedVideoId(urlVideoId);
      } else if (fetchedVideos.length > 0) {
        setSelectedVideoId((prev) => prev || fetchedVideos[0].id);
      }
    });

    // Subscribe to all photos dynamically in real-time
    const unsubscribePhotos = subscribeToPhotos((fetchedPhotos) => {
      setPhotos(fetchedPhotos);

      const params = new URLSearchParams(window.location.search);
      const urlPhotoId = params.get("v");
      if (urlPhotoId && window.location.pathname.startsWith("/photo")) {
        setSelectedPhotoId(urlPhotoId);
      } else if (fetchedPhotos.length > 0) {
        setSelectedPhotoId((prev) => prev || fetchedPhotos[0].id);
      }
    });

    return () => {
      unsubscribeVideos();
      unsubscribePhotos();
    };
  }, []);

  // Listen to comments for the currently active selected video in real-time
  useEffect(() => {
    if (!selectedVideoId) return;

    if (localMode) {
      if (!comments[selectedVideoId]) {
        const targetVideo = videos.find((v) => v.id === selectedVideoId);
        const commentsList = targetVideo 
          ? (MOCK_COMMENTS[selectedVideoId] || generateCommentsForVideo(targetVideo, 24))
          : [];
        setComments((prev) => ({
          ...prev,
          [selectedVideoId]: commentsList,
        }));
      }
      return;
    }

    const unsubscribe = subscribeToComments(selectedVideoId, (fetchedComments) => {
      setComments((prev) => ({
        ...prev,
        [selectedVideoId]: fetchedComments,
      }));
    });

    return () => unsubscribe();
  }, [selectedVideoId, localMode, videos]);

  // Listen to comments for the currently active selected photo in real-time
  useEffect(() => {
    if (!selectedPhotoId) return;

    if (localMode) {
      if (!photoComments[selectedPhotoId]) {
        const targetPhoto = photos.find((p) => p.id === selectedPhotoId);
        const commentsList = targetPhoto 
          ? generateCommentsForPhoto(targetPhoto, 24)
          : [];
        setPhotoComments((prev) => ({
          ...prev,
          [selectedPhotoId]: commentsList,
        }));
      }
      return;
    }

    const unsubscribe = subscribeToPhotoComments(selectedPhotoId, (fetchedComments) => {
      setPhotoComments((prev) => ({
        ...prev,
        [selectedPhotoId]: fetchedComments,
      }));
    });

    return () => unsubscribe();
  }, [selectedPhotoId, localMode, photos]);

  // Protect admin panel by redirecting non-admins to the login page
  useEffect(() => {
    if (currentView === "admin" && !isAdmin) {
      navigateTo("login");
    }
  }, [currentView, isAdmin]);

  const handleLogout = () => {
    setIsAdmin(false);
    safeStorage.removeItem("videocites-is-admin");
    navigateTo("home");
  };

  // ----------------------------------------------------
  // VIDEO DATABASE ACTIONS
  // ----------------------------------------------------
  const handleUpdateVideo = async (updatedVideo: Video, oldId?: string) => {
    if (localMode) {
      setVideos((prev) => {
        const next = prev.map((v) => (v.id === (oldId || updatedVideo.id) ? updatedVideo : v));
        if (oldId && oldId !== updatedVideo.id) {
          setComments((cPrev) => {
            const copy = { ...cPrev };
            if (copy[oldId]) {
              copy[updatedVideo.id] = copy[oldId];
              delete copy[oldId];
            }
            return copy;
          });
        }
        return next;
      });
      return;
    }

    try {
      let finalVideo = { ...updatedVideo };
      
      if (oldId) {
        // Fetch latest stats from Firestore so they are preserved
        const idToFetch = oldId !== updatedVideo.id ? oldId : updatedVideo.id;
        const latestDoc = await getVideoFromFirestore(idToFetch);
        if (latestDoc) {
          finalVideo.realViews = latestDoc.realViews ?? 0;
          finalVideo.realLikes = latestDoc.realLikes ?? 0;
          finalVideo.realDislikes = latestDoc.realDislikes ?? 0;
        }
      }

      if (oldId && oldId !== updatedVideo.id) {
        // Migrate comments first so they are not deleted by deleteVideoFromFirestore
        await migrateCommentsInFirestore(oldId, updatedVideo.id);
        await deleteVideoFromFirestore(oldId);
        await saveVideoToFirestore(finalVideo);

        if (selectedVideoId === oldId) {
          setSelectedVideoId(updatedVideo.id);
          if (currentView === "watch") {
            navigateTo("watch", updatedVideo.id);
          }
        }
      } else {
        await saveVideoToFirestore(finalVideo);
      }
    } catch (e) {
      console.error("Failed to update video in Firestore:", e);
    }
  };

  const handleAddVideo = async (newVideo: Video) => {
    if (localMode) {
      setVideos((prev) => [newVideo, ...prev]);
      const randomCount = Math.floor(Math.random() * 11) + 20; // 20-30 comments
      const generatedComments = generateCommentsForVideo(newVideo, randomCount);
      setComments((prev) => ({
        ...prev,
        [newVideo.id]: generatedComments,
      }));
      return;
    }

    try {
      await saveVideoToFirestore(newVideo);
      const randomCount = Math.floor(Math.random() * 11) + 20; // 20-30 comments
      const generatedComments = generateCommentsForVideo(newVideo, randomCount);
      await saveCommentsToFirestore(newVideo.id, generatedComments);
    } catch (e) {
      console.error("Failed to add video to Firestore:", e);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (localMode) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setComments((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    try {
      await deleteVideoFromFirestore(id);
    } catch (e) {
      console.error("Failed to delete video from Firestore:", e);
    }
  };

  // ----------------------------------------------------
  // PHOTO DATABASE ACTIONS
  // ----------------------------------------------------
  const handleUpdatePhoto = async (updatedPhoto: Photo, oldId?: string) => {
    if (localMode) {
      setPhotos((prev) => {
        const next = prev.map((p) => (p.id === (oldId || updatedPhoto.id) ? updatedPhoto : p));
        if (oldId && oldId !== updatedPhoto.id) {
          setPhotoComments((cPrev) => {
            const copy = { ...cPrev };
            if (copy[oldId]) {
              copy[updatedPhoto.id] = copy[oldId];
              delete copy[oldId];
            }
            return copy;
          });
        }
        return next;
      });
      return;
    }

    try {
      let finalPhoto = { ...updatedPhoto };
      
      if (oldId) {
        // Fetch latest stats from Firestore so they are preserved
        const idToFetch = oldId !== updatedPhoto.id ? oldId : updatedPhoto.id;
        const latestDoc = await getPhotoFromFirestore(idToFetch);
        if (latestDoc) {
          finalPhoto.realViews = latestDoc.realViews ?? 0;
          finalPhoto.realLikes = latestDoc.realLikes ?? 0;
          finalPhoto.realDislikes = latestDoc.realDislikes ?? 0;
        }
      }

      if (oldId && oldId !== updatedPhoto.id) {
        // Migrate photo comments first so they are not deleted by deletePhotoFromFirestore
        await migratePhotoCommentsInFirestore(oldId, updatedPhoto.id);
        await deletePhotoFromFirestore(oldId);
        await savePhotoToFirestore(finalPhoto);

        if (selectedPhotoId === oldId) {
          setSelectedPhotoId(updatedPhoto.id);
          if (currentView === "photo-watch") {
            navigateTo("photo-watch", updatedPhoto.id);
          }
        }
      } else {
        await savePhotoToFirestore(finalPhoto);
      }
    } catch (e) {
      console.error("Failed to update photo in Firestore:", e);
    }
  };

  const handleAddPhoto = async (newPhoto: Photo) => {
    if (localMode) {
      setPhotos((prev) => [newPhoto, ...prev]);
      const randomCount = Math.floor(Math.random() * 11) + 20; // 20-30 comments
      const generatedComments = generateCommentsForPhoto(newPhoto, randomCount);
      setPhotoComments((prev) => ({
        ...prev,
        [newPhoto.id]: generatedComments,
      }));
      return;
    }

    try {
      await savePhotoToFirestore(newPhoto);
      const randomCount = Math.floor(Math.random() * 11) + 20; // 20-30 comments
      const generatedComments = generateCommentsForPhoto(newPhoto, randomCount);
      await savePhotoCommentsToFirestore(newPhoto.id, generatedComments);
    } catch (e) {
      console.error("Failed to add photo to Firestore:", e);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (localMode) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setPhotoComments((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    try {
      await deletePhotoFromFirestore(id);
    } catch (e) {
      console.error("Failed to delete photo from Firestore:", e);
    }
  };

  // Reset entire database helper
  const handleResetDatabase = async () => {
    if (localMode) {
      setVideos(INITIAL_VIDEOS);
      setSelectedVideoId(INITIAL_VIDEOS[0]?.id || "");
      setPhotos(INITIAL_PHOTOS);
      setSelectedPhotoId(INITIAL_PHOTOS[0]?.id || "");
      setComments({});
      setPhotoComments({});
      navigateTo("admin");
      return;
    }

    try {
      // Re-seed videos
      for (const video of INITIAL_VIDEOS) {
        await saveVideoToFirestore(video);
        const randomCount = Math.floor(Math.random() * 11) + 20;
        const generatedComments = generateCommentsForVideo(video, randomCount);
        await saveCommentsToFirestore(video.id, generatedComments);
      }
      const defaultId = INITIAL_VIDEOS[0]?.id || "";
      setSelectedVideoId(defaultId);

      // Re-seed photos
      for (const photo of INITIAL_PHOTOS) {
        await savePhotoToFirestore(photo);
        const randomCount = Math.floor(Math.random() * 11) + 20;
        const generatedComments = generateCommentsForPhoto(photo, randomCount);
        await savePhotoCommentsToFirestore(photo.id, generatedComments);
      }
      const defaultPhotoId = INITIAL_PHOTOS[0]?.id || "";
      setSelectedPhotoId(defaultPhotoId);

      navigateTo("admin");
    } catch (e) {
      console.error("Failed to reset Firestore database:", e);
    }
  };

  // ----------------------------------------------------
  // VIDEO COMMENTS & RATINGS ACTIONS
  // ----------------------------------------------------
  const handleAddComment = async (videoId: string, newComment: VideoComment) => {
    if (localMode) {
      setComments((prev) => {
        const currentComments = prev[videoId] || [];
        return {
          ...prev,
          [videoId]: [newComment, ...currentComments],
        };
      });
      return;
    }

    try {
      const currentComments = comments[videoId] || [];
      const updatedComments = [newComment, ...currentComments];
      await saveCommentsToFirestore(videoId, updatedComments);
    } catch (e) {
      console.error("Failed to post comment to Firestore:", e);
    }
  };

  const handleUpdateComments = async (videoId: string, updatedComments: VideoComment[]) => {
    if (localMode) {
      setComments((prev) => ({
        ...prev,
        [videoId]: updatedComments,
      }));
      return;
    }

    try {
      setComments((prev) => ({
        ...prev,
        [videoId]: updatedComments,
      }));
      await saveCommentsToFirestore(videoId, updatedComments);
    } catch (e) {
      console.error("Failed to update comments in Firestore:", e);
    }
  };

  const handleSelectVideo = (id: string) => {
    navigateTo("watch", id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Increment real views
    const target = videos.find((v) => v.id === id);
    if (target) {
      const updated: Video = {
        ...target,
        realViews: target.realViews + 1,
      };
      handleUpdateVideo(updated);
    }
  };

  const handleLikeVideo = (id: string) => {
    const target = videos.find((v) => v.id === id);
    if (target) {
      const updated: Video = {
        ...target,
        realLikes: target.realLikes + 1,
      };
      handleUpdateVideo(updated);
    }
  };

  const handleDislikeVideo = (id: string) => {
    const target = videos.find((v) => v.id === id);
    if (target) {
      const updated: Video = {
        ...target,
        realDislikes: target.realDislikes + 1,
      };
      handleUpdateVideo(updated);
    }
  };

  // ----------------------------------------------------
  // PHOTO COMMENTS & RATINGS ACTIONS
  // ----------------------------------------------------
  const handleAddPhotoComment = async (photoId: string, newComment: PhotoComment) => {
    if (localMode) {
      setPhotoComments((prev) => {
        const currentComments = prev[photoId] || [];
        return {
          ...prev,
          [photoId]: [newComment, ...currentComments],
        };
      });
      return;
    }

    try {
      const currentComments = photoComments[photoId] || [];
      const updatedComments = [newComment, ...currentComments];
      await savePhotoCommentsToFirestore(photoId, updatedComments);
    } catch (e) {
      console.error("Failed to post photo comment to Firestore:", e);
    }
  };

  const handleUpdatePhotoComments = async (photoId: string, updatedComments: PhotoComment[]) => {
    if (localMode) {
      setPhotoComments((prev) => ({
        ...prev,
        [photoId]: updatedComments,
      }));
      return;
    }

    try {
      setPhotoComments((prev) => ({
        ...prev,
        [photoId]: updatedComments,
      }));
      await savePhotoCommentsToFirestore(photoId, updatedComments);
    } catch (e) {
      console.error("Failed to update photo comments in Firestore:", e);
    }
  };

  const handleSelectPhoto = (id: string) => {
    navigateTo("photo-watch", id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Increment real views
    const target = photos.find((p) => p.id === id);
    if (target) {
      const updated: Photo = {
        ...target,
        realViews: target.realViews + 1,
      };
      handleUpdatePhoto(updated);
    }
  };

  const handleLikePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) {
      const updated: Photo = {
        ...target,
        realLikes: target.realLikes + 1,
      };
      handleUpdatePhoto(updated);
    }
  };

  const handleDislikePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) {
      const updated: Photo = {
        ...target,
        realDislikes: target.realDislikes + 1,
      };
      handleUpdatePhoto(updated);
    }
  };

  // Currently active video & photo objects
  const activeVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];
  const activePhoto = photos.find((p) => p.id === selectedPhotoId) || photos[0];

  // Dynamically update document titles (Request 3)
  useEffect(() => {
    let title = "Videocites - Premium Media Streaming";
    switch (currentView) {
      case "home":
        title = "Videocites - Premium Content Registry";
        break;
      case "videos":
        title = "All Secure Videos | Videocites";
        break;
      case "photos":
        title = "Art Photography Gallery | Videocites";
        break;
      case "watch":
        if (activeVideo) {
          title = `${activeVideo.title} | Watch Video on Videocites`;
        } else {
          title = "Watch Secure Stream | Videocites";
        }
        break;
      case "photo-watch":
        if (activePhoto) {
          title = `${activePhoto.title} | View Artwork on Videocites`;
        } else {
          title = "View Secure Artwork | Videocites";
        }
        break;
      case "login":
        title = "Secure Portal Access | Videocites";
        break;
      case "admin":
        title = "Admin Seeding Panel & Database Control | Videocites";
        break;
      case "legal":
        title = "DMCA, Copyright Clearance & Legal Policy | Videocites";
        break;
      case "contact":
        title = "Contact Support & Rights Management | Videocites";
        break;
      default:
        title = "Videocites";
    }
    document.title = title;
  }, [currentView, activeVideo, activePhoto]);

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 ${
      theme === "light" ? "bg-slate-50 text-slate-800" : "bg-[#050505] text-[#E5E5E5]"
    }`}>
      
      {/* 1. Header Navigation Bar */}
      <Navbar 
        currentView={currentView} 
        onNavigate={(view) => navigateTo(view)} 
        isAdmin={isAdmin}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Page Renderings */}
      <main className="flex-grow">
        {currentView === "home" && videos.length > 0 && (
          <HomePage 
            videos={videos} 
            onSelectVideo={handleSelectVideo} 
            isAdmin={isAdmin}
            onNavigate={navigateTo}
          />
        )}

        {currentView === "videos" && videos.length > 0 && (
          <VideosPage
            videos={videos}
            onSelectVideo={handleSelectVideo}
            isAdmin={isAdmin}
          />
        )}

        {currentView === "photos" && photos.length > 0 && (
          <PhotosPage
            photos={photos}
            onSelectPhoto={handleSelectPhoto}
            isAdmin={isAdmin}
          />
        )}

        {currentView === "watch" && activeVideo && (
          <VideoWatchPage
            video={activeVideo}
            suggestedVideos={videos.filter((v) => v.id !== activeVideo.id)}
            comments={comments[activeVideo.id] || []}
            onSelectVideo={handleSelectVideo}
            onLikeVideo={handleLikeVideo}
            onDislikeVideo={handleDislikeVideo}
            onAddComment={handleAddComment}
            onUpdateComments={handleUpdateComments}
          />
        )}

        {currentView === "photo-watch" && activePhoto && (
          <PhotoWatchPage
            photo={activePhoto}
            suggestedPhotos={photos.filter((p) => p.id !== activePhoto.id)}
            comments={photoComments[activePhoto.id] || []}
            onSelectPhoto={handleSelectPhoto}
            onLikePhoto={handleLikePhoto}
            onDislikePhoto={handleDislikePhoto}
            onAddComment={handleAddPhotoComment}
            onUpdateComments={handleUpdatePhotoComments}
          />
        )}

        {currentView === "login" && (
          <AdminLogin onLoginSuccess={() => {
            setIsAdmin(true);
            safeStorage.setItem("videocites-is-admin", "true");
            navigateTo("home"); // Redirect back to homepage with admin account!
          }} />
        )}

        {currentView === "admin" && isAdmin && (
          <AdminSeedingPanel
            videos={videos}
            onUpdateVideo={handleUpdateVideo}
            onAddVideo={handleAddVideo}
            onDeleteVideo={handleDeleteVideo}
            photos={photos}
            onUpdatePhoto={handleUpdatePhoto}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            onResetDatabase={handleResetDatabase}
          />
        )}

        {currentView === "legal" && <LegalPage />}

        {currentView === "contact" && <ContactPage />}
      </main>

      {/* 3. Mega Footer with theme control */}
      <MegaFooter 
        onNavigate={(view) => navigateTo(view)} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

    </div>
  );
}
