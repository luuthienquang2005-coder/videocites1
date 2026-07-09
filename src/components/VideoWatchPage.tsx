import React, { useState } from "react";
import { Video } from "../types";
import { 
  ThumbsUp, ThumbsDown, Share2, Award, ArrowUpRight, 
  CheckCircle, ChevronDown, ChevronUp, Bell, MessageSquare,
  MessageCircle, CornerDownRight, Send, Flame, Clock, Sparkles
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import MarkdownView from "./MarkdownView";
import { motion, AnimatePresence } from "motion/react";
import { safeStorage } from "../utils/safeStorage";
import { sanitizeAndTranslateComment } from "../utils/commentGenerator";

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

interface VideoWatchPageProps {
  video: Video;
  suggestedVideos: Video[];
  comments: any[];
  onSelectVideo: (id: string) => void;
  onLikeVideo: (id: string) => void;
  onDislikeVideo: (id: string) => void;
  onAddComment?: (videoId: string, comment: any) => void;
  onUpdateComments?: (videoId: string, comments: any[]) => void;
}

export default function VideoWatchPage({
  video,
  suggestedVideos,
  comments,
  onSelectVideo,
  onLikeVideo,
  onDislikeVideo,
  onAddComment,
  onUpdateComments
}: VideoWatchPageProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [sharedText, setSharedText] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [localComments, setLocalComments] = useState<any[]>(comments || []);

  const [commenterName, setCommenterName] = useState(() => {
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
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Dynamic sorting computed property
  const sortedComments = React.useMemo(() => {
    const list = [...localComments];
    if (commentSort === "top") {
      return list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [localComments, commentSort]);

  // Track liked and disliked videos locally to prevent duplicates and show active state
  const [likedVideos, setLikedVideos] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem("videocites-liked-videos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dislikedVideos, setDislikedVideos] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem("videocites-disliked-videos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const hasLiked = likedVideos.includes(video.id);
  const hasDisliked = dislikedVideos.includes(video.id);

  const handleLike = () => {
    if (hasLiked) return;
    onLikeVideo(video.id);
    const updated = [...likedVideos, video.id];
    setLikedVideos(updated);
    safeStorage.setItem("videocites-liked-videos", JSON.stringify(updated));
    if (hasDisliked) {
      const updatedDisliked = dislikedVideos.filter(id => id !== video.id);
      setDislikedVideos(updatedDisliked);
      safeStorage.setItem("videocites-disliked-videos", JSON.stringify(updatedDisliked));
    }
  };

  const handleDislike = () => {
    if (hasDisliked) return;
    onDislikeVideo(video.id);
    const updated = [...dislikedVideos, video.id];
    setDislikedVideos(updated);
    safeStorage.setItem("videocites-disliked-videos", JSON.stringify(updated));
    if (hasLiked) {
      const updatedLiked = likedVideos.filter(id => id !== video.id);
      setLikedVideos(updatedLiked);
      safeStorage.setItem("videocites-liked-videos", JSON.stringify(updatedLiked));
    }
  };

  // Theater Mode state
  const [isTheaterMode, setIsTheaterMode] = useState(() => {
    try {
      const saved = localStorage.getItem("videocites-theater-mode");
      return saved === "true";
    } catch {
      return false;
    }
  });

  // Autoplay next state
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem("videocites-autoplay");
      return saved ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [countdown, setCountdown] = useState<number | null>(null);

  const toggleTheaterMode = () => {
    const nextVal = !isTheaterMode;
    setIsTheaterMode(nextVal);
    try {
      localStorage.setItem("videocites-theater-mode", String(nextVal));
    } catch {}
  };

  // Find next video
  const nextVideo = suggestedVideos && suggestedVideos.length > 0 ? suggestedVideos[0] : null;

  const handleVideoEnded = () => {
    if (isAutoplayEnabled && nextVideo) {
      setCountdown(5);
    }
  };

  // Autoplay countdown timer
  React.useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      if (nextVideo) {
        onSelectVideo(nextVideo.id);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, nextVideo, onSelectVideo]);

  const cancelAutoplay = () => {
    setCountdown(null);
  };

  const playNextImmediately = () => {
    setCountdown(null);
    if (nextVideo) {
      onSelectVideo(nextVideo.id);
    }
  };

  // Reset autoplay timer when video changes
  React.useEffect(() => {
    setCountdown(null);
  }, [video.id]);

  // Sync comments if video changes
  React.useEffect(() => {
    const rawList = comments || [];
    const translatedList = rawList.map(c => sanitizeAndTranslateComment(c));
    setLocalComments(translatedList);
  }, [video.id, comments]);

  // Handle Share copy link simulation
  const handleShare = () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(window.location.href);
      } else {
        // Fallback for sandboxed iframes without clipboard access
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
      id: `c-${Date.now()}`,
      authorName: finalName,
      authorAvatar: avatar,
      content: userComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    if (onAddComment) {
      onAddComment(video.id, newComment);
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
      onUpdateComments(video.id, updated);
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
      onUpdateComments(video.id, updated);
    }
  };

  const handlePostReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const finalName = commenterName.trim() || "Anonymous Viewer";
    const avatar = getAvatarForName(finalName);
    const newReply = {
      id: `r-${Date.now()}`,
      authorName: finalName,
      authorAvatar: avatar,
      content: replyText,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0
    };

    const updated = localComments.map(c => {
      if (c.id === commentId) {
        const replies = c.replies || [];
        return { ...c, replies: [...replies, newReply] };
      }
      return c;
    });

    setLocalComments(updated);
    if (onUpdateComments) {
      onUpdateComments(video.id, updated);
    }
    setReplyText("");
    setReplyingToCommentId(null);
    setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
  };

  // Format statistics
  const totalViews = video.baseViews + video.realViews;
  const totalLikes = video.baseLikes + video.realLikes;
  const totalDislikes = video.baseDislikes + video.realDislikes;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Date formatter (handles original or backdate override)
  const getDisplayDate = () => {
    const rawDate = video.backdatedDate || video.publishedAt;
    const dateObj = new Date(rawDate);
    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="w-full font-sans min-h-screen pb-20 transition-colors duration-300">
      
      {/* Theater Mode Full Width Player Container */}
      {isTheaterMode && (
        <div className="w-full bg-slate-900/5 dark:bg-black/85 border-b border-slate-200 dark:border-white/5 transition-all mb-6">
          <div className="max-w-7xl mx-auto px-0 md:px-6 py-0 md:py-4">
            <div className="relative overflow-hidden md:rounded-2xl shadow-2xl border border-slate-200/5 dark:border-white/5">
              <VideoPlayer 
                src={video.videoUrl} 
                poster={video.thumbnailUrl} 
                viewerId="mnzfrankie@gmail.com" 
                onEnded={handleVideoEnded}
                isTheaterMode={isTheaterMode}
                onToggleTheater={toggleTheaterMode}
              />
              
              {/* Autoplay Countdown Overlay */}
              {countdown !== null && nextVideo && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white p-6 transition-all">
                  <div className="max-w-md w-full space-y-6 text-center">
                    <p className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">Up Next</p>
                    
                    <div className="flex gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-left items-center">
                      <img 
                        src={nextVideo.thumbnailUrl} 
                        alt={nextVideo.title}
                        className="w-24 aspect-video rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">{nextVideo.title}</h4>
                        <p className="text-xs text-neutral-400 truncate mt-1">{nextVideo.author.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm md:text-base font-black tracking-tight">Autoplay in {countdown} seconds...</h3>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                          style={{ width: `${(countdown / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={cancelAutoplay}
                        className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                      >
                        CANCEL
                      </button>
                      <button 
                        onClick={playNextImmediately}
                        className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-neutral-950 text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                      >
                        PLAY NOW
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        
        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* LEFT COLUMN: Video Player + Meta Info (70% width) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Standard Player (only when NOT in theater mode) */}
            {!isTheaterMode && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
                <VideoPlayer 
                  src={video.videoUrl} 
                  poster={video.thumbnailUrl} 
                  viewerId="mnzfrankie@gmail.com" 
                  onEnded={handleVideoEnded}
                  isTheaterMode={isTheaterMode}
                  onToggleTheater={toggleTheaterMode}
                />
                
                {/* Autoplay Countdown Overlay */}
                {countdown !== null && nextVideo && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white p-6 transition-all">
                    <div className="max-w-md w-full space-y-6 text-center">
                      <p className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">Up Next</p>
                      
                      <div className="flex gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-left items-center">
                        <img 
                          src={nextVideo.thumbnailUrl} 
                          alt={nextVideo.title}
                          className="w-24 aspect-video rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">{nextVideo.title}</h4>
                          <p className="text-xs text-neutral-400 truncate mt-1">{nextVideo.author.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm md:text-base font-black tracking-tight">Autoplay in {countdown} seconds...</h3>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(countdown / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={cancelAutoplay}
                          className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                        >
                          CANCEL
                        </button>
                        <button 
                          onClick={playNextImmediately}
                          className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-neutral-950 text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                        >
                          PLAY NOW
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Video Title */}
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-snug text-slate-900 dark:text-white mt-2">
              {video.title}
            </h1>

            {/* 3. Action bar + Author profile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              
              {/* Creator Card */}
              <div className="flex items-center gap-3">
                <img 
                  src={video.author.avatar} 
                  alt={video.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-white/10"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white leading-tight">
                      {video.author.name}
                    </span>
                    {video.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-neutral-950 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-neutral-400">
                    {formatNumber(video.author.subscribers)} subscribers
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
                    title="Dislike this video"
                  >
                    <ThumbsDown className={`w-4 h-4 ${hasDisliked ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="sr-only">Dislikes</span>
                  </button>
                </div>

                {/* Share Button with copy feedback */}
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10 px-4 py-2 rounded-full text-xs font-semibold text-slate-800 dark:text-neutral-300 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{sharedText ? "Copied!" : "Share"}</span>
                </button>
              </div>

            </div>

            {/* 4. Description box (Standard high fidelity rounded box) */}
            <div className="bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl relative overflow-hidden transition-colors duration-300">
              <div className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white mb-2 font-sans">
                <span>{formatNumber(totalViews)} views</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-neutral-600" />
                <span>{getDisplayDate()}</span>
                {video.backdatedDate && (
                  <span className="text-[10px] bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-medium">
                    Post-release Backdated
                  </span>
                )}
              </div>

              {/* Markdown Content (collapsible) */}
              <div className={`transition-all duration-300 overflow-hidden ${
                descriptionExpanded ? "max-h-[1000px]" : "max-h-24"
              }`}>
                <MarkdownView content={video.description} />
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

            {/* 5. Custom Real-Time Live Comments Box */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white font-mono">
                    Comments ({localComments.length})
                  </h3>
                </div>

                {/* Comment Sorting Selector */}
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

              {/* Render local comments list */}
              <div className="space-y-6 pt-2">
                <AnimatePresence initial={false}>
                  {sortedComments.map((comment) => {
                    const isExpanded = expandedReplies[comment.id];
                    const replyCount = comment.replies?.length || 0;

                    return (
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
                              {/* Like Button */}
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-neutral-400 hover:text-blue-500 transition-colors cursor-pointer"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span className="font-mono">{comment.likes || 0}</span>
                              </button>

                              {/* Dislike Button */}
                              <button
                                onClick={() => handleDislikeComment(comment.id)}
                                className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span className="font-mono">{comment.dislikes || 0}</span>
                              </button>
                            </div>

                            {/* Collapsible Replies List */}
                            {replyCount > 0 && (
                              <div className="mt-3 space-y-2">
                                <button
                                  onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: !isExpanded }))}
                                  className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  <CornerDownRight className="w-3.5 h-3.5" />
                                  <span>
                                    {isExpanded ? `Hide ${replyCount} replies` : `Show ${replyCount} replies`}
                                  </span>
                                </button>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-white/10 overflow-hidden pt-1"
                                    >
                                      {comment.replies?.map((reply: any) => (
                                        <div key={reply.id} className="flex gap-2.5 text-xs">
                                          <img
                                            src={reply.authorAvatar}
                                            alt={reply.authorName}
                                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-white/10"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-bold text-slate-800 dark:text-neutral-200">
                                                {reply.authorName}
                                              </span>
                                              <span className="text-[9px] text-slate-600 dark:text-neutral-500">
                                                {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric"
                                                })}
                                              </span>
                                            </div>
                                            <p className="text-slate-800 dark:text-neutral-300 mt-0.5 leading-relaxed font-sans text-xs">
                                              {reply.content}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Suggested Videos "Up Next" (30% width) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold tracking-widest font-mono text-slate-700 dark:text-neutral-400 uppercase">Recommended Videos</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-700 dark:text-neutral-400 font-bold">Auto-play</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isAutoplayEnabled;
                    setIsAutoplayEnabled(nextVal);
                    try {
                      localStorage.setItem("videocites-autoplay", String(nextVal));
                    } catch {}
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAutoplayEnabled ? "bg-blue-500" : "bg-slate-300 dark:bg-neutral-800"
                  }`}
                  title={isAutoplayEnabled ? "Tắt tự động phát" : "Bật tự động phát"}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isAutoplayEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Video List */}
            <div className="space-y-3">
              {suggestedVideos.map((item) => {
                const itemTotalViews = item.baseViews + item.realViews;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.015 }}
                    onClick={() => onSelectVideo(item.id)}
                    className="flex gap-2.5 p-1.5 rounded-xl bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 border border-slate-200/40 dark:border-transparent hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all cursor-pointer group"
                  >
                    {/* Thumbnail left */}
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 border border-slate-200/60 dark:border-white/5">
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-white font-mono px-1 rounded">
                        {item.duration}
                      </span>
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
