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

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Record<string, VideoComment[]>>({});
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("v")) return "watch";
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
      
      if (videoId) {
        setCurrentView("watch");
        setSelectedVideoId(videoId);
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
      const params = new URLSearchParams();
      if (view === "watch") {
        const vid = videoId || selectedVideoId || "videocites-sintel-cinematic";
        params.set("v", vid);
      } else if (view !== "home") {
        params.set("page", view);
      }
      const searchStr = params.toString();
      const newUrl = `${window.location.pathname}${searchStr ? "?" + searchStr : ""}`;
      
      if (window.location.search !== (searchStr ? "?" + searchStr : "")) {
        window.history.pushState(null, "", newUrl);
      }
    }
  };

  // Initialize application states with safeStorage persistence
  useEffect(() => {
    const storedVideos = safeStorage.getItem("videocites-videos-db");
    const storedComments = safeStorage.getItem("videocites-comments-db");
    const currentDbVersion = safeStorage.getItem("videocites-db-version");

    let loadedVideos = null;
    let loadedComments = null;

    try {
      if (storedVideos && currentDbVersion === "v3") {
        loadedVideos = JSON.parse(storedVideos);
      }
    } catch (e) {
      console.error("Error parsing stored videos:", e);
    }

    try {
      if (storedComments && currentDbVersion === "v3") {
        loadedComments = JSON.parse(storedComments);
      }
    } catch (e) {
      console.error("Error parsing stored comments:", e);
    }

    if (loadedVideos) {
      setVideos(loadedVideos);
    } else {
      setVideos(INITIAL_VIDEOS);
      safeStorage.setItem("videocites-videos-db", JSON.stringify(INITIAL_VIDEOS));
      safeStorage.setItem("videocites-db-version", "v3");
    }

    if (loadedComments) {
      setComments(loadedComments);
    } else {
      setComments(MOCK_COMMENTS);
      safeStorage.setItem("videocites-comments-db", JSON.stringify(MOCK_COMMENTS));
    }

    // Set default selected video if not specified in URL
    const params = new URLSearchParams(window.location.search);
    const urlVideoId = params.get("v");
    if (!urlVideoId) {
      const defaultId = INITIAL_VIDEOS[0]?.id || "";
      setSelectedVideoId(defaultId);
    }
  }, []);

  const handleLogout = () => {
    setIsAdmin(false);
    safeStorage.removeItem("videocites-is-admin");
    navigateTo("home");
  };

  // Update a single video's stats/seedings
  const handleUpdateVideo = (updatedVideo: Video, oldId?: string) => {
    const searchId = oldId || updatedVideo.id;
    const updatedList = videos.map((v) => (v.id === searchId ? updatedVideo : v));
    setVideos(updatedList);
    safeStorage.setItem("videocites-videos-db", JSON.stringify(updatedList));

    // If ID changed, migrate comments
    if (oldId && oldId !== updatedVideo.id) {
      const updatedComments = { ...comments };
      if (updatedComments[oldId]) {
        updatedComments[updatedVideo.id] = updatedComments[oldId];
        delete updatedComments[oldId];
        setComments(updatedComments);
        safeStorage.setItem("videocites-comments-db", JSON.stringify(updatedComments));
      }

      // If currently selected video ID is oldId, update it and pushState to match
      if (selectedVideoId === oldId) {
        setSelectedVideoId(updatedVideo.id);
        if (currentView === "watch") {
          navigateTo("watch", updatedVideo.id);
        }
      }
    }
  };

  // Add a newly uploaded video into systemic library
  const handleAddVideo = (newVideo: Video) => {
    const updatedList = [newVideo, ...videos];
    setVideos(updatedList);
    safeStorage.setItem("videocites-videos-db", JSON.stringify(updatedList));

    // Initialize comments empty array for new video
    const updatedComments = { ...comments, [newVideo.id]: [] };
    setComments(updatedComments);
    safeStorage.setItem("videocites-comments-db", JSON.stringify(updatedComments));
  };

  // Delete a video
  const handleDeleteVideo = (id: string) => {
    const updatedList = videos.filter((v) => v.id !== id);
    setVideos(updatedList);
    safeStorage.setItem("videocites-videos-db", JSON.stringify(updatedList));
  };

  // Reset entire database to default seeding values
  const handleResetDatabase = () => {
    setVideos(INITIAL_VIDEOS);
    setComments(MOCK_COMMENTS);
    safeStorage.setItem("videocites-videos-db", JSON.stringify(INITIAL_VIDEOS));
    safeStorage.setItem("videocites-comments-db", JSON.stringify(MOCK_COMMENTS));
    const defaultId = INITIAL_VIDEOS[0]?.id || "";
    setSelectedVideoId(defaultId);
    navigateTo("admin");
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
        realViews: target.realViews + 1
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
        realLikes: target.realLikes + 1
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
        realDislikes: target.realDislikes + 1
      };
      handleUpdateVideo(updated);
    }
  };

  // Select current active video object
  const activeVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];

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
          />
        )}

        {currentView === "admin" && (
          isAdmin ? (
            <AdminSeedingPanel
              videos={videos}
              onUpdateVideo={handleUpdateVideo}
              onAddVideo={handleAddVideo}
              onDeleteVideo={handleDeleteVideo}
              onResetDatabase={handleResetDatabase}
            />
          ) : (
            <AdminLogin onLoginSuccess={() => {
              setIsAdmin(true);
              safeStorage.setItem("videocites-is-admin", "true");
            }} />
          )
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
