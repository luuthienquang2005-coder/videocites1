import React, { useState, useEffect } from "react";
import { Video, Photo } from "../types";
import { CATEGORIES_LIST, normalizeCategory } from "../utils/categories";
import { uploadFileToStorage } from "../dbService";
import { 
  Plus, Eye, ThumbsUp, Calendar, UploadCloud, 
  CheckCircle, Database, RefreshCw, Trash2, FileVideo, 
  Activity, ArrowUp, Film, Sparkles, Check, Edit3, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminSeedingPanelProps {
  videos: Video[];
  onUpdateVideo: (updated: Video, oldId?: string) => void;
  onAddVideo: (newVideo: Video) => void;
  onDeleteVideo: (id: string) => void;
  photos: Photo[];
  onUpdatePhoto: (updated: Photo, oldId?: string) => void;
  onAddPhoto: (newPhoto: Photo) => void;
  onDeletePhoto: (id: string) => void;
  onResetDatabase: () => void;
}

export default function AdminSeedingPanel({
  videos,
  onUpdateVideo,
  onAddVideo,
  onDeleteVideo,
  photos,
  onUpdatePhoto,
  onAddPhoto,
  onDeletePhoto,
  onResetDatabase
}: AdminSeedingPanelProps) {
  // Top-level Media Switcher: "video" or "photo"
  const [mediaType, setMediaType] = useState<"video" | "photo">("video");

  // Navigation tabs: "add" or "edit"
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("");

  const selectedVideo = videos.find(v => v.id === selectedVideoId) || videos[0];
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId) || photos[0];

  const [justPublishedMedia, setJustPublishedMedia] = useState<{ id: string; title: string; type: "video" | "photo" } | null>(null);

  // ----------------------------------------------------
  // Form fields state
  // ----------------------------------------------------
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [authorName, setAuthorName] = useState("Admin");
  const [thumbnailUrl, setThumbnailUrl] = useState(""); // Video specific
  const [publishedDate, setPublishedDate] = useState("");
  const [duration, setDuration] = useState("12:45"); // Video specific
  const [authorAvatar, setAuthorAvatar] = useState("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80");
  const [likes, setLikes] = useState(12400);
  const [dislikes, setDislikes] = useState(15);
  const [views, setViews] = useState(350000);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Film & Cinema");
  const [slug, setSlug] = useState("");

  // Initialize selected IDs
  useEffect(() => {
    if (videos.length > 0 && !selectedVideoId) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  useEffect(() => {
    if (photos.length > 0 && !selectedPhotoId) {
      setSelectedPhotoId(photos[0].id);
    }
  }, [photos, selectedPhotoId]);

  // ----------------------------------------------------
  // Initialize/Sync Form State
  // ----------------------------------------------------
  const setAddDefaults = (type: "video" | "photo") => {
    setTitle("");
    setAuthorName("Admin");
    setPublishedDate(new Date().toISOString().substring(0, 10));
    setAuthorAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80");
    setLikes(Math.floor(Math.random() * 25000) + 500);
    setDislikes(Math.floor(Math.random() * 45));
    setViews(Math.floor(Math.random() * 450000) + 1200);
    setCategory("Film & Cinema");
    setSlug("");

    if (type === "video") {
      setMediaUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4");
      setThumbnailUrl("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80");
      setDuration("12:45");
      setDescription("Add a descriptive description for this video...");
    } else {
      setMediaUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&auto=format&fit=crop&w=800");
      setThumbnailUrl("");
      setDuration("");
      setDescription("Add a descriptive description for this photo...");
    }
  };

  useEffect(() => {
    setJustPublishedMedia(null);
    if (activeTab === "add") {
      setAddDefaults(mediaType);
    } else if (activeTab === "edit") {
      if (mediaType === "video" && selectedVideo) {
        setTitle(selectedVideo.title);
        setMediaUrl(selectedVideo.videoUrl);
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
        setCategory(normalizeCategory(selectedVideo.category || "Film & Cinema"));
        setSlug(selectedVideo.id);
      } else if (mediaType === "photo" && selectedPhoto) {
        setTitle(selectedPhoto.title);
        setMediaUrl(selectedPhoto.imageUrl);
        setAuthorName(selectedPhoto.author?.name || "Admin");
        setThumbnailUrl("");
        
        const rawDate = selectedPhoto.backdatedDate || selectedPhoto.publishedAt;
        setPublishedDate(rawDate ? rawDate.substring(0, 10) : new Date().toISOString().substring(0, 10));
        
        setDuration("");
        setAuthorAvatar(selectedPhoto.author?.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80");
        setLikes(selectedPhoto.baseLikes);
        setDislikes(selectedPhoto.baseDislikes);
        setViews(selectedPhoto.baseViews);
        setDescription(selectedPhoto.description || "");
        setCategory(normalizeCategory(selectedPhoto.category || "Film & Cinema"));
        setSlug(selectedPhoto.id);
      }
    }
  }, [activeTab, mediaType, selectedVideoId, selectedPhotoId, selectedVideo, selectedPhoto]);

  // Sync selected video/photo if lists update
  useEffect(() => {
    if (videos.length > 0 && !videos.some(v => v.id === selectedVideoId)) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  useEffect(() => {
    if (photos.length > 0 && !photos.some(p => p.id === selectedPhotoId)) {
      setSelectedPhotoId(photos[0].id);
    }
  }, [photos, selectedPhotoId]);

  // ----------------------------------------------------
  // Video duration auto-extract
  // ----------------------------------------------------
  useEffect(() => {
    if (mediaType !== "video" || !mediaUrl || !mediaUrl.startsWith("http")) return;

    const timer = setTimeout(() => {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.src = mediaUrl;
      tempVideo.onloadedmetadata = () => {
        const totalSeconds = Math.round(tempVideo.duration);
        if (totalSeconds > 0) {
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
          setDuration(formatted);
          triggerToast(`Recognized video! Auto-detected duration: ${formatted}`);
        }
      };
      tempVideo.onerror = () => {
        console.log("Video source could not be loaded directly for duration parsing.");
      };
    }, 1000);

    return () => clearTimeout(timer);
  }, [mediaUrl, mediaType]);

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

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = `uploads/${mediaType}/${Date.now()}-${cleanFileName}`;
      setUploadProgress(0);
      
      const url = await uploadFileToStorage(file, path, (progress) => {
        setUploadProgress(progress);
      });
      
      // Delay clearing progress bar briefly for a satisfying completion feel
      setTimeout(() => {
        setUploadProgress(null);
      }, 600);
      
      return url;
    } catch (e: any) {
      setUploadProgress(null);
      throw new Error(e.message || "Network error uploading to Storage");
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    let cleanName = file.name.replace(/\.[^/.]+$/, "");
    cleanName = cleanName.replace(/[_-]/g, " ").trim();

    let detectedDuration = "12:45";
    const durationRegex = /(\d{1,2})\s*[:\s-]\s*(\d{2})$/;
    const durationMatch = cleanName.match(durationRegex);
    if (durationMatch) {
      detectedDuration = `${durationMatch[1]}:${durationMatch[2]}`;
      cleanName = cleanName.replace(durationRegex, "").trim();
    }

    cleanName = cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    // Drag-drop image vs video loading
    if (mediaType === "photo") {
      triggerToast("Uploading photo, please wait...");
      uploadFile(file).then((url) => {
        setMediaUrl(url);
        setTitle(cleanName);
        setDescription(`### ${cleanName}\n\nThis photo was uploaded via the secure CDN drag-and-drop panel.\n\n- **File Name:** ${file.name}\n- **Format:** Image Render asset\n- **License:** VIDEOCITES-PHOTO-DRM-${Math.floor(Math.random() * 90000) + 10000}`);
        triggerToast("Successfully uploaded and processed photo!");
      }).catch((err: any) => {
        console.error("Upload error:", err);
        triggerToast(`Upload failed: ${err.message || err}. Falling back to local memory preview.`);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setMediaUrl(reader.result);
            setTitle(cleanName);
            setDescription(`### ${cleanName}\n\nThis photo was uploaded via the secure CDN drag-and-drop panel.\n\n- **File Name:** ${file.name}\n- **Format:** Image Render asset\n- **License:** VIDEOCITES-PHOTO-DRM-${Math.floor(Math.random() * 90000) + 10000}`);
          }
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    // Video path
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
          setDuration(finalDuration);
        }
      };
    } catch (err) {
      console.error("File duration extraction error", err);
    }

    triggerToast("Uploading video, please wait...");
    uploadFile(file).then((url) => {
      setMediaUrl(url);
      setTitle(cleanName);
      setDuration(finalDuration);
      setDescription(`### ${cleanName}\n\nThis video was successfully uploaded via the secure CDN drag-and-drop panel.\n\n- **File Name:** ${file.name}\n- **Format:** High Definition Web-optimized stream\n- **License Identifier:** VIDEOCITES-DRM-${Math.floor(Math.random() * 90000) + 10000}`);
      triggerToast("DRM Stream created and video uploaded successfully!");
    }).catch((err: any) => {
      console.error("Upload error:", err);
      triggerToast(`Upload failed: ${err.message || err}. Falling back to local preview.`);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setMediaUrl(reader.result);
          setTitle(cleanName);
          setDuration(finalDuration);
          setDescription(`### ${cleanName}\n\nThis video is loaded locally.\n\n- **File Name:** ${file.name}\n- **Format:** High Definition Web-optimized stream\n- **License Identifier:** VIDEOCITES-DRM-${Math.floor(Math.random() * 90000) + 10000}`);
        }
      };
      reader.readAsDataURL(file);
    });
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
  // Media Fetching Helpers
  // ----------------------------------------------------
  const handleAutoGetMedia = () => {
    if (!title) {
      triggerToast(`Please enter a ${mediaType} title first to fetch a matching image!`);
      return;
    }

    if (mediaType === "video") {
      const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = mediaUrl.match(ytReg);
      if (match && match[1]) {
        const ytId = match[1];
        setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`);
        triggerToast("Automatically fetched cover image from YouTube video!");
        return;
      }
    }

    // Category-specific Unsplash photos
    let photoId = "1506318137071-a8e063b4bec0";
    if (category === "Sci-Fi" || category === "Tech" || category === "Công nghệ") {
      const pics = ["1451187580459-43490279c0fa", "1506703719100-a0f3a48c0f86", "1446776811953-b23d57bd21aa", "1461360370896-922624d12aa1"];
      photoId = pics[Math.floor(Math.random() * pics.length)];
    } else if (category === "Cinematic" || category === "Film & Cinema" || category === "Phim ảnh") {
      const pics = ["1485846234645-a62644f84728", "1536440136628-849c177e76a1", "1507679799987-c73779587ccf", "1489599849927-2ee91cede3ba"];
      photoId = pics[Math.floor(Math.random() * pics.length)];
    } else if (category === "Animation" || category === "Entertainment" || category === "Giải trí") {
      const pics = ["1534447677768-be436bb09401", "1607604276583-eef5d076aa5f", "1560942485-b2a11cc13456", "1581833971358-2c8b550f87b3"];
      photoId = pics[Math.floor(Math.random() * pics.length)];
    } else if (category === "Nature" || category === "Thiên nhiên") {
      const pics = ["1472214222541-d510753a4907", "1447752875215-b2761acb3c5d", "1470071459604-3b5ec3a7fe05", "1469474968028-56623f02e42e"];
      photoId = pics[Math.floor(Math.random() * pics.length)];
    } else if (category === "Surrealist" || category === "Gaming" || category === "Trò chơi") {
      const pics = ["1518709268805-4e9042af9f23", "1490730141103-6cac27aaab94", "1541701494587-cb58502866ab", "1518531933037-91b2f5f229cc"];
      photoId = pics[Math.floor(Math.random() * pics.length)];
    } else if (category === "Music" || category === "Âm nhạc") {
      const pics = ["1511671782779-c97d3d27a1d4", "1470225620780-dba8ba36b745", "1487180142328-054b783fc471", "1514525253161-7a46d19cd819"];
      photoId = pics[Math.floor(Math.random() * pics.length)];
    }

    const unsplashUrl = `https://images.unsplash.com/photo-${photoId}?q=80&auto=format&fit=crop&w=800`;
    
    if (mediaType === "video") {
      setThumbnailUrl(unsplashUrl);
    } else {
      setMediaUrl(unsplashUrl);
    }
    triggerToast(`Fetched elegant photography representation from Unsplash!`);
  };

  const handleMediaUploadInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        triggerToast("Uploading image, please wait...");
        const url = await uploadFile(file);
        if (mediaType === "video") {
          setThumbnailUrl(url);
        } else {
          setMediaUrl(url);
        }
        triggerToast("Successfully uploaded image!");
      } catch (err: any) {
        console.error("Upload error:", err);
        triggerToast(`Upload failed: ${err.message || err}. Falling back to local preview.`);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            if (mediaType === "video") {
              setThumbnailUrl(reader.result);
            } else {
              setMediaUrl(reader.result);
            }
          }
        };
        reader.readAsDataURL(file);
      }
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
  // Form Submission
  // ----------------------------------------------------
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl || !authorName) return;

    let isoDate = new Date().toISOString();
    if (publishedDate) {
      isoDate = new Date(publishedDate).toISOString();
    }

    const generatedId = `videocites-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const finalId = slug.trim() ? slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") : generatedId;

    if (mediaType === "video") {
      const finalThumbnail = thumbnailUrl || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80";
      
      if (activeTab === "add") {
        const newVideo: Video = {
          id: finalId,
          title: title,
          videoUrl: mediaUrl,
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
        setJustPublishedMedia({ id: finalId, title: title, type: "video" });
        triggerToast("Published new copyrighted video successfully!");
        setAddDefaults("video");
      } else {
        if (!selectedVideo) return;
        const updatedVideo: Video = {
          ...selectedVideo,
          id: finalId,
          title: title,
          videoUrl: mediaUrl,
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
        onUpdateVideo(updatedVideo, selectedVideo.id);
        setSelectedVideoId(finalId);
        setJustPublishedMedia({ id: finalId, title: title, type: "video" });
        triggerToast("Updated video details successfully!");
      }
    } else {
      // Photo mode
      if (activeTab === "add") {
        const newPhoto: Photo = {
          id: finalId,
          title: title,
          imageUrl: mediaUrl,
          category: category,
          tags: ["Uploaded", "CDN", "Gallery"],
          author: {
            name: authorName,
            avatar: authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
            verified: true,
            subscribers: 850000
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
        onAddPhoto(newPhoto);
        setJustPublishedMedia({ id: finalId, title: title, type: "photo" });
        triggerToast("Published new photo artwork successfully!");
        setAddDefaults("photo");
      } else {
        if (!selectedPhoto) return;
        const updatedPhoto: Photo = {
          ...selectedPhoto,
          id: finalId,
          title: title,
          imageUrl: mediaUrl,
          category: category,
          author: {
            ...selectedPhoto.author,
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
        onUpdatePhoto(updatedPhoto, selectedPhoto.id);
        setSelectedPhotoId(finalId);
        setJustPublishedMedia({ id: finalId, title: title, type: "photo" });
        triggerToast("Updated photo details successfully!");
      }
    }
  };

  return (
    <div className="w-full py-12 px-4 md:px-8 font-sans select-none min-h-screen transition-colors duration-300" id="admin-seeding-panel">
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

        {/* Dashboard Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">Add or edit copyrighted media streams in the platform repository</p>
        </div>

        {/* MEDIA TYPE SWITCHER AT TOP */}
        <div className="flex justify-center border-b border-slate-200 dark:border-white/10 pb-6 max-w-md mx-auto">
          <div className="bg-slate-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl flex gap-1.5 w-full border border-slate-200 dark:border-white/5">
            <button
              onClick={() => {
                setMediaType("video");
                setJustPublishedMedia(null);
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mediaType === "video"
                  ? "bg-blue-500 text-neutral-950 shadow-md"
                  : "text-slate-500 hover:text-slate-950 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <Film className="w-4 h-4" />
              Video Content Manager
            </button>
            <button
              onClick={() => {
                setMediaType("photo");
                setJustPublishedMedia(null);
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mediaType === "photo"
                  ? "bg-blue-500 text-neutral-950 shadow-md"
                  : "text-slate-500 hover:text-slate-950 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photo Content Manager
            </button>
          </div>
        </div>

        {/* CMS Mode Switcher (Publish / Edit) */}
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
              Publish New {mediaType === "video" ? "Video" : "Photo"}
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
              Edit Existing {mediaType === "video" ? "Video" : "Photo"}
            </button>
          </div>
        </div>

        {/* Success watch-link banner */}
        {justPublishedMedia && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-400/20 rounded-3xl space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0 flex-grow">
                <h4 className="text-sm font-black text-slate-800 dark:text-white animate-pulse">
                  Successfully Published Watch Link!
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  The {justPublishedMedia.type === "video" ? "video" : "photo"} "<span className="font-bold text-slate-700 dark:text-neutral-200">{justPublishedMedia.title}</span>" is now live and available.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="min-w-0 flex-grow">
                <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest block mb-1">
                  OFFICIAL SECURE LINK
                </span>
                <code className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400 break-all select-all">
                  {typeof window !== "undefined" ? window.location.origin : "https://www.videocites.com.au"}/{justPublishedMedia.type === "video" ? "watch?v=" : "photo?v="}{justPublishedMedia.id}
                </code>
              </div>

              <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const path = justPublishedMedia.type === "video" ? "watch?v=" : "photo?v=";
                    const url = `${typeof window !== "undefined" ? window.location.origin : "https://www.videocites.com.au"}/${path}${justPublishedMedia.id}`;
                    navigator.clipboard.writeText(url);
                    triggerToast("Copied link to clipboard!");
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/50 dark:border-white/5 active:scale-95"
                >
                  Copy Link
                </button>
                <a
                  href={justPublishedMedia.type === "video" ? `/watch?v=${justPublishedMedia.id}` : `/photo?v=${justPublishedMedia.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  View Now <Eye className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Drag & Drop Area for Fast CDN Upload (Shown in Add Tab) */}
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
                accept={mediaType === "video" ? "video/*" : "image/*"}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/5 text-slate-500 dark:text-neutral-400">
                <UploadCloud className="w-5 h-5 text-blue-500" />
              </div>

              <div>
                <p className="text-xs text-slate-800 dark:text-white font-semibold">
                  Drag & drop your {mediaType === "video" ? "video" : "image"} file here to prefill details
                </p>
                <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                  Extracts metadata and sets attachment details instantly.
                </p>
              </div>
            </div>

            {/* Simulated file upload loader */}
            {uploadProgress !== null && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">PREPARING MEDIA FILES...</span>
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

        {/* Selector Dropdown when Editing */}
        {activeTab === "edit" && (
          <div className="max-w-4xl mx-auto bg-slate-100 dark:bg-zinc-900/30 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-bold">
                TARGET SELECTION
              </span>
              <p className="text-xs text-slate-500 dark:text-neutral-400">Choose a {mediaType} from the repository to edit</p>
            </div>

            <div className="relative w-full md:w-80">
              {mediaType === "video" ? (
                <select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none animate-fade-in"
                >
                  {videos.map((vid) => (
                    <option key={vid.id} value={vid.id}>
                      {vid.title}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedPhotoId}
                  onChange={(e) => setSelectedPhotoId(e.target.value)}
                  className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none animate-fade-in"
                >
                  {photos.map((pic) => (
                    <option key={pic.id} value={pic.id}>
                      {pic.title}
                    </option>
                  ))}
                </select>
              )}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-neutral-400 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        )}

        {/* Main Form Block */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 relative shadow-2xl shadow-slate-200 dark:shadow-none backdrop-blur-md transition-colors">
          <form onSubmit={handleSubmitForm} className="space-y-6">
            
            {/* ROW 1: Title & Media URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  {mediaType === "video" ? "Video Title" : "Photo Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Enter ${mediaType} title...`}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                  <span>{mediaType === "video" ? "Video URL" : "Photo/Image URL"}</span>
                </label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                  required
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (mediaUrl) {
                        window.open(mediaUrl, "_blank");
                        triggerToast(`Opening ${mediaType} source URL in new window...`);
                      } else {
                        triggerToast("Please enter a media URL first!");
                      }
                    }}
                    className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Test Attachment Link</span>
                  </button>

                  {mediaType === "video" && (
                    <div className="relative flex-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setMediaUrl(e.target.value);
                            triggerToast("High-quality sample video source selected!");
                            e.target.value = "";
                          }
                        }}
                        className="w-full h-full py-1.5 pl-3 pr-8 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer border border-slate-200 dark:border-white/5 appearance-none text-center outline-none"
                      >
                        <option value="">Select Sample Video</option>
                        <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4">Subaru Outback (Cinematic)</option>
                        <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4">Sintel Movie (Animation)</option>
                        <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4">Big Buck Bunny (Nature)</option>
                        <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4">Tears of Steel (Sci-Fi)</option>
                      </select>
                      <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400 text-[8px]">
                        ▼
                      </div>
                    </div>
                  )}

                  {mediaType === "photo" && (
                    <>
                      <label className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5 text-center">
                        <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMediaUploadInput}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGetMedia}
                        className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Fetch Auto</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CUSTOM ROUTE SLUG IDENTIFIER */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-[#141414]/30 border border-slate-200 dark:border-white/5 rounded-2xl">
              <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                <span>Watch Link Identifier ({mediaType === "video" ? "Video ID" : "Photo ID"} / Slug)</span>
                <span className="text-[11px] text-blue-500 dark:text-blue-400 font-mono font-semibold">
                  /{mediaType === "video" ? "watch?v=" : "photo?v="}{slug || "auto-from-title"}
                </span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder={activeTab === "add" ? `Leave blank to auto-generate from title (e.g., videocites-${mediaType}-title-1234)` : "Enter custom slug..."}
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
              />
            </div>

            {/* ROW 2: Author Name, Category & Video Thumbnail URL (Video Only) */}
            <div className={`grid grid-cols-1 ${mediaType === "video" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
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
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-neutral-400 text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              {mediaType === "video" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                    <span>Thumbnail URL</span>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400 lowercase font-semibold">Auto / Upload</span>
                  </label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://"
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAutoGetMedia}
                      className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>Fetch Auto</span>
                    </button>
                    <label className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5 text-center">
                      <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMediaUploadInput}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* ROW 3: Date, Duration (Video Only) & Author Avatar URL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all cursor-pointer font-mono"
                  required
                />
              </div>

              {mediaType === "video" ? (
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
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                    Layout Asset Dimensions
                  </label>
                  <div className="w-full py-3 px-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-center font-mono text-xs text-slate-500">
                    N/A (Scales responsively)
                  </div>
                </div>
              )}

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
                  Base Likes
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
                  Base Dislikes
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
                  Base Views
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

            {/* ROW 5: Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                Description (Markdown supported)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Type your markdown description..."
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all leading-relaxed"
                required
              />
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
              {activeTab === "edit" && (
                <button
                  type="button"
                  onClick={() => {
                    const currentId = mediaType === "video" ? selectedVideoId : selectedPhotoId;
                    const currentTitle = mediaType === "video" ? selectedVideo?.title : selectedPhoto?.title;
                    if (confirm(`Are you sure you want to delete this ${mediaType} from the repository?\n\nTitle: ${currentTitle}`)) {
                      if (mediaType === "video") {
                        onDeleteVideo(currentId);
                        setSelectedVideoId(videos[0]?.id || "");
                      } else {
                        onDeletePhoto(currentId);
                        setSelectedPhotoId(photos[0]?.id || "");
                      }
                      triggerToast(`Successfully deleted the ${mediaType}!`);
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-8 rounded-full flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-95 border border-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete This {mediaType === "video" ? "Video" : "Photo"}</span>
                </button>
              )}

              <button
                type="submit"
                className="bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 font-extrabold text-xs tracking-wider uppercase py-3.5 px-10 rounded-full flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {activeTab === "add" ? (
                  <>
                    <span>Publish {mediaType === "video" ? "Video" : "Photo"}</span>
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

        {/* CDN Repository Inventory Grid */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
            <h3 className="text-xs font-bold font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
              CDN Media Repository ({mediaType === "video" ? `${videos.length} videos` : `${photos.length} photos`})
            </h3>
            <button
              onClick={onResetDatabase}
              className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset Database to defaults"
            >
              <RefreshCw className="w-3 h-3 animate-spin-hover" />
              Reset DB
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaType === "video" ? (
              videos.map((vid) => {
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
                        referrerPolicy="no-referrer"
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
                        if (confirm(`Are you sure you want to delete this video?\n\nTitle: ${vid.title}`)) {
                          onDeleteVideo(vid.id);
                          triggerToast("Successfully deleted the video!");
                          if (vid.id === selectedVideoId) {
                            setSelectedVideoId(videos[0]?.id || "");
                          }
                        }
                      }}
                      className="p-2 text-slate-400 dark:text-neutral-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500/80 group-hover:text-rose-500" />
                    </button>
                  </div>
                );
              })
            ) : (
              photos.map((pic) => {
                const displayViews = pic.baseViews + pic.realViews;
                const isSelected = pic.id === selectedPhotoId && activeTab === "edit";
                
                return (
                  <div
                    key={pic.id}
                    onClick={() => {
                      setSelectedPhotoId(pic.id);
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
                        src={pic.imageUrl}
                        alt={pic.title}
                        className="w-16 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-white/5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{pic.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                          {pic.author?.name || "Admin"} • {displayViews.toLocaleString()} views
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete this photo?\n\nTitle: ${pic.title}`)) {
                          onDeletePhoto(pic.id);
                          triggerToast("Successfully deleted the photo!");
                          if (pic.id === selectedPhotoId) {
                            setSelectedPhotoId(photos[0]?.id || "");
                          }
                        }
                      }}
                      className="p-2 text-slate-400 dark:text-neutral-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500/80 group-hover:text-rose-500" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
