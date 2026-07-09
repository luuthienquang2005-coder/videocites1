import React, { useState, useEffect } from "react";
import { Video, VideoComment } from "./types";
import { INITIAL_VIDEOS, MOCK_COMMENTS } from "./data";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import VideoWatchPage from "./components/VideoWatchPage";
import AdminSeedingPanel from "./components/AdminSeedingPanel";
import LegalPage from "./components/LegalPage";
import ContactPage from "./components/ContactPage";
import MegaFooter from "./components/MegaFooter";
import AdminLogin from "./components/AdminLogin";
import VideosPage from "./components/VideosPage";
import { safeStorage } from "./utils/safeStorage";
import { generateCommentsForVideo } from "./utils/commentGenerator";
import { 
  seedInitialDataIfNeeded, 
  subscribeToVideos, 
  subscribeToComments, 
  saveVideoToFirestore, 
  deleteVideoFromFirestore, 
  saveCommentsToFirestore,
  migrateCommentsInFirestore
} from "./firebase";

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Record<string, VideoComment[]>>({});
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (window.location.pathname.startsWith("/watch") || params.has("v")) return "watch";
      if (window.location.pathname === "/login" || params.get("page") === "login") return "login";
      return params.get("page") || "home";
    }
    return "home";
  });
  const [selectedVideoId, setSelectedVideoId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("v") || "videocites-sintel-cinematic";
    }
    return "videocites-sintel-cinematic";
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
      const videoId = params.get("v");
      const page = params.get("page");
      
      if (window.location.pathname === "/login") {
        setCurrentView("login");
      } else if (window.location.pathname.startsWith("/watch") || videoId) {
        setCurrentView("watch");
        if (videoId) {
          setSelectedVideoId(videoId);
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
  const navigateTo = (view: string, videoId?: string) => {
    setCurrentView(view);
    if (videoId) {
      setSelectedVideoId(videoId);
    }
    
    if (typeof window !== "undefined") {
      let newUrl = "/";
      const params = new URLSearchParams();
      
      if (view === "watch") {
        const vid = videoId || selectedVideoId || "videocites-sintel-cinematic";
        params.set("v", vid);
        newUrl = `/watch?${params.toString()}`;
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
    const unsubscribe = subscribeToVideos((fetchedVideos) => {
      setVideos(fetchedVideos);

      // Set default selected video if not specified in URL or not loaded yet
      const params = new URLSearchParams(window.location.search);
      const urlVideoId = params.get("v");
      if (urlVideoId) {
        setSelectedVideoId(urlVideoId);
      } else if (fetchedVideos.length > 0) {
        // Only set default if selectedVideoId is currently empty
        setSelectedVideoId((prev) => prev || fetchedVideos[0].id);
      }
    });

    return () => unsubscribe();
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

  // Update a single video's stats/seedings inside Firestore database
  const handleUpdateVideo = async (updatedVideo: Video, oldId?: string) => {
    try {
      if (oldId && oldId !== updatedVideo.id) {
        // Delete old video, save updated video
        await deleteVideoFromFirestore(oldId);
        await saveVideoToFirestore(updatedVideo);
        // Migrate comments to new video ID in Firestore
        await migrateCommentsInFirestore(oldId, updatedVideo.id);

        if (selectedVideoId === oldId) {
          setSelectedVideoId(updatedVideo.id);
          if (currentView === "watch") {
            navigateTo("watch", updatedVideo.id);
          }
        }
      } else {
        await saveVideoToFirestore(updatedVideo);
      }
    } catch (e) {
      console.error("Failed to update video in Firestore:", e);
    }
  };

  // Add a newly uploaded video into systemic library
  const handleAddVideo = async (newVideo: Video) => {
    try {
      await saveVideoToFirestore(newVideo);
      // Auto-generate 20-30 comments based on the video caption/description
      const randomCount = Math.floor(Math.random() * 11) + 20; // 20-30 comments
      const generatedComments = generateCommentsForVideo(newVideo, randomCount);
      await saveCommentsToFirestore(newVideo.id, generatedComments);
    } catch (e) {
      console.error("Failed to add video to Firestore:", e);
    }
  };

  // Delete a video from Firestore
  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteVideoFromFirestore(id);
    } catch (e) {
      console.error("Failed to delete video from Firestore:", e);
    }
  };

  // Reset entire database to default seeding values in Firestore
  const handleResetDatabase = async () => {
    try {
      // Re-seed initial data
      for (const video of INITIAL_VIDEOS) {
        await saveVideoToFirestore(video);
        // Generates 20-30 high-quality comments per video
        const randomCount = Math.floor(Math.random() * 11) + 20;
        const generatedComments = generateCommentsForVideo(video, randomCount);
        await saveCommentsToFirestore(video.id, generatedComments);
      }
      const defaultId = INITIAL_VIDEOS[0]?.id || "";
      setSelectedVideoId(defaultId);
      navigateTo("admin");
    } catch (e) {
      console.error("Failed to reset Firestore database:", e);
    }
  };

  // Add comment dynamically to Firestore database
  const handleAddComment = async (videoId: string, newComment: VideoComment) => {
    try {
      const currentComments = comments[videoId] || [];
      const updatedComments = [newComment, ...currentComments];
      await saveCommentsToFirestore(videoId, updatedComments);
    } catch (e) {
      console.error("Failed to post comment to Firestore:", e);
    }
  };

  // Update comments (likes, replies, etc.) in Firestore database
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

  // Increment real views when selecting video
  const handleSelectVideo = (id: string) => {
    navigateTo("watch", id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Simulate real watch incrementing real views
    const target = videos.find((v) => v.id === id);
    if (target) {
      const updated: Video = {
        ...target,
        realViews: target.realViews + 1,
      };
      handleUpdateVideo(updated);
    }
  };

  // Handle Likes increments dynamically from watch page
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

  // Handle Dislikes increments
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

  // Select current active video object
  const activeVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];

  // Dynamically update document title based on the active view and video
  useEffect(() => {
    let title = "Videocites - Premium Video Streaming";
    switch (currentView) {
      case "home":
        title = "Videocites - Premium Video Streaming Platform";
        break;
      case "videos":
        title = "All Secure Videos | Videocites";
        break;
      case "watch":
        if (activeVideo) {
          title = `${activeVideo.title} | Watch on Videocites`;
        } else {
          title = "Watch Premium Video | Videocites";
        }
        break;
      case "login":
        title = "Admin Secure Login | Videocites";
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
  }, [currentView, activeVideo]);

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
