import React, { useState, useMemo, useEffect, useRef } from "react";
import { Video } from "../types";
import { CATEGORIES_LIST, normalizeCategory } from "../utils/categories";
import { Play, Eye, ThumbsUp, Calendar, ArrowUpDown, Search, Film, CheckCircle, Sparkles, Tag, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideosPageProps {
  videos: Video[];
  onSelectVideo: (id: string) => void;
  isAdmin: boolean;
}

type SortOption = "latest" | "popular" | "likes" | "title";

const ITEMS_PER_PAGE = 6;

export default function VideosPage({ videos, onSelectVideo, isAdmin }: VideosPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const categories = ["All", ...CATEGORIES_LIST];

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Reset visible items count whenever search, category or sort changes to ensure fresh rendering
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory, sortBy]);

  // Process and sort all uploaded videos
  const processedVideos = useMemo(() => {
    // 1. Filter
    const filtered = videos.filter((vid) => {
      const matchesSearch =
        vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vid.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vid.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        vid.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || selectedCategory === "Tất cả" || normalizeCategory(vid.category) === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      const aViews = a.baseViews + a.realViews;
      const bViews = b.baseViews + b.realViews;
      const aLikes = a.baseLikes + a.realLikes;
      const bLikes = b.baseLikes + b.realLikes;

      if (sortBy === "popular") {
        return bViews - aViews;
      }
      if (sortBy === "likes") {
        return bLikes - aLikes;
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      // "latest" sort (backdatedDate or publishedAt)
      const aDate = new Date(a.backdatedDate || a.publishedAt).getTime();
      const bDate = new Date(b.backdatedDate || b.publishedAt).getTime();
      return bDate - aDate;
    });
  }, [videos, searchQuery, selectedCategory, sortBy]);

  // Slice videos to only show visible items
  const paginatedVideos = useMemo(() => {
    return processedVideos.slice(0, visibleCount);
  }, [processedVideos, visibleCount]);

  const hasMore = visibleCount < processedVideos.length;

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 400); // smooth natural delay
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, visibleCount, processedVideos.length]);

  return (
    <div className="w-full py-10 px-4 md:px-6 min-h-screen select-none font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-[10px] tracking-widest uppercase font-bold">
              <Film className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>DRM SECURE REPOSITORY</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              All Videos
              <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                {videos.length} Total
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-700 dark:text-neutral-400">
              Explore the entire catalog of high-fidelity, copyrighted cinematics protected by Videocites digital rights management.
            </p>
          </div>
        </div>

        {/* Controls Panel (Search, Category, Sorting) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-100/50 dark:bg-zinc-900/10 border border-slate-200 dark:border-white/5 p-4 rounded-2xl">
          
          {/* Search Input - 4 cols */}
          <div className="relative lg:col-span-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Videocites..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 dark:text-neutral-500" />
          </div>

          {/* Categories Tab Bar - 5 cols */}
          <div className="lg:col-span-5 flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? "bg-blue-500 text-neutral-950 shadow-md font-black"
                    : "bg-white dark:bg-white/5 text-slate-800 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown - 3 cols */}
          <div className="lg:col-span-3 flex items-center gap-2.5 justify-end">
            <div className="flex items-center gap-1 text-xs font-bold font-mono text-slate-700 dark:text-neutral-400 uppercase shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-800 dark:text-neutral-300 focus:outline-none focus:border-blue-500 cursor-pointer w-full"
            >
              <option value="latest">Latest Uploaded</option>
              <option value="popular">Most Viewed</option>
              <option value="likes">Most Liked</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Video Grid */}
        <div>
          {processedVideos.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
              <Film className="w-12 h-12 text-slate-400 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-400">No videos found matching your criteria</p>
              <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1">Try resetting filters or changing the search query.</p>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {paginatedVideos.map((vid, idx) => {
                    const totalViews = vid.baseViews + vid.realViews;
                    const totalLikes = vid.baseLikes + vid.realLikes;
                    return (
                      <motion.div
                        key={vid.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: Math.min((idx % ITEMS_PER_PAGE) * 0.05, 0.4) }}
                        whileHover={{ y: -6 }}
                        className="bg-white dark:bg-zinc-900/30 border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 hover:shadow-xl dark:hover:shadow-2xl shadow-sm dark:shadow-none hover:shadow-blue-500/5 transition-all duration-300"
                        onClick={() => onSelectVideo(vid.id)}
                      >
                        {/* Thumbnail frame */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          
                          {/* Duration badge */}
                          <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur text-[10px] text-white font-mono font-bold px-2 py-0.5 rounded">
                            {vid.duration}
                          </span>

                          {/* Category badge */}
                          <span className="absolute top-2.5 left-2.5 bg-blue-500/90 text-neutral-950 font-mono font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md">
                            {normalizeCategory(vid.category)}
                          </span>

                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-xl text-neutral-950 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <Play className="w-5 h-5 fill-[#050505] text-[#050505] translate-x-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Content details */}
                        <div className="p-4 space-y-4 flex-grow flex flex-col justify-between bg-white dark:bg-transparent">
                          <div className="space-y-2">
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                              {vid.title}
                            </h3>
                            <p className="text-xs text-slate-700 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                              {vid.description}
                            </p>
                          </div>

                          {/* Tag list */}
                          {vid.tags && vid.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {vid.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold font-mono px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-400 rounded"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                            {/* Author layout */}
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={vid.author.avatar}
                                alt={vid.author.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10"
                                loading="lazy"
                              />
                              <div className="flex items-center gap-0.5 min-w-0">
                                <span className="text-xs md:text-sm font-bold text-slate-950 dark:text-neutral-200 truncate">
                                  {vid.author.name}
                                </span>
                                {vid.author.verified && (
                                  <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-neutral-950 shrink-0" />
                                )}
                              </div>
                            </div>

                            {/* Stats and Date */}
                            <div className="flex flex-col items-end shrink-0 gap-1 text-slate-950 dark:text-neutral-200">
                              <div className="flex items-center gap-2.5 text-[10px] font-semibold">
                                <span className="flex items-center gap-0.5 font-extrabold" title={`${totalViews.toLocaleString()} views`}>
                                  <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-neutral-400" />
                                  {formatViews(totalViews)}
                                </span>
                                <span className="flex items-center gap-0.5 font-extrabold" title={`${totalLikes.toLocaleString()} likes`}>
                                  <ThumbsUp className="w-3.5 h-3.5 text-slate-600 dark:text-neutral-400" />
                                  {formatViews(totalLikes)}
                                </span>
                              </div>
                              <span className="text-[9px] font-extrabold text-slate-700 dark:text-neutral-400">
                                {formatDate(vid.backdatedDate || vid.publishedAt)}
                              </span>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Load More Trigger and Indicator */}
              <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-6 border-t border-slate-100 dark:border-white/5">
                {hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black tracking-wider uppercase bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-neutral-950 shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Videos</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-400 flex items-center gap-2 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>You've reached the end of the line</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
