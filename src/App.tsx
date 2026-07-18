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
import { AlertTriangle, Database, ExternalLink } from "lucide-react";
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
} from "./firebase";

export default function App() {
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  
  const [comments, setComments] = useState<Record<string, VideoComment[]>>(MOCK_COMMENTS);
  const [photoComments, setPhotoComments] = useState<Record<string, PhotoComment[]>>({});
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

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

  // Register Firestore Status Listener to track Quota limit exceeded error
  useEffect(() => {
    const unsubscribeStatus = addFirestoreStatusListener(({ isQuota }) => {
      if (isQuota) {
        setQuotaExceeded(true);
      }
    });
    return () => unsubscribeStatus();
  }, []);

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
    seedInitialDataIfNeeded();

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

    const unsubscribe = subscribeToComments(selectedVideoId, (fetchedComments) => {
      setComments((prev) => ({
        ...prev,
        [selectedVideoId]: fetchedComments,
      }));
    });

    return () => unsubscribe();
  }, [selectedVideoId]);

  // Listen to comments for the currently active selected photo in real-time
  useEffect(() => {
    if (!selectedPhotoId) return;

    const unsubscribe = subscribeToPhotoComments(selectedPhotoId, (fetchedComments) => {
      setPhotoComments((prev) => ({
        ...prev,
        [selectedPhotoId]: fetchedComments,
      }));
    });

    return () => unsubscribe();
  }, [selectedPhotoId]);

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
    try {
      await deletePhotoFromFirestore(id);
    } catch (e) {
      console.error("Failed to delete photo from Firestore:", e);
    }
  };

  // Reset entire database helper
  const handleResetDatabase = async () => {
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
    try {
      const currentComments = comments[videoId] || [];
      const updatedComments = [newComment, ...currentComments];
      await saveCommentsToFirestore(videoId, updatedComments);
    } catch (e) {
      console.error("Failed to post comment to Firestore:", e);
    }
  };

  const handleUpdateComments = async (videoId: string, updatedComments: VideoComment[]) => {
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
    try {
      const currentComments = photoComments[photoId] || [];
      const updatedComments = [newComment, ...currentComments];
      await savePhotoCommentsToFirestore(photoId, updatedComments);
    } catch (e) {
      console.error("Failed to post photo comment to Firestore:", e);
    }
  };

  const handleUpdatePhotoComments = async (photoId: string, updatedComments: PhotoComment[]) => {
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

      {quotaExceeded && (
        <div id="quota-exceeded-banner" className={`border-y py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300 ${
          theme === "light" 
            ? "bg-amber-50 border-amber-200 text-amber-900" 
            : "bg-amber-950/40 border-amber-900/40 text-amber-200"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg mt-1 shrink-0 ${
              theme === "light" ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-400"
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`font-bold text-base flex flex-wrap items-center gap-2 ${
                theme === "light" ? "text-amber-950" : "text-amber-300"
              }`}>
                Firestore Free Tier Quota Limit Reached
              </h4>
              <p className={`text-xs max-w-3xl mt-1 leading-relaxed ${
                theme === "light" ? "text-amber-800" : "text-amber-400"
              }`}>
                The application has reached the free daily read/write units for the Firebase Firestore project database. Detailed quota limits can be found under the <strong>Spark</strong> plan column in the <strong>Enterprise edition</strong> section of the{" "}
                <a 
                  href="https://firebase.google.com/pricing#cloud-firestore" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80 transition-opacity font-medium inline-flex items-center gap-0.5"
                >
                  Firebase Pricing Page <ExternalLink className="w-3 h-3" />
                </a>. Please upgrade your Firestore plan or wait until the quota resets to restore functionality.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto self-stretch md:self-center justify-end">
            <a
              href="https://console.firebase.google.com/project/jaunty-dimension-qfs6l/firestore/databases/ai-studio-remixvnaoh-e1d592b3-22c2-40d6-bad9-5154f161bdc0/data?openUpgradeDialog=true"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 font-semibold rounded-lg text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shrink-0 ${
                theme === "light"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-black"
              }`}
            >
              <Database className="w-4 h-4" />
              Manage / Upgrade Database
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

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
