import React, { useState, useMemo } from "react";
import { Photo } from "../types";
import { CATEGORIES_LIST, normalizeCategory } from "../utils/categories";
import { Image as ImageIcon, Eye, ThumbsUp, Calendar, ArrowUpDown, Search, CheckCircle, Sparkles, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PhotosPageProps {
  photos: Photo[];
  onSelectPhoto: (id: string) => void;
  isAdmin: boolean;
}

type SortOption = "latest" | "popular" | "likes" | "title";

export default function PhotosPage({ photos, onSelectPhoto, isAdmin }: PhotosPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

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

  // Process and sort all uploaded photos
  const processedPhotos = useMemo(() => {
    // 1. Filter
    const filtered = photos.filter((pic) => {
      const matchesSearch =
        pic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pic.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pic.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || selectedCategory === "Tất cả" || normalizeCategory(pic.category) === selectedCategory;
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
  }, [photos, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="w-full py-10 px-4 md:px-6 min-h-screen select-none font-sans transition-colors duration-300" id="photos-page-container">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6" id="photos-header">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-[10px] tracking-widest uppercase font-bold">
              <ImageIcon className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>DRM SECURE PHOTO GALLERY</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Secure Gallery
              <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                {photos.length} Total
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-700 dark:text-neutral-400">
              Explore professional high-fidelity visual photography, artwork renders, and design assets protected under copyright clearance.
            </p>
          </div>
        </div>

        {/* Controls Panel (Search, Category, Sorting) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-100/50 dark:bg-zinc-900/10 border border-slate-200 dark:border-white/5 p-4 rounded-2xl" id="photos-controls-panel">
          
          {/* Search Input - 4 cols */}
          <div className="relative lg:col-span-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Videocites..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              id="photo-search-input"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 dark:text-neutral-500" />
          </div>

          {/* Categories Tab Bar - 5 cols */}
          <div className="lg:col-span-5 flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none" id="photo-categories-tabs">
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
              id="photo-sort-select"
            >
              <option value="latest">Latest Uploaded</option>
              <option value="popular">Most Viewed</option>
              <option value="likes">Most Liked</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Photos Grid */}
        <div>
          {processedPhotos.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl" id="photos-not-found">
              <ImageIcon className="w-12 h-12 text-slate-400 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-400">No photos found matching your criteria</p>
              <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1">Try resetting filters or changing the search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="photos-grid">
              <AnimatePresence mode="popLayout">
                {processedPhotos.map((pic, idx) => {
                  const totalViews = pic.baseViews + pic.realViews;
                  const totalLikes = pic.baseLikes + pic.realLikes;
                  return (
                    <motion.div
                      key={pic.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                      whileHover={{ y: -6 }}
                      className="bg-white dark:bg-zinc-900/30 border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 hover:shadow-xl dark:hover:shadow-2xl shadow-sm dark:shadow-none hover:shadow-blue-500/5 transition-all duration-300"
                      onClick={() => onSelectPhoto(pic.id)}
                      id={`photo-card-${pic.id}`}
                    >
                      {/* Photo Image Frame */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={pic.imageUrl}
                          alt={pic.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />

                        {/* Category badge */}
                        <span className="absolute top-2.5 left-2.5 bg-blue-500/90 text-neutral-950 font-mono font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md">
                          {normalizeCategory(pic.category)}
                        </span>

                        {/* View Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="px-4 py-2 rounded-xl bg-blue-500/95 text-neutral-950 font-bold font-mono text-[10px] tracking-wider uppercase shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>View Full Photo</span>
                          </div>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-4 space-y-4 flex-grow flex flex-col justify-between bg-white dark:bg-transparent">
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                            {pic.title}
                          </h3>
                          <p className="text-xs text-slate-700 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                            {pic.description}
                          </p>
                        </div>

                        {/* Tag list */}
                        {pic.tags && pic.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {pic.tags.slice(0, 3).map((tag) => (
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
                              src={pic.author.avatar}
                              alt={pic.author.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                            <div className="flex items-center gap-0.5 min-w-0">
                              <span className="text-xs md:text-sm font-bold text-slate-950 dark:text-neutral-200 truncate">
                                {pic.author.name}
                              </span>
                              {pic.author.verified && (
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
                              {formatDate(pic.backdatedDate || pic.publishedAt)}
                            </span>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
