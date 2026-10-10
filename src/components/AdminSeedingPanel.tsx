import React, { useState, useEffect } from "react";
import { Video, Photo } from "../types";
import { CATEGORIES_LIST, normalizeCategory } from "../utils/categories";
import { 
  Plus, Eye, ThumbsUp, Calendar, UploadCloud, 
  CheckCircle, Database, RefreshCw, Trash2, FileVideo, 
  Activity, ArrowUp, Film, Sparkles, Check, Edit3, Image as ImageIcon,
  Layers, Dices, Shuffle, Copy, ExternalLink, MessageSquare, 
  Sliders, PlusCircle, AlertCircle, Loader2, Play, HardDrive, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { parseVideoSource, fetchAutoVideoMetadata } from "../utils/videoHelpers";
import { extractThumbnailFromVideoFile } from "../utils/indexedDbStorage";
import { uploadVideoToServer, uploadThumbnailDataUrlToServer } from "../utils/mediaUploader";

interface AdminSeedingPanelProps {
  videos: Video[];
  onUpdateVideo: (updated: Video, oldId?: string) => void;
  onAddVideo: (newVideo: Video, customCommentCount?: number) => void;
  onDeleteVideo: (id: string) => void;
  photos: Photo[];
  onUpdatePhoto: (updated: Photo, oldId?: string) => void;
  onAddPhoto: (newPhoto: Photo, customCommentCount?: number) => void;
  onDeletePhoto: (id: string) => void;
  onResetDatabase: () => void;
}

interface BulkVideoCardItem {
  tempId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  slug: string;
  views: number;
  likes: number;
  dislikes: number;
  commentsCount: number;
  file?: File;
}

// Sample video assets for quick testing
const SAMPLE_VIDEOS = [
  { name: "YouTube: Blender Open Movie", url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
  { name: "YouTube: Nature 4K Demo", url: "https://www.youtube.com/watch?v=LXb3EKWsInQ" },
  { name: "Vimeo: The Mountain (Time-Lapse)", url: "https://vimeo.com/22439234" },
  { name: "Subaru Outback (Direct MP4)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
  { name: "Sintel Movie (Direct MP4)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
  { name: "Big Buck Bunny (Direct MP4)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { name: "Tears of Steel (Sci-Fi MP4)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" }
];

// Helper to generate realistic stats
const generateSingleRandomStats = () => {
  const views = Math.floor(Math.random() * 49500) + 500; // 500 - 50,000
  // Likes scaled proportionally with some randomness: 50 - 5,000
  const maxLikes = Math.min(5000, Math.max(50, Math.floor(views * (0.05 + Math.random() * 0.15))));
  const likes = Math.floor(Math.random() * (maxLikes - 50)) + 50;
  const dislikes = Math.floor(Math.random() * Math.min(30, Math.floor(likes * 0.02) + 1));
  const commentsCount = Math.floor(Math.random() * 295) + 5; // 5 - 300 comments
  return { views, likes, dislikes, commentsCount };
};

// Initial default bulk video cards (5 cards)
const createInitialBulkCards = (): BulkVideoCardItem[] => {
  return [1, 2, 3, 4, 5].map((idx) => {
    const stats = generateSingleRandomStats();
    return {
      tempId: `bulk-card-${idx}-${Date.now()}`,
      title: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "10:00",
      slug: "",
      views: stats.views,
      likes: stats.likes,
      dislikes: stats.dislikes,
      commentsCount: stats.commentsCount
    };
  });
};

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

  // Navigation tabs: "add" | "bulk" | "edit"
  const [activeTab, setActiveTab] = useState<"add" | "bulk" | "edit">("add");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("");

  const selectedVideo = videos.find(v => v.id === selectedVideoId) || videos[0];
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId) || photos[0];

  const [justPublishedMedia, setJustPublishedMedia] = useState<{ id: string; title: string; type: "video" | "photo" } | null>(null);

  // ----------------------------------------------------
  // Single Form fields state
  // ----------------------------------------------------
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [authorName, setAuthorName] = useState("Admin");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [duration, setDuration] = useState("12:45");
  const [authorAvatar, setAuthorAvatar] = useState("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80");
  const [likes, setLikes] = useState(12400);
  const [dislikes, setDislikes] = useState(15);
  const [views, setViews] = useState(350000);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Film & Cinema");
  const [slug, setSlug] = useState("");
  const [pendingLocalFile, setPendingLocalFile] = useState<File | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // ----------------------------------------------------
  // Bulk Video Upload State (Global Shared Settings)
  // ----------------------------------------------------
  const [sharedAuthorName, setSharedAuthorName] = useState("Admin");
  const [sharedAuthorAvatar, setSharedAuthorAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80");
  const [sharedCategory, setSharedCategory] = useState("Film & Cinema");
  const [sharedDescription, setSharedDescription] = useState(
    "### Masterclass Stream Series\n\nOfficial high-definition stream published on the Videocites Digital Network.\n\n- **Resolution:** 4K UHD Master Stream\n- **License Identifier:** VIDEOCITES-BATCH-DRM\n- **Distribution:** Exclusive Digital Rights"
  );
  const [sharedPublishDate, setSharedPublishDate] = useState(new Date().toISOString().substring(0, 10));

  // Random Engagement Metrics Generator Toggle & State
  const [generateRandomStats, setGenerateRandomStats] = useState(true);

  // Individual Bulk Video Cards (5-10 videos)
  const [bulkVideos, setBulkVideos] = useState<BulkVideoCardItem[]>(createInitialBulkCards);
  const [isPublishingBatch, setIsPublishingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; title: string } | null>(null);
  const [bulkPublishedSuccess, setBulkPublishedSuccess] = useState<{ id: string; title: string }[] | null>(null);

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

  // Toast notifications State
  const [successToast, setSuccessToast] = useState("");
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast("");
    }, 4000);
  };

  // ----------------------------------------------------
  // Sync Form State for Single Add / Edit
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
    setPendingLocalFile(null);

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

  // Video duration auto-extract for single video
  useEffect(() => {
    if (activeTab !== "add" || mediaType !== "video" || !mediaUrl || !mediaUrl.startsWith("http")) return;

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
      tempVideo.onerror = () => {};
    }, 1000);

    return () => clearTimeout(timer);
  }, [mediaUrl, mediaType, activeTab]);

  // ----------------------------------------------------
  // Bulk Video Functions
  // ----------------------------------------------------

  // Reroll random stats for all bulk cards
  const handleRerollAllStats = () => {
    setBulkVideos((prev) =>
      prev.map((card) => {
        const stats = generateSingleRandomStats();
        return {
          ...card,
          views: stats.views,
          likes: stats.likes,
          dislikes: stats.dislikes,
          commentsCount: stats.commentsCount
        };
      })
    );
    triggerToast("Regenerated random Views, Likes & Comments for all batch cards!");
  };

  // Reroll stats for an individual card
  const handleRerollSingleCardStats = (tempId: string) => {
    const stats = generateSingleRandomStats();
    setBulkVideos((prev) =>
      prev.map((card) => (card.tempId === tempId ? { ...card, ...stats } : card))
    );
    triggerToast("Rerolled random stats for this video card!");
  };

  // Add a new video card to the bulk list (up to 10)
  const handleAddBulkCard = () => {
    if (bulkVideos.length >= 10) {
      triggerToast("Maximum of 10 videos per batch reached.");
      return;
    }
    const stats = generateRandomStats ? generateSingleRandomStats() : { views: 5000, likes: 350, dislikes: 4, commentsCount: 25 };
    const newCard: BulkVideoCardItem = {
      tempId: `bulk-card-${bulkVideos.length + 1}-${Date.now()}`,
      title: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "10:00",
      slug: "",
      ...stats
    };
    setBulkVideos((prev) => [...prev, newCard]);
    triggerToast(`Added video card #${bulkVideos.length + 1}`);
  };

  // Remove a video card from the bulk list
  const handleRemoveBulkCard = (tempId: string) => {
    if (bulkVideos.length <= 1) {
      triggerToast("Batch upload must contain at least 1 video card.");
      return;
    }
    setBulkVideos((prev) => prev.filter((c) => c.tempId !== tempId));
  };

  // Update a field in a specific bulk card
  const handleUpdateBulkCardField = (tempId: string, field: keyof BulkVideoCardItem, value: any) => {
    setBulkVideos((prev) =>
      prev.map((card) => (card.tempId === tempId ? { ...card, [field]: value } : card))
    );
  };

  // Fetch metadata for a bulk card (duration, cover image, and title from YouTube/Vimeo/Direct video or Unsplash)
  const handleAutoFetchBulkThumbnail = async (card: BulkVideoCardItem) => {
    if (card.videoUrl) {
      triggerToast("Detecting video duration & cover image...");
      try {
        const meta = await fetchAutoVideoMetadata(card.videoUrl);
        if (meta.thumbnailUrl) {
          handleUpdateBulkCardField(card.tempId, "thumbnailUrl", meta.thumbnailUrl);
        }
        if (meta.durationFormatted) {
          handleUpdateBulkCardField(card.tempId, "duration", meta.durationFormatted);
        }
        if (meta.title && (!card.title || card.title === "New Video Item")) {
          handleUpdateBulkCardField(card.tempId, "title", meta.title);
        }
        triggerToast(`Auto-detected: ${meta.durationFormatted ? `Duration (${meta.durationFormatted}) & ` : ""}Cover!`);
        return;
      } catch (err) {
        console.error("Auto fetch error:", err);
      }
    }

    // Pick a high-res photo from Unsplash based on shared category
    const cat = sharedCategory;
    const categoryPics: Record<string, string[]> = {
      "Film & Cinema": ["1485846234645-a62644f84728", "1536440136628-849c177e76a1", "1507679799987-c73779587ccf", "1489599849927-2ee91cede3ba"],
      "Animation": ["1534447677768-be436bb09401", "1607604276583-eef5d076aa5f", "1560942485-b2a11cc13456", "1581833971358-2c8b550f87b3"],
      "Sci-Fi": ["1451187580459-43490279c0fa", "1506703719100-a0f3a48c0f86", "1446776811953-b23d57bd21aa", "1461360370896-922624d12aa1"],
      "Nature": ["1472214222541-d510753a4907", "1447752875215-b2761acb3c5d", "1470071459604-3b5ec3a7fe05", "1469474968028-56623f02e42e"],
      "Music": ["1511671782779-c97d3d27a1d4", "1470225620780-dba8ba36b745", "1487180142328-054b783fc471", "1514525253161-7a46d19cd819"],
      "Tech": ["1518770660439-4636190af475", "1526374965328-7f61d4dc18c5", "1504384308090-c894fdcc538d", "1488590528505-98d2b5aba04b"]
    };
    const pool = categoryPics[cat] || categoryPics["Film & Cinema"];
    const randomPic = pool[Math.floor(Math.random() * pool.length)];
    const url = `https://images.unsplash.com/photo-${randomPic}?q=80&auto=format&fit=crop&w=800`;
    handleUpdateBulkCardField(card.tempId, "thumbnailUrl", url);
    triggerToast("Generated themed cover image from Unsplash!");
  };

  // Multi-file drag and drop / upload into bulk cards
  const handleBulkFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).slice(0, 10);
    
    const updatedCards: BulkVideoCardItem[] = fileArray.map((file, idx) => {
      let cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
      let detectedDuration = "10:00";
      const durationRegex = /(\d{1,2})\s*[:\s-]\s*(\d{2})$/;
      const durationMatch = cleanName.match(durationRegex);
      if (durationMatch) {
        detectedDuration = `${durationMatch[1]}:${durationMatch[2]}`;
        cleanName = cleanName.replace(durationRegex, "").trim();
      }
      cleanName = cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      const stats = generateRandomStats ? generateSingleRandomStats() : { views: 5000, likes: 350, dislikes: 4, commentsCount: 25 };

      // Sample unsplash thumbnail matching category
      const randomPics = ["1506318137071-a8e063b4bec0", "1485846234645-a62644f84728", "1451187580459-43490279c0fa", "1472214222541-d510753a4907"];
      const thumb = `https://images.unsplash.com/photo-${randomPics[idx % randomPics.length]}?q=80&auto=format&fit=crop&w=800`;

      return {
        tempId: `bulk-card-file-${idx}-${Date.now()}`,
        title: cleanName,
        videoUrl: URL.createObjectURL(file),
        thumbnailUrl: thumb,
        duration: detectedDuration,
        slug: "",
        file: file,
        ...stats
      };
    });

    setBulkVideos(updatedCards);
    triggerToast(`Imported ${updatedCards.length} video files into batch cards!`);
  };

  // Submit all bulk videos in the batch
  const handlePublishBulkBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate that all cards have a title & videoUrl
    const invalidCard = bulkVideos.find((c) => !c.title.trim() || !c.videoUrl.trim());
    if (invalidCard) {
      triggerToast("Please fill in both Video Title and Video URL for all cards in the batch!");
      return;
    }

    setIsPublishingBatch(true);
    setBulkPublishedSuccess(null);
    const publishedSummary: { id: string; title: string }[] = [];

    const isoDate = sharedPublishDate ? new Date(sharedPublishDate).toISOString() : new Date().toISOString();

    for (let i = 0; i < bulkVideos.length; i++) {
      const card = bulkVideos[i];
      setBatchProgress({
        current: i + 1,
        total: bulkVideos.length,
        title: card.title
      });

      const generatedId = `videocites-${card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}${i}`;
      const finalId = card.slug.trim() ? card.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") : generatedId;
      const finalThumbnail = card.thumbnailUrl || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80";

      // If random stats is enabled, generate fresh numbers or use card's stats
      const finalViews = generateRandomStats ? card.views : (card.views || 10000);
      const finalLikes = generateRandomStats ? card.likes : (card.likes || 800);
      const finalDislikes = generateRandomStats ? card.dislikes : (card.dislikes || 10);
      const finalCommentsCount = generateRandomStats ? card.commentsCount : (card.commentsCount || 25);

      let cardVideoUrl = card.videoUrl;
      let finalCardThumb = finalThumbnail;
      if (card.file) {
        try {
          const uploadedUrl = await uploadVideoToServer(card.file);
          cardVideoUrl = uploadedUrl;
        } catch (storageErr) {
          console.error("Bulk file upload error:", storageErr);
        }
      }
      if (finalCardThumb.startsWith("data:")) {
        try {
          finalCardThumb = await uploadThumbnailDataUrlToServer(finalCardThumb);
        } catch {}
      }

      const newVideo: Video = {
        id: finalId,
        title: card.title,
        videoUrl: cardVideoUrl,
        thumbnailUrl: finalCardThumb,
        duration: card.duration || "10:00",
        category: sharedCategory,
        tags: ["Bulk Upload", "Masterclass", "Official", sharedCategory],
        author: {
          name: sharedAuthorName || "Admin",
          avatar: sharedAuthorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
          verified: true,
          subscribers: 1200000
        },
        baseViews: finalViews,
        baseLikes: finalLikes,
        baseDislikes: finalDislikes,
        realViews: 0,
        realLikes: 0,
        realDislikes: 0,
        publishedAt: isoDate,
        backdatedDate: isoDate,
        description: sharedDescription
      };

      // Call onAddVideo with the custom comment count
      await onAddVideo(newVideo, finalCommentsCount);
      publishedSummary.push({ id: finalId, title: card.title });

      // Small async tick for Firestore batch safety
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsPublishingBatch(false);
    setBatchProgress(null);
    setBulkPublishedSuccess(publishedSummary);
    triggerToast(`Successfully published all ${publishedSummary.length} batch videos!`);
  };

  // ----------------------------------------------------
  // Single Video / Photo Form Submission
  // ----------------------------------------------------
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl || !authorName) return;

    let isoDate = new Date().toISOString();
    if (publishedDate) {
      isoDate = new Date(publishedDate).toISOString();
    }

    const generatedId = `videocites-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const finalId = slug.trim() ? slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") : generatedId;

    if (mediaType === "video") {
      let finalMediaUrl = mediaUrl;
      let finalThumbnail = thumbnailUrl || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80";

      // If user selected a local file from disk, upload to server storage so everyone can access
      if (pendingLocalFile) {
        setIsProcessingUpload(true);
        setUploadProgress(0);
        triggerToast("Đang tải video lên máy chủ và lưu vào cơ sở dữ liệu...");
        try {
          const uploadedUrl = await uploadVideoToServer(pendingLocalFile, (percent) => {
            setUploadProgress(percent);
          });
          finalMediaUrl = uploadedUrl;
        } catch (storageErr: any) {
          console.error("Server upload error:", storageErr);
          triggerToast(`Lỗi tải video lên máy chủ: ${storageErr.message || "Thử lại"}`);
          setIsProcessingUpload(false);
          return;
        } finally {
          setIsProcessingUpload(false);
        }
      }

      // If thumbnail is a base64 Data URL, upload it to server
      if (finalThumbnail.startsWith("data:")) {
        try {
          finalThumbnail = await uploadThumbnailDataUrlToServer(finalThumbnail);
        } catch {}
      }

      if (activeTab === "add") {
        const newVideo: Video = {
          id: finalId,
          title: title,
          videoUrl: finalMediaUrl,
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
        await onAddVideo(newVideo);
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
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">Add, batch-publish or edit media streams in the platform repository</p>
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
                if (activeTab === "bulk") setActiveTab("add");
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

        {/* CMS Mode Switcher (Single Publish / Bulk Upload / Edit) */}
        <div className="flex justify-center">
          <div className="bg-slate-200/50 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-slate-300 dark:border-white/5 flex flex-wrap gap-1 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("add")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "add"
                  ? "bg-white dark:bg-white text-slate-900 dark:text-black shadow-lg shadow-black/5 font-black"
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Single Publish
            </button>

            {mediaType === "video" && (
              <button
                onClick={() => setActiveTab("bulk")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-2 relative ${
                  activeTab === "bulk"
                    ? "bg-blue-500 text-neutral-950 shadow-lg shadow-blue-500/20 font-black"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bulk Video Upload (5-10)</span>
                <span className="text-[9px] bg-neutral-950/20 dark:bg-white/20 px-1.5 py-0.2 rounded font-mono font-bold">
                  Batch
                </span>
              </button>
            )}

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

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: BULK VIDEO UPLOAD (AUTOMATED BATCH FEATURE)                  */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "bulk" && mediaType === "video" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            
            {/* Batch publishing in progress bar */}
            {isPublishingBatch && batchProgress && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-3xl space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>PUBLISHING BATCH: Video {batchProgress.current} of {batchProgress.total}</span>
                  </div>
                  <span className="text-slate-700 dark:text-white">
                    {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-neutral-300 truncate">
                  Now seeding: <span className="font-semibold text-slate-900 dark:text-white">"{batchProgress.title}"</span>
                </p>
              </motion.div>
            )}

            {/* Bulk Published Success Banner */}
            {bulkPublishedSuccess && bulkPublishedSuccess.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-r from-emerald-500/15 to-blue-500/15 border border-emerald-500/30 rounded-3xl space-y-4"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">
                        Batch Successfully Published! ({bulkPublishedSuccess.length} Videos Live)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        All videos have been saved to Firestore with randomized views, likes, and comment threads.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.videocites.com.au";
                      const text = bulkPublishedSuccess.map(v => `${v.title}: ${origin}/watch?v=${v.id}`).join("\n");
                      navigator.clipboard.writeText(text);
                      triggerToast("Copied all video links to clipboard!");
                    }}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Links</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                  {bulkPublishedSuccess.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{v.title}</p>
                        <code className="text-[10px] text-blue-500 dark:text-blue-400 font-mono truncate block">
                          /watch?v={v.id}
                        </code>
                      </div>
                      <a
                        href={`/watch?v=${v.id}`}
                        className="px-3 py-1.5 bg-blue-500 text-neutral-950 font-bold text-[10px] rounded-lg flex items-center gap-1 shrink-0 hover:bg-blue-600 transition-colors"
                      >
                        Watch <Eye className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <form onSubmit={handlePublishBulkBatch} className="space-y-8">
              
              {/* SECTION 1: GLOBAL SHARED SETTINGS */}
              <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-black">
                      STEP 1: BATCH CONFIGURATION
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-500" />
                      Global Shared Settings (Applies to all {bulkVideos.length} videos)
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
                    {bulkVideos.length} Videos in Batch
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* AUTHOR */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                      Shared Author Name
                    </label>
                    <input
                      type="text"
                      value={sharedAuthorName}
                      onChange={(e) => setSharedAuthorName(e.target.value)}
                      placeholder="e.g., Admin, Videocites Studio"
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* AUTHOR AVATAR */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex items-center justify-between">
                      <span>Shared Author Avatar</span>
                      {sharedAuthorAvatar && (
                        <img
                          src={sharedAuthorAvatar}
                          alt="Avatar preview"
                          className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-white/10"
                        />
                      )}
                    </label>
                    <input
                      type="text"
                      value={sharedAuthorAvatar}
                      onChange={(e) => setSharedAuthorAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                      required
                    />
                  </div>

                  {/* CATEGORY (Single dropdown selector for the whole batch) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                      Shared Category (All Videos)
                    </label>
                    <div className="relative">
                      <select
                        value={sharedCategory}
                        onChange={(e) => setSharedCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none font-medium"
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
                </div>

                {/* SHARED DESCRIPTION */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                    <span>Shared Description (Markdown applied to all batch videos)</span>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">Markdown Supported</span>
                  </label>
                  <textarea
                    value={sharedDescription}
                    onChange={(e) => setSharedDescription(e.target.value)}
                    rows={4}
                    placeholder="Enter shared description applied to all uploaded videos in this batch..."
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
                    required
                  />
                </div>

                {/* SHARED PUBLISH DATE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                      Batch Publish Date
                    </label>
                    <input
                      type="date"
                      value={sharedPublishDate}
                      onChange={(e) => setSharedPublishDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                      💡 Every video created in this batch will inherit the shared author profile, category, and markdown description.
                    </p>
                  </div>
                </div>

              </div>

              {/* SECTION 2: RANDOM ENGAGEMENT METRICS GENERATOR */}
              <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/25 rounded-3xl p-6 md:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-black flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      SMART AUTOMATION
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Dices className="w-5 h-5 text-blue-500" />
                      Random Engagement Metrics Generator
                    </h3>
                  </div>

                  {/* Toggle Switch */}
                  <label className="flex items-center gap-3 cursor-pointer select-none bg-white dark:bg-black/40 border border-blue-500/30 px-4 py-2 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Generate Random Initial Stats
                    </span>
                    <div 
                      onClick={() => setGenerateRandomStats(!generateRandomStats)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        generateRandomStats ? "bg-blue-500" : "bg-slate-300 dark:bg-neutral-700"
                      }`}
                    >
                      <div 
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          generateRandomStats ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  When enabled, Videocites automatically calculates realistic random starting numbers for each of the {bulkVideos.length} videos upon publishing:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white/70 dark:bg-zinc-900/60 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold block">Views Range</span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">500 – 50,000</span>
                    </div>
                  </div>

                  <div className="bg-white/70 dark:bg-zinc-900/60 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold block">Likes Range</span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">50 – 5,000</span>
                    </div>
                  </div>

                  <div className="bg-white/70 dark:bg-zinc-900/60 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold block">Comments Count</span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">5 – 300 threads</span>
                    </div>
                  </div>
                </div>

                {generateRandomStats && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleRerollAllStats}
                      className="px-4 py-2 bg-white dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-blue-500" />
                      <span>Reroll Random Stats for All Cards</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: MULTI-FILE QUICK IMPORT DROP ZONE */}
              <div className="border border-dashed border-slate-300 dark:border-white/10 hover:border-blue-500 rounded-3xl p-6 text-center bg-slate-50/50 dark:bg-zinc-900/20 flex flex-col items-center justify-center gap-3 transition-colors relative">
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => handleBulkFilesSelected(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Drag & drop 5 to 10 video files here to populate cards automatically
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Extracts titles and durations instantly for each video in the batch
                  </p>
                </div>
              </div>

              {/* SECTION 4: INDIVIDUAL VIDEO CARDS (Unique per video) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-black">
                      STEP 2: INDIVIDUAL VIDEO METADATA
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-blue-500" />
                      Individual Video Cards ({bulkVideos.length} of 10 max)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddBulkCard}
                      disabled={bulkVideos.length >= 10}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Video Card</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {bulkVideos.map((card, idx) => (
                    <motion.div
                      key={card.tempId}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-5 shadow-lg backdrop-blur-sm relative"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-black text-slate-800 dark:text-white">
                            {card.title ? card.title : `Video #${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {generateRandomStats && (
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                              <span>👁️ {card.views.toLocaleString()}</span>
                              <span>👍 {card.likes.toLocaleString()}</span>
                              <span>💬 {card.commentsCount}</span>
                              <button
                                type="button"
                                onClick={() => handleRerollSingleCardStats(card.tempId)}
                                className="ml-1 text-blue-500 hover:text-blue-600"
                                title="Reroll random numbers for this card"
                              >
                                <Dices className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {bulkVideos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBulkCard(card.tempId)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remove video card"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Content: Title, Video URL, Thumbnail URL */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* 1. VIDEO TITLE */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                            <span>Video Title #{idx + 1}</span>
                            <span className="text-[10px] text-blue-500 font-mono font-semibold">Required</span>
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateBulkCardField(card.tempId, "title", e.target.value)}
                            placeholder={`e.g. Masterclass Episode 0${idx + 1} - Cinematic Vision`}
                            className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                            required
                          />
                        </div>

                        {/* 2. VIDEO URL / FILE UPLOAD */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                            <span>Video URL / Embed / File</span>
                            <span className="text-[10px] text-blue-500 font-mono font-semibold">YouTube / Vimeo / MP4</span>
                          </label>
                          <input
                            type="text"
                            value={card.videoUrl}
                            onChange={async (e) => {
                              const val = e.target.value;
                              handleUpdateBulkCardField(card.tempId, "videoUrl", val);
                              if (val.trim()) {
                                const meta = await fetchAutoVideoMetadata(val);
                                if (meta.thumbnailUrl && !card.thumbnailUrl) {
                                  handleUpdateBulkCardField(card.tempId, "thumbnailUrl", meta.thumbnailUrl);
                                }
                                if (meta.durationFormatted) {
                                  handleUpdateBulkCardField(card.tempId, "duration", meta.durationFormatted);
                                }
                                if (meta.title && (!card.title || card.title === "New Video Item")) {
                                  handleUpdateBulkCardField(card.tempId, "title", meta.title);
                                }
                              }
                            }}
                            placeholder="YouTube, Vimeo, iframe embed code, or MP4 URL..."
                            className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                            required
                          />

                          <div className="flex gap-2 pt-1">
                            <label className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5 text-center">
                              <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUpdateBulkCardField(card.tempId, "videoUrl", URL.createObjectURL(file));
                                    handleUpdateBulkCardField(card.tempId, "file", file);
                                    if (!card.title) {
                                      handleUpdateBulkCardField(card.tempId, "title", file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
                                    }
                                    triggerToast(`Selected video file for card #${idx + 1}`);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>

                            <div className="relative flex-1">
                              <select
                                onChange={async (e) => {
                                  if (e.target.value) {
                                    const val = e.target.value;
                                    handleUpdateBulkCardField(card.tempId, "videoUrl", val);
                                    const meta = await fetchAutoVideoMetadata(val);
                                    if (meta.thumbnailUrl) {
                                      handleUpdateBulkCardField(card.tempId, "thumbnailUrl", meta.thumbnailUrl);
                                    }
                                    if (meta.durationFormatted) {
                                      handleUpdateBulkCardField(card.tempId, "duration", meta.durationFormatted);
                                    }
                                    triggerToast("Assigned sample video with auto duration!");
                                    e.target.value = "";
                                  }
                                }}
                                className="w-full py-1.5 pl-3 pr-6 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer border border-slate-200 dark:border-white/5 appearance-none text-center outline-none"
                              >
                                <option value="">Pick Preset</option>
                                {SAMPLE_VIDEOS.map((s) => (
                                  <option key={s.url} value={s.url}>{s.name}</option>
                                ))}
                              </select>
                              <div className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[8px]">
                                ▼
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. THUMBNAIL URL */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                            <span>Thumbnail URL</span>
                            <span className="text-[10px] text-slate-400 font-mono">Image Cover</span>
                          </label>
                          <input
                            type="text"
                            value={card.thumbnailUrl}
                            onChange={(e) => handleUpdateBulkCardField(card.tempId, "thumbnailUrl", e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                          />

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAutoFetchBulkThumbnail(card)}
                              className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                              <span>Auto Fetch</span>
                            </button>

                            <label className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5 text-center">
                              <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                              <span>Upload Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === "string") {
                                        handleUpdateBulkCardField(card.tempId, "thumbnailUrl", reader.result);
                                        triggerToast(`Uploaded thumbnail for card #${idx + 1}`);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* 4. DURATION & CUSTOM SLUG (Optional) */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={card.duration}
                              onChange={(e) => handleUpdateBulkCardField(card.tempId, "duration", e.target.value)}
                              placeholder="12:45"
                              className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono text-center"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                              Custom Slug
                            </label>
                            <input
                              type="text"
                              value={card.slug}
                              onChange={(e) => handleUpdateBulkCardField(card.tempId, "slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                              placeholder="auto-slug"
                              className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Thumbnail Preview Banner if available */}
                      {card.thumbnailUrl && (
                        <div className="relative aspect-[21/9] w-full max-h-32 rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-white/10">
                          <img
                            src={card.thumbnailUrl}
                            alt="Card thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                            {card.duration}
                          </span>
                          <span className="absolute top-2 left-2 bg-blue-500 text-neutral-950 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded">
                            {sharedCategory}
                          </span>
                        </div>
                      )}

                    </motion.div>
                  ))}
                </div>
              </div>

              {/* PUBLISH BATCH ACTION BUTTON */}
              <div className="pt-6 flex flex-col items-center justify-center gap-4">
                <button
                  type="submit"
                  disabled={isPublishingBatch}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-neutral-950 font-black text-sm tracking-wider uppercase py-4 px-12 rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl shadow-blue-500/25 active:scale-95 disabled:cursor-not-allowed"
                >
                  {isPublishingBatch ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Publishing Batch ({batchProgress?.current || 1}/{bulkVideos.length})...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-5 h-5" />
                      <span>Publish All {bulkVideos.length} Videos to Repository</span>
                      <ArrowUp className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 dark:text-neutral-400 text-center max-w-md">
                  All {bulkVideos.length} videos will be saved to Firestore simultaneously with their shared author, category, description and randomized engagement metrics.
                </p>
              </div>

            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2 & 3: SINGLE PUBLISH & EDIT EXISTING                           */}
        {/* ------------------------------------------------------------------ */}
        {activeTab !== "bulk" && (
          <div className="space-y-8">
            
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

            {/* Main Single Form Block */}
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
                      <span>{mediaType === "video" ? "Video URL / Embed / File" : "Photo/Image URL"}</span>
                      {mediaType === "video" && (
                        <span className="text-[10px] text-blue-500 font-mono font-semibold">YouTube / Vimeo / MP4</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setMediaUrl(val);
                        if (mediaType === "video" && val.trim()) {
                          try {
                            const meta = await fetchAutoVideoMetadata(val);
                            if (meta.thumbnailUrl && (!thumbnailUrl || thumbnailUrl.includes("unsplash.com/photo-1506318137071"))) {
                              setThumbnailUrl(meta.thumbnailUrl);
                            }
                            if (meta.durationFormatted) {
                              setDuration(meta.durationFormatted);
                              triggerToast(`Auto-detected duration: ${meta.durationFormatted}!`);
                            }
                            if (meta.title && (!title || title === "New Video Item")) {
                              setTitle(meta.title);
                            }
                          } catch (err) {
                            console.warn("Auto metadata error:", err);
                          }
                        }
                      }}
                      placeholder={mediaType === "video" ? "YouTube, Vimeo, iframe embed code, or MP4 URL..." : "https://"}
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                      required
                    />
                    
                    <div className="flex gap-2">
                      <label className="flex-1 py-1.5 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/20 text-center">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{pendingLocalFile ? `Đã chọn: ${pendingLocalFile.name.slice(0, 15)}...` : "Chọn File MP4 từ máy"}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPendingLocalFile(file);
                              const blobUrl = URL.createObjectURL(file);
                              setMediaUrl(blobUrl);
                              if (!title) {
                                setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
                              }
                              triggerToast(`Đang phân tích file "${file.name}"...`);
                              // Try to auto-capture video thumbnail frame
                              try {
                                const frame = await extractThumbnailFromVideoFile(file);
                                if (frame) {
                                  setThumbnailUrl(frame);
                                }
                              } catch {}
                              triggerToast(`Đã sẵn sàng tải file video "${file.name}"!`);
                            }
                          }}
                          className="hidden"
                        />
                      </label>

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
                        <span>Test Link</span>
                      </button>

                      {mediaType === "video" && (
                        <div className="relative flex-1">
                          <select
                            onChange={async (e) => {
                              if (e.target.value) {
                                const val = e.target.value;
                                setMediaUrl(val);
                                const meta = await fetchAutoVideoMetadata(val);
                                if (meta.thumbnailUrl) setThumbnailUrl(meta.thumbnailUrl);
                                if (meta.durationFormatted) setDuration(meta.durationFormatted);
                                triggerToast("Sample video selected with auto duration!");
                                e.target.value = "";
                              }
                            }}
                            className="w-full h-full py-1.5 pl-3 pr-8 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer border border-slate-200 dark:border-white/5 appearance-none text-center outline-none"
                          >
                            <option value="">Select Sample Video</option>
                            {SAMPLE_VIDEOS.map((s) => (
                              <option key={s.url} value={s.url}>{s.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400 text-[8px]">
                            ▼
                          </div>
                        </div>
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
                    placeholder={activeTab === "add" ? `Leave blank to auto-generate from title` : "Enter custom slug..."}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                  />
                </div>

                {/* ROW 2: Author Name, Category & Video Thumbnail URL */}
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
                        {CATEGORIES_LIST.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-neutral-400 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>

                  {mediaType === "video" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                        <span>Thumbnail URL</span>
                        {mediaUrl ? (
                          <button
                            type="button"
                            onClick={async () => {
                              const meta = await fetchAutoVideoMetadata(mediaUrl);
                              if (meta.thumbnailUrl) {
                                setThumbnailUrl(meta.thumbnailUrl);
                                triggerToast("Extracted video thumbnail cover!");
                              } else {
                                triggerToast("No thumbnail found for this URL.");
                              }
                            }}
                            className="text-[10px] text-blue-500 hover:text-blue-400 font-bold lowercase flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Auto Cover</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-blue-500 dark:text-blue-400 lowercase font-semibold">Auto / Upload</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://"
                        className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#181818] transition-all font-mono"
                        required
                      />
                      <label className="py-1 px-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/5 w-fit">
                        <UploadCloud className="w-3 h-3 text-blue-500" />
                        <span>Chọn ảnh bìa từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === "string") {
                                  setThumbnailUrl(reader.result);
                                  triggerToast("Đã tải ảnh bìa thành công!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
                        Dimensions
                      </label>
                      <div className="w-full py-3 px-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-center font-mono text-xs text-slate-500">
                        N/A (Scales responsively)
                      </div>
                    </div>
                  )}
                </div>

                {/* ROW 3: Date, Duration & Author Avatar */}
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
                      <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide flex justify-between items-center">
                        <span>Duration</span>
                        {mediaUrl && (
                          <button
                            type="button"
                            onClick={async () => {
                              triggerToast("Detecting video duration...");
                              const meta = await fetchAutoVideoMetadata(mediaUrl);
                              if (meta.durationFormatted) {
                                setDuration(meta.durationFormatted);
                                triggerToast(`Detected duration: ${meta.durationFormatted}`);
                              } else {
                                triggerToast("Could not detect duration automatically.");
                              }
                            }}
                            className="text-[10px] text-blue-500 hover:text-blue-400 font-bold lowercase flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Auto Detect</span>
                          </button>
                        )}
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
                        Layout Mode
                      </label>
                      <div className="w-full py-3 px-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-center font-mono text-xs text-slate-500">
                        Standard High-Res
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
                    rows={5}
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
                    disabled={isProcessingUpload}
                    className="bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 disabled:opacity-50 font-extrabold text-xs tracking-wider uppercase py-3.5 px-10 rounded-full flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg active:scale-95"
                  >
                    {isProcessingUpload ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Đang tải lên ({uploadProgress}%)...</span>
                      </>
                    ) : activeTab === "add" ? (
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

          </div>
        )}

        {/* Database Storage & Capacity Overview */}
        <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Cloud Firestore Storage & Quota
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                  ai-studio-remixvnaoh-e1d592b3-22c2-40d6-bad9-5154f161bdc0
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Optimal Status (99.5% Free)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Dung lượng đã dùng</span>
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">~5.02 MB</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Dung lượng còn lại</span>
              <span className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">~1,018.98 MB</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Tổng hạn mức Free</span>
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">1,024 MB (1 GB)</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Tổng Documents</span>
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">{videos.length + photos.length + 95} docs</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-neutral-400">
              <span>Mức sử dụng bộ nhớ: ~0.49%</span>
              <span>1,024 MB tối đa (Spark Free Tier)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                style={{ width: "0.49%" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400 bg-blue-500/5 p-2.5 rounded-xl border border-blue-500/10">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Bộ nhớ Firestore còn tới <strong>99.51%</strong>. Hạn mức đọc/ghi hàng ngày: <strong>50.000 reads/ngày</strong> và <strong>20.000 writes/ngày</strong>.
            </span>
          </div>
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
