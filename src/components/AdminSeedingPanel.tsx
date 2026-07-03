import React, { useState, useEffect, useRef } from "react";
import { Video } from "../types";
import { 
  Plus, Eye, ThumbsUp, ThumbsDown, Calendar, UploadCloud, 
  CheckCircle, Database, RefreshCw, Trash2, FileVideo, 
  Activity, ArrowUp, Film, Sparkles, Check, Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminSeedingPanelProps {
  videos: Video[];
  onUpdateVideo: (updated: Video) => void;
  onAddVideo: (newVideo: Video) => void;
  onDeleteVideo: (id: string) => void;
  onResetDatabase: () => void;
}

export default function AdminSeedingPanel({
  videos,
  onUpdateVideo,
  onAddVideo,
  onDeleteVideo,
  onResetDatabase
}: AdminSeedingPanelProps) {
  // Navigation tabs: "add" or "edit"
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");
  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || "");
  const selectedVideo = videos.find(v => v.id === selectedVideoId) || videos[0];

  // ----------------------------------------------------
  // Form fields state
  // ----------------------------------------------------
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4");
  const [authorName, setAuthorName] = useState("Admin");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [duration, setDuration] = useState("12:45");
  const [authorAvatar, setAuthorAvatar] = useState("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80");
  const [likes, setLikes] = useState(12400);
  const [dislikes, setDislikes] = useState(15);
  const [views, setViews] = useState(350000);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cinematic");

  // ----------------------------------------------------
  // Initialize/Sync Form State
  // ----------------------------------------------------
  // Default states for Add mode
  const setAddDefaults = () => {
    setVideoTitle("");
    setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4");
    setAuthorName("Admin");
    setThumbnailUrl("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80");
    setPublishedDate(new Date().toISOString().substring(0, 10));
    setDuration("12:45");
    setAuthorAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80");
    setLikes(Math.floor(Math.random() * 25000) + 500);
    setDislikes(Math.floor(Math.random() * 45));
    setViews(Math.floor(Math.random() * 450000) + 1200);
    setDescription("Add a descriptive description for this video...");
    setCategory("Cinematic");
  };

  useEffect(() => {
    if (activeTab === "add") {
      setAddDefaults();
    } else if (activeTab === "edit" && selectedVideo) {
      setVideoTitle(selectedVideo.title);
      setVideoUrl(selectedVideo.videoUrl);
      setAuthorName(selectedVideo.author?.name || "Admin");
      setThumbnailUrl(selectedVideo.thumbnailUrl || "");
      
      const rawDate = selectedVideo.backdatedDate || selectedVideo.publishedAt;
      setPublishedDate(rawDate ? rawDate.substring(0, 10) : new Date().toISOString().substring(0, 10));
      
      setDuration(selectedVideo.duration || "12:45");
      setAuthorAvatar(selectedVideo.author?.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80");
      setLikes(selectedVideo.baseLikes);
      setDislikes(selectedVideo.baseDislikes);
      setViews(selectedVideo.baseViews);
      setDescription(selectedVideo.description || "");
      setCategory(selectedVideo.category || "Cinematic");
    }
  }, [activeTab, selectedVideoId, selectedVideo]);

  // Sync selected video if list updates
  useEffect(() => {
    if (videos.length > 0 && !videos.some(v => v.id === selectedVideoId)) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  // Automatically analyze external URL when user inputs or changes it
  useEffect(() => {
    if (!videoUrl || !videoUrl.startsWith("http")) return;

    const timer = setTimeout(() => {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.src = videoUrl;
      tempVideo.onloadedmetadata = () => {
        const totalSeconds = Math.round(tempVideo.duration);
        if (totalSeconds > 0) {
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
          setDuration(formatted);
          triggerToast(`Recognized external video! Auto-detected duration: ${formatted}`);
        }
      };
      tempVideo.onerror = () => {
        console.log("External video could not be loaded directly for duration parsing.");
      };
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [videoUrl]);

  // ----------------------------------------------------
  // Drag and Drop Logic
  // ----------------------------------------------------
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    // Simulate metadata extraction from filename
    // Standard pattern: "Movie Title - duration.mp4" or just "Movie Title.mp4"
    let cleanName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
    cleanName = cleanName.replace(/[_-]/g, " ").trim(); // replace dash/underscore with spaces

    // Try to extract duration if it has numbers at the end like "12 45"
    let detectedDuration = "12:45";
    const durationRegex = /(\d{1,2})\s*[:\s-]\s*(\d{2})$/;
    const durationMatch = cleanName.match(durationRegex);
    if (durationMatch) {
      detectedDuration = `${durationMatch[1]}:${durationMatch[2]}`;
      cleanName = cleanName.replace(durationRegex, "").trim();
    }

    // Capitalize words
    cleanName = cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    // Real video duration detection for dropped/uploaded file
    let finalDuration = detectedDuration;
    try {
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.src = URL.createObjectURL(file);
      videoEl.onloadedmetadata = () => {
        const totalSeconds = Math.round(videoEl.duration);
        window.URL.revokeObjectURL(videoEl.src);
        if (totalSeconds > 0) {
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          finalDuration = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
          // Set duration immediately so user sees progress
          setDuration(finalDuration);
        }
      };
    } catch (err) {
      console.error("File duration extraction error", err);
    }

    // Start upload simulation
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            
            // Apply extracted metadata directly to forms!
            setVideoTitle(cleanName);
            setDuration(finalDuration);
            setDescription(`### ${cleanName}\n\nThis video was successfully uploaded via the secure CDN drag-and-drop panel.\n\n- **File Name:** ${file.name}\n- **Format:** High Definition Web-optimized stream\n- **License Identifier:** VIDEOCITES-DRM-${Math.floor(Math.random() * 90000) + 10000}`);
            
            triggerToast("DRM Stream created and metadata extracted!");
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // ----------------------------------------------------
  // Toast notifications State
  // ----------------------------------------------------
  const [successToast, setSuccessToast] = useState("");
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast("");
    }, 4000);
  };

  // ----------------------------------------------------
  // Form Submission (Add or Update)
  // ----------------------------------------------------
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl || !authorName) return;

    // Auto-generate thumbnails if left empty
    const finalThumbnail = thumbnailUrl || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80";

    // Standardize published date to ISO
    let isoDate = new Date().toISOString();
    if (publishedDate) {
      isoDate = new Date(publishedDate).toISOString();
    }

    if (activeTab === "add") {
      const newId = `videocites-${videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
      const newVideo: Video = {
        id: newId,
        title: videoTitle,
        videoUrl: videoUrl,
        thumbnailUrl: finalThumbnail,
        duration: duration || "12:45",
        category: category,
        tags: ["Uploaded", "CDN", "Masterclass"],
        author: {
          name: authorName,
          avatar: authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
          verified: true,
          subscribers: 1200000
        },
        baseViews: views,
        baseLikes: likes,
        baseDislikes: dislikes,
        realViews: 0,
        realLikes: 0,
        realDislikes: 0,
        publishedAt: isoDate,
        backdatedDate: isoDate,
        description: description
      };

      onAddVideo(newVideo);
      triggerToast("Published new copyrighted video successfully!");
      setAddDefaults();
    } else {
      // Edit / Update mode
      if (!selectedVideo) return;
      const updatedVideo: Video = {
        ...selectedVideo,
        title: videoTitle,
        videoUrl: videoUrl,
        thumbnailUrl: finalThumbnail,
        duration: duration,
        category: category,
        author: {
          ...selectedVideo.author,
          name: authorName,
          avatar: authorAvatar,
          verified: true
        },
        baseViews: views,
        baseLikes: likes,
        baseDislikes: dislikes,
        publishedAt: isoDate,
        backdatedDate: isoDate,
        description: description
      };

      onUpdateVideo(updatedVideo);
      triggerToast("Updated video details successfully!");
    }
  };

  return (
    <div className="w-full py-12 px-4 md:px-8 font-sans select-none min-h-screen transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Success Alert Toast */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#0f0f0f] border border-blue-500/30 text-blue-600 dark:text-blue-400 py-3.5 px-6 rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-semibold tracking-wide">{successToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Heading aligned nicely */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">Add or edit copyrighted video streams in the platform repository</p>
        </div>

        {/* CMS Mode Switcher Tab Bar */}
        <div className="flex justify-center">
          <div className="bg-slate-200/50 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-slate-300 dark:border-white/5 flex gap-1 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("add")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "add"
                  ? "bg-white dark:bg-white text-slate-900 dark:text-black shadow-lg shadow-black/5 font-black"
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Publish New Video
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "edit"
                  ? "bg-white dark:bg-white text-slate-900 dark:text-black shadow-lg shadow-black/5 font-black"
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Existing Video
            </button>
          </div>
        </div>

        {/* Interactive Drag & Drop Area for Fast CDN Upload (Shown in Add Tab) */}
        {activeTab === "add" && (
          <div className="max-w-4xl mx-auto">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border border-dashed rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-3 transition-all ${
                dragActive 
                  ? "border-blue-500 bg-blue-500/5" 
                  : "border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 bg-slate-100/50 dark:bg-zinc-900/20 text-slate-700 dark:text-neutral-300"
              }`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/5 text-slate-500 dark:text-neutral-400">
                <UploadCloud className="w-5 h-5 text-blue-500" />
              </div>

              <div>
                <p className="text-xs text-slate-800 dark:text-white font-semibold">Drag & drop your movie file here to prefill details</p>
                <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">Supports mp4, mkv, or mov files. Extracts title & duration automatically.</p>
              </div>
            </div>

            {/* Simulated file upload loader */}
            {uploadProgress !== null && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">UPLOADING & EXTRATING DRM METADATA...</span>
                  <span className="text-slate-700 dark:text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Selector Dropdown when Editing */}
        {activeTab === "edit" && (
          <div className="max-w-4xl mx-auto bg-slate-100 dark:bg-zinc-900/30 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-bold">
                TARGET SELECTION
              </span>
              <p className="text-xs text-slate-500 dark:text-neutral-400">Choose a video from the CDN repository to edit</p>
            </div>

            <div className="relative w-full md:w-80">
              <select
                value={selectedVideoId}
                onChange={(e) => setSelectedVideoId(e.target.value)}
                className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
              >
                {videos.map((vid) => (
                  <option key={vid.id} value={vid.id} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-white">
                    {vid.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-neutral-400 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        )}

        {/* Main Form Block - Modeled EXACTLY on the layout provided by the user in the image */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 relative shadow-2xl shadow-slate-200 dark:shadow-none backdrop-blur-md transition-colors">
          <form onSubmit={handleSubmitForm} className="space-y-6">
            
            {/* ROW 1: Video Title & Video URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Review Phim Bác Sĩ Thiên Tài..."
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* ROW 2: Author Name, Category & Thumbnail URL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Author
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Admin"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all cursor-pointer appearance-none"
                    required
                  >
                    <option value="Cinematic">Cinematic</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Animation">Animation</option>
                    <option value="Nature">Nature</option>
                    <option value="Surrealist">Surrealist</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-neutral-400 text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* ROW 3: Date, Duration & Author Avatar URL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all cursor-pointer font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="12:45"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all text-center font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Author Avatar URL
                </label>
                <input
                  type="text"
                  value={authorAvatar}
                  onChange={(e) => setAuthorAvatar(e.target.value)}
                  placeholder="https://"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* ROW 4: Likes, Dislikes & Views */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Likes
                </label>
                <input
                  type="number"
                  value={likes}
                  onChange={(e) => setLikes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all text-center font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Dislikes
                </label>
                <input
                  type="number"
                  value={dislikes}
                  onChange={(e) => setDislikes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all text-center font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Views
                </label>
                <input
                  type="number"
                  value={views}
                  onChange={(e) => setViews(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all text-center font-mono"
                  required
                />
              </div>
            </div>

            {/* ROW 5: Description Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Type your markdown description or plain text here..."
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all leading-relaxed"
                required
              />
            </div>

            {/* Bottom publish action matching user layout exactly */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                className="bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 font-extrabold text-xs tracking-wider uppercase py-3.5 px-10 rounded-full flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {activeTab === "add" ? (
                  <>
                    <span>Publish Video</span>
                    <ArrowUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* CDN Video Inventory Grid - so they can review their existing database & delete files easily */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
            <h3 className="text-xs font-bold font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
              CDN Media Repository ({videos.length} videos)
            </h3>
            <button
              onClick={onResetDatabase}
              className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white font-mono flex items-center gap-1.5 transition-colors"
              title="Reset Database to default"
            >
              <RefreshCw className="w-3 h-3 animate-spin-hover" />
              Reset DB
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid) => {
              const displayViews = vid.baseViews + vid.realViews;
              const isSelected = vid.id === selectedVideoId && activeTab === "edit";
              
              return (
                <div
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideoId(vid.id);
                    setActiveTab("edit");
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                    isSelected 
                      ? "bg-blue-500/10 border-blue-500/40" 
                      : "bg-white dark:bg-[#0c0c0c]/80 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-white/10 shadow-sm dark:shadow-none"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-16 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-white/5"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{vid.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                        {vid.author?.name || "Admin"} • {displayViews.toLocaleString()} views
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove this video from platform CDN?\n\nTitle: ${vid.title}`)) {
                        onDeleteVideo(vid.id);
                        triggerToast("Successfully deleted video.");
                        if (vid.id === selectedVideoId) {
                          setSelectedVideoId(videos[0]?.id || "");
                        }
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 dark:text-neutral-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
