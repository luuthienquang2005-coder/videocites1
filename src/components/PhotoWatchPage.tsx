import React, { useState, useEffect, useMemo } from "react";
import { Photo } from "../types";
import { 
  ThumbsUp, ThumbsDown, Share2, Award, ArrowUpRight, 
  CheckCircle, ChevronDown, ChevronUp, MessageSquare,
  Flame, Clock, Download, ZoomIn, Eye, Sparkles
} from "lucide-react";
import MarkdownView from "./MarkdownView";
import { motion, AnimatePresence } from "motion/react";
import { safeStorage } from "../utils/safeStorage";

const getAvatarForName = (name: string) => {
  const avatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
  ];
  if (!name) return avatars[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return avatars[sum % avatars.length];
};

interface PhotoWatchPageProps {
  photo: Photo;
  suggestedPhotos: Photo[];
  comments: any[];
  onSelectPhoto: (id: string) => void;
  onLikePhoto: (id: string) => void;
  onDislikePhoto: (id: string) => void;
  onAddComment?: (photoId: string, comment: any) => void;
  onUpdateComments?: (photoId: string, comments: any[]) => void;
}

export default function PhotoWatchPage({
  photo,
  suggestedPhotos,
  comments,
  onSelectPhoto,
  onLikePhoto,
  onDislikePhoto,
  onAddComment,
  onUpdateComments
}: PhotoWatchPageProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [sharedText, setSharedText] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [localComments, setLocalComments] = useState<any[]>(comments || []);
  const [isZoomed, setIsZoomed] = useState(false);

  const [commenterName] = useState(() => {
    const saved = safeStorage.getItem("videocites-commenter-name");
    if (saved) return saved;
    const defaultNames = [
      "Liam Carter", "Olivia Johnson", "Ethan Davis", "Sophia Taylor", 
      "Mason Miller", "Emma Watson", "Alex Mercer", "Chloe Thompson"
    ];
    const chosen = defaultNames[Math.floor(Math.random() * defaultNames.length)];
    safeStorage.setItem("videocites-commenter-name", chosen);
    return chosen;
  });

  const [commentSort, setCommentSort] = useState<"top" | "newest">("top");

  // Dynamic sorting computed property
  const sortedComments = useMemo(() => {
    const list = [...localComments];
    if (commentSort === "top") {
      return list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [localComments, commentSort]);

  // Track liked and disliked photos locally
  const [likedPhotos, setLikedPhotos] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem("videocites-liked-photos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dislikedPhotos, setDislikedPhotos] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem("videocites-disliked-photos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const hasLiked = likedPhotos.includes(photo.id);
  const hasDisliked = dislikedPhotos.includes(photo.id);

  const handleLike = () => {
    if (hasLiked) return;
    onLikePhoto(photo.id);
    const updated = [...likedPhotos, photo.id];
    setLikedPhotos(updated);
    safeStorage.setItem("videocites-liked-photos", JSON.stringify(updated));
    if (hasDisliked) {
      const updatedDisliked = dislikedPhotos.filter(id => id !== photo.id);
      setDislikedPhotos(updatedDisliked);
      safeStorage.setItem("videocites-disliked-photos", JSON.stringify(updatedDisliked));
    }
  };

  const handleDislike = () => {
    if (hasDisliked) return;
    onDislikePhoto(photo.id);
    const updated = [...dislikedPhotos, photo.id];
    setDislikedPhotos(updated);
    safeStorage.setItem("videocites-disliked-photos", JSON.stringify(updated));
    if (hasLiked) {
      const updatedLiked = likedPhotos.filter(id => id !== photo.id);
      setLikedPhotos(updatedLiked);
      safeStorage.setItem("videocites-liked-photos", JSON.stringify(updatedLiked));
    }
  };

  // Sync comments if photo changes
  useEffect(() => {
    setLocalComments(comments || []);
  }, [photo.id, comments]);

  // Handle Share copy link simulation
  const handleShare = () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(window.location.href);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (e) {
      console.warn("Clipboard share failed", e);
    }
    setSharedText(true);
    setTimeout(() => {
      setSharedText(false);
    }, 2500);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    const finalName = commenterName.trim() || "Anonymous Viewer";
    const avatar = getAvatarForName(finalName);
    const newComment = {
      id: `pc-${Date.now()}`,
      authorName: finalName,
      authorAvatar: avatar,
      content: userComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    if (onAddComment) {
      onAddComment(photo.id, newComment);
    } else {
      setLocalComments([newComment, ...localComments]);
    }
    setUserComment("");
  };

  const handleLikeComment = (commentId: string) => {
    const updated = localComments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: (c.likes || 0) + 1 };
      }
      return c;
    });
    setLocalComments(updated);
    if (onUpdateComments) {
      onUpdateComments(photo.id, updated);
    }
  };

  const handleDislikeComment = (commentId: string) => {
    const updated = localComments.map(c => {
      if (c.id === commentId) {
        return { ...c, dislikes: (c.dislikes || 0) + 1 };
      }
      return c;
    });
    setLocalComments(updated);
    if (onUpdateComments) {
      onUpdateComments(photo.id, updated);
    }
  };

  // Format statistics
  const totalViews = photo.baseViews + photo.realViews;
  const totalLikes = photo.baseLikes + photo.realLikes;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getDisplayDate = () => {
    const rawDate = photo.backdatedDate || photo.publishedAt;
    const dateObj = new Date(rawDate);
    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="w-full font-sans min-h-screen pb-20 transition-colors duration-300" id="photo-watch-page">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        
        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* LEFT COLUMN: Photo Viewer + Meta Info */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Cinematic Image Stage */}
            <div 
              className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-slate-200 dark:border-white/10 group select-none flex items-center justify-center p-2 min-h-[300px] md:min-h-[450px]"
              onContextMenu={(e) => e.preventDefault()}
            >
              
              {/* Copy Protected Overlay Watermark */}
              <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur px-2.5 py-1 rounded-md text-[9px] font-mono font-black text-blue-400 tracking-wider flex items-center gap-1.5 border border-white/5">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>DRM SECURE FRAME</span>
              </div>

              {/* Central high resolution image */}
              <img 
                src={photo.imageUrl} 
                alt={photo.title}
                className={`max-w-full max-h-[600px] object-contain rounded-lg transition-transform duration-500 shadow-2xl ${
                  isZoomed ? "scale-125 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                onContextMenu={(e) => e.preventDefault()}
                referrerPolicy="no-referrer"
              />

              {/* Technical control anchors */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-2 rounded-xl bg-black/80 backdrop-blur text-white hover:bg-blue-500 hover:text-neutral-950 transition-all cursor-pointer"
                  title="Toggle Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photo Title */}
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-snug text-slate-900 dark:text-white mt-2" id="photo-title-header">
              {photo.title}
            </h1>

            {/* Action bar + Author profile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              
              {/* Creator Card */}
              <div className="flex items-center gap-3">
                <img 
                  src={photo.author.avatar} 
                  alt={photo.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white leading-tight">
                      {photo.author.name}
                    </span>
                    {photo.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-neutral-950 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-neutral-400">
                    {formatNumber(photo.author.subscribers)} subscribers
                  </p>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`ml-3 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    isSubscribed 
                      ? "bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10" 
                      : "bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold hover:bg-slate-800 dark:hover:bg-neutral-200"
                  }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              {/* Interaction widgets */}
              <div className="flex items-center gap-2.5 self-end sm:self-center">
                
                {/* Like/Dislike Joint */}
                <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full overflow-hidden">
                  
                  {/* Like Button */}
                  <button 
                    onClick={handleLike}
                    disabled={hasLiked}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer border-r border-slate-200 dark:border-white/10 ${
                      hasLiked ? "text-blue-500 bg-blue-500/5 dark:bg-blue-500/10" : "text-slate-800 dark:text-neutral-300"
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-blue-500 text-blue-500" : "text-blue-500 fill-blue-500/10"}`} />
                    <span>{formatNumber(totalLikes)}</span>
                  </button>

                  {/* Dislike Button */}
                  <button 
                    onClick={handleDislike}
                    disabled={hasDisliked}
                    className={`px-3 py-2 text-xs hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                      hasDisliked ? "text-red-500 bg-red-500/5 dark:bg-red-500/10" : "text-slate-700 dark:text-neutral-400"
                    }`}
                    title="Dislike this photo"
                  >
                    <ThumbsDown className={`w-4 h-4 ${hasDisliked ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                </div>

                {/* Share Button */}
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10 px-4 py-2 rounded-full text-xs font-semibold text-slate-800 dark:text-neutral-300 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{sharedText ? "Copied!" : "Share"}</span>
                </button>
              </div>

            </div>

            {/* Description box */}
            <div className="bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl relative overflow-hidden transition-colors duration-300">
              <div className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white mb-2 font-sans">
                <span>{formatNumber(totalViews)} views</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-neutral-600" />
                <span>{getDisplayDate()}</span>
                {photo.backdatedDate && (
                  <span className="text-[10px] bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-medium">
                    Post-release Backdated
                  </span>
                )}
              </div>

              {/* Markdown Content (collapsible) */}
              <div className={`transition-all duration-300 overflow-hidden ${
                descriptionExpanded ? "max-h-[1000px]" : "max-h-24"
              }`}>
                <MarkdownView content={photo.description} />
              </div>

              {/* Expand Toggle Button */}
              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="mt-3 text-xs font-bold font-mono tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer flex items-center gap-1 border border-blue-500/20 px-3 py-1.5 rounded-lg w-fit transition-all hover:bg-blue-500/5"
              >
                <span>{descriptionExpanded ? "SHOW LESS" : "SHOW MORE"}</span>
                {descriptionExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Real-Time Comments Box */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white font-mono">
                    Comments ({localComments.length})
                  </h3>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                  <button
                    onClick={() => setCommentSort("top")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      commentSort === "top"
                        ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Top</span>
                  </button>
                  <button
                    onClick={() => setCommentSort("newest")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      commentSort === "newest"
                        ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Newest</span>
                  </button>
                </div>
              </div>

              {/* Post comment form */}
              <form onSubmit={handlePostComment} className="flex gap-3">
                <img 
                  src={getAvatarForName(commenterName)} 
                  alt={commenterName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="grow space-y-2">
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Write a public secure comment..."
                    className="w-full min-h-[75px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs md:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-600 dark:text-neutral-500 font-bold">
                      Commenting as: <span className="text-blue-500">{commenterName}</span>
                    </span>
                    <button
                      type="submit"
                      disabled={!userComment.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-500 disabled:opacity-50 text-neutral-950 font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-blue-500/10 cursor-pointer"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </form>

              {/* Render comments list */}
              <div className="space-y-6 pt-2">
                <AnimatePresence initial={false}>
                  {sortedComments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group border-b border-slate-100 dark:border-white/5 pb-4 last:border-0"
                    >
                      <div className="flex gap-3.5 text-xs">
                        <img 
                          src={comment.authorAvatar} 
                          alt={comment.authorName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="grow space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-neutral-200">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] text-slate-600 dark:text-neutral-500 font-mono">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-neutral-300 leading-relaxed font-sans text-sm">
                            {comment.content}
                          </p>

                          {/* Comment action tools */}
                          <div className="flex items-center gap-4 pt-1">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-neutral-400 hover:text-blue-500 transition-colors cursor-pointer"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span className="font-mono">{comment.likes || 0}</span>
                            </button>

                            <button
                              onClick={() => handleDislikeComment(comment.id)}
                              className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span className="font-mono">{comment.dislikes || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Recommended Photos Sidebar */}
          <div className="lg:col-span-3 space-y-4" id="photo-sidebar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold tracking-widest font-mono text-slate-700 dark:text-neutral-400 uppercase">Recommended Photos</span>
            </div>

            {/* Recommended Photo List */}
            <div className="space-y-3">
              {suggestedPhotos.map((item) => {
                const itemTotalViews = item.baseViews + item.realViews;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.015 }}
                    onClick={() => onSelectPhoto(item.id)}
                    className="flex gap-2.5 p-1.5 rounded-xl bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 border border-slate-200/40 dark:border-transparent hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all cursor-pointer group"
                    id={`suggested-photo-${item.id}`}
                  >
                    {/* Thumbnail left */}
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 border border-slate-200/60 dark:border-white/5">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Metadata right */}
                    <div className="grow min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-700 dark:text-neutral-400 mt-1">
                        {item.author.name}
                      </p>
                      <p className="text-[11px] text-slate-700 dark:text-neutral-400 mt-0.5">
                        {formatNumber(itemTotalViews)} views
                      </p>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
