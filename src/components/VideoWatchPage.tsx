import React, { useState } from "react";
import { Video } from "../types";
import { 
  ThumbsUp, ThumbsDown, Share2, Award, ArrowUpRight, 
  CheckCircle, ChevronDown, ChevronUp, Bell, MessageSquare
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import MarkdownView from "./MarkdownView";
import { motion, AnimatePresence } from "motion/react";

interface VideoWatchPageProps {
  video: Video;
  suggestedVideos: Video[];
  comments: any[];
  onSelectVideo: (id: string) => void;
  onLikeVideo: (id: string) => void;
  onDislikeVideo: (id: string) => void;
}

export default function VideoWatchPage({
  video,
  suggestedVideos,
  comments,
  onSelectVideo,
  onLikeVideo,
  onDislikeVideo
}: VideoWatchPageProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [sharedText, setSharedText] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [localComments, setLocalComments] = useState<any[]>(comments || []);

  // Sync comments if video changes
  React.useEffect(() => {
    setLocalComments(comments || []);
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

    const newComment = {
      id: `c-${Date.now()}`,
      authorName: "Guest User (mnzfrankie)",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      content: userComment,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setLocalComments([newComment, ...localComments]);
    setUserComment("");
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* LEFT COLUMN: Video Player + Meta Info (70% width) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Custom Video Player Container */}
            <VideoPlayer 
              src={video.videoUrl} 
              poster={video.thumbnailUrl} 
              viewerId="mnzfrankie@gmail.com" 
            />

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
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {video.author.name}
                    </span>
                    {video.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-neutral-950" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
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
                    onClick={() => onLikeVideo(video.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer border-r border-slate-200 dark:border-white/10"
                  >
                    <ThumbsUp className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                    <span>{formatNumber(totalLikes)}</span>
                  </button>

                  {/* Dislike Button */}
                  <button 
                    onClick={() => onDislikeVideo(video.id)}
                    className="px-3 py-2 text-xs text-slate-500 dark:text-neutral-400 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Dislike this video"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span className="sr-only">Dislikes</span>
                  </button>
                </div>

                {/* Share Button with copy feedback */}
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-neutral-300 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{sharedText ? "Copied!" : "Share"}</span>
                </button>
              </div>

            </div>

            {/* 4. Description box (Standard high fidelity rounded box) */}
            <div className="bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl relative overflow-hidden transition-colors duration-300">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2 font-mono">
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white font-mono">
                  Copyrighted Comments ({localComments.length})
                </h3>
              </div>

              {/* Comment Input form */}
              <form onSubmit={handlePostComment} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400 font-black font-mono text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                  U
                </div>
                <div className="grow space-y-2">
                  <input
                    type="text"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Add a public comment as mnzfrankie..."
                    className="w-full bg-slate-550/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-sans bg-slate-50"
                  />
                  {userComment.trim() && (
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white dark:text-[#050505] font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-widest"
                    >
                      POST COMMENT
                    </button>
                  )}
                </div>
              </form>

              {/* Render local comments list */}
              <div className="space-y-4 pt-2">
                <AnimatePresence initial={false}>
                  {localComments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 text-xs"
                    >
                      <img 
                        src={comment.authorAvatar} 
                        alt={comment.authorName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/10"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-neutral-200">{comment.authorName}</span>
                          <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-neutral-300 leading-relaxed font-sans">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Suggested Videos "Up Next" (30% width) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold tracking-widest font-mono text-slate-500 dark:text-neutral-400 uppercase">Recommended Videos</span>
              <span className="text-[10px] font-mono text-blue-500 flex items-center gap-1 font-bold">
                <span>Auto-play: ON</span>
              </span>
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
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 truncate mt-1">
                        {item.author.name}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-neutral-500 font-mono mt-0.5">
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
