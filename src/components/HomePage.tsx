import React, { useState, useEffect } from "react";
import { Video } from "../types";
import { Play, Eye, ThumbsUp, Sparkles, CheckCircle, Search, Film, ShieldCheck, Award, Activity, Globe, Lock, Server, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORIES_LIST, normalizeCategory } from "../utils/categories";

interface HomePageProps {
  videos: Video[];
  onSelectVideo: (id: string) => void;
  isAdmin: boolean;
  onNavigate: (view: string) => void;
}

export default function HomePage({ videos, onSelectVideo, isAdmin, onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [screenshotBlocks, setScreenshotBlocks] = useState(342);
  const [totalHandshakes, setTotalHandshakes] = useState(1248590);
  const [pingUS, setPingUS] = useState(1);
  const [pingAU, setPingAU] = useState(3);
  const [pingEU, setPingEU] = useState(10);
  const [pingAS, setPingAS] = useState(7);
  const [securityLogs, setSecurityLogs] = useState<string[]>([
    "System initialized. DRM shield active.",
    "Global hubs connection secure. Latency < 15ms.",
    "Enforcing ISO/IEC 27001 info-sec protocols.",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate screenshot blocks slightly (chance to increment)
      if (Math.random() > 0.6) {
        setScreenshotBlocks(prev => prev + Math.floor(Math.random() * 2) + 1);
      }
      
      // Increment total handshakes continuously
      setTotalHandshakes(prev => prev + Math.floor(Math.random() * 3) + 1);
      
      // Jitter pings
      setPingUS(prev => Math.max(1, Math.min(4, prev + (Math.random() > 0.5 ? 1 : -1))));
      setPingAU(prev => Math.max(2, Math.min(5, prev + (Math.random() > 0.5 ? 1 : -1))));
      setPingEU(prev => Math.max(8, Math.min(13, prev + (Math.random() > 0.5 ? 1 : -1))));
      setPingAS(prev => Math.max(5, Math.min(10, prev + (Math.random() > 0.5 ? 1 : -1))));
      
      // Randomly add a log
      if (Math.random() > 0.5) {
        const hubs = ["US-East", "AU-Core", "EU-Central", "Asia-Pac"];
        const actions = [
          "Token verification request cleared",
          "Watermark session ID injected successfully",
          "Enforced CSS inspect protection",
          "DRM keys rotation audit completed",
          "Frame checksum verification passed",
          "Screenshot block event registered"
        ];
        const randomHub = hubs[Math.floor(Math.random() * hubs.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
        
        setSecurityLogs(prev => {
          const newLogs = [`[${timestamp}] [${randomHub}] ${randomAction}`, ...prev];
          return newLogs.slice(0, 4); // keep last 4
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const categories = ["All", ...CATEGORIES_LIST];

  const filteredVideos = videos.filter((vid) => {
    const matchesSearch = vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vid.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const normalizedVideoCategory = normalizeCategory(vid.category);
    const matchesCategory = selectedCategory === "All" || normalizedVideoCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="w-full py-10 px-4 md:px-6 min-h-screen select-none font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">

         {/* Elegant Hero Slider Banner */}
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] w-full bg-slate-100 dark:bg-zinc-900/30 border border-slate-200 dark:border-white/10 flex items-center p-6 md:p-12 shadow-xl dark:shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/5 transition-all">
          {/* Unsplash abstract background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80" 
              alt="Hero Backdrop"
              className="w-full h-full object-cover opacity-20 filter blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-100/90 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent transition-colors duration-300" />
          </div>

          <div className="relative z-10 max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-[10px] tracking-widest uppercase font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 animate-spin" />
              <span>VIDEOCITES PREMIERE MASTERCLASS RELEASE</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              SINTEL Remastered: 4K UHD Cinematic Experience
            </h1>
            
            <p className="text-xs md:text-sm text-slate-800 dark:text-neutral-400 leading-relaxed">
              CGI version meticulously produced by the Blender Foundation, exclusively streaming on Videocites secure distribution servers. Equipped with state-of-the-art DRM anti-copy encryption.
            </p>

            <button 
              onClick={() => onNavigate("videos")}
              className="bg-blue-500 hover:bg-blue-600 text-[#050505] font-extrabold text-xs tracking-wider uppercase py-3 px-6 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
            >
              <Play className="w-4 h-4 fill-[#050505]" />
              Play Video Now
            </button>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-900/20 dark:to-zinc-900/5 border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-8 transition-all duration-300 shadow-sm">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest block font-mono">
                System Integration
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Key Features & Security Capabilities
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-md leading-relaxed font-medium">
              Designed for digital rights protection, our robust systems guarantee secure, tamper-proof premium video delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {/* Card 1 */}
            <div className="group relative bg-white dark:bg-zinc-900/40 border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 hover:-translate-y-1.5 hover:border-blue-500/40 dark:hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                Enterprise DRM Shield
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-medium">
                Complete end-to-end media stream tokenization and authorization preventing source extraction.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white dark:bg-zinc-900/40 border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 hover:-translate-y-1.5 hover:border-blue-500/40 dark:hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                <Eye className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                Dynamic Watermarks
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-medium">
                Unique real-time viewer tracking with multi-layered watermark arrays overlaid on playback.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white dark:bg-zinc-900/40 border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 hover:-translate-y-1.5 hover:border-blue-500/40 dark:hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                <CheckCircle className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                Right-Click Block
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-medium">
                Comprehensive security system prohibiting inspection, screenshots, or hotlinking actions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group relative bg-white dark:bg-zinc-900/40 border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 hover:-translate-y-1.5 hover:border-blue-500/40 dark:hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                Real-Time Seeding
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-medium">
                Dynamic backdating, tagging, category assignment, and real-time community engagement logs.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Trust & Partners Section */}
        <div className="space-y-8">
          {/* Trusted By Partner Showcase */}
          <div className="relative overflow-hidden bg-slate-50/50 dark:bg-zinc-900/5 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-6 transition-colors shadow-inner">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-blue-500/5 dark:bg-blue-500/2 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center space-y-2 relative z-10">
              <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest block font-mono">
                Global Media Security Network
              </span>
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono flex items-center justify-center gap-3">
                <span className="hidden sm:inline-block w-8 h-[1px] bg-slate-300 dark:bg-neutral-700" />
                Trusted By Partners & Studios
                <span className="hidden sm:inline-block w-8 h-[1px] bg-slate-300 dark:bg-neutral-700" />
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2 relative z-10">
              {[
                {
                  name: "Universal",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Universal_Pictures_logo.svg/960px-Universal_Pictures_logo.svg.png",
                  class: "h-9 sm:h-10 dark:brightness-0 dark:invert transition-all opacity-85 group-hover:opacity-100 group-hover:scale-105 duration-300"
                },
                {
                  name: "Sony Pictures",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Sony_Pictures_Inc._logo.svg/500px-Sony_Pictures_Inc._logo.svg.png",
                  class: "h-8 sm:h-9 dark:brightness-0 dark:invert transition-all opacity-85 group-hover:opacity-100 group-hover:scale-105 duration-300"
                },
                {
                  name: "Warner Bros",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Warner_Bros._logo_2023.svg/500px-Warner_Bros._logo_2023.svg.png",
                  class: "h-11 sm:h-12 transition-all opacity-85 group-hover:opacity-100 group-hover:scale-105 duration-300"
                },
                {
                  name: "Galaxy Studio",
                  logo: "https://upload.wikimedia.org/wikipedia/vi/4/4b/Galaxy_Studio.png?_=20250721031245",
                  class: "h-11 sm:h-12 transition-all opacity-85 group-hover:opacity-100 group-hover:scale-105 duration-300"
                },
                {
                  name: "Disney+",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
                  class: "h-8 sm:h-9 dark:brightness-0 dark:invert transition-all opacity-85 group-hover:opacity-100 group-hover:scale-105 duration-300"
                },
                {
                  name: "Netflix",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
                  class: "h-5 sm:h-6 dark:brightness-0 dark:invert transition-all opacity-85 group-hover:opacity-100 group-hover:scale-105 duration-300"
                }
              ].map((partner, index) => (
                <div key={index} className="bg-white dark:bg-zinc-900/40 border border-slate-200/60 dark:border-white/5 rounded-2xl h-20 sm:h-24 px-4 flex items-center justify-center hover:border-blue-500/40 dark:hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-default select-none group">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className={`${partner.class} object-contain max-w-[85%]`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6 transition-colors duration-300">
          
          {/* Categories Tab */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-500 text-neutral-950 shadow-lg font-black"
                    : "bg-slate-200/50 dark:bg-white/5 text-slate-800 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box with icons */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search copyrighted videos..."
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 dark:text-neutral-500" />
          </div>

        </div>

        {/* Video Catalog Grid */}
        <div>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
              <Film className="w-12 h-12 text-slate-400 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-400">No videos matched your filter criteria</p>
              <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1">Try searching with different keywords or changing categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.slice(0, 9).map((vid) => {
                const totalViews = vid.baseViews + vid.realViews;
                const totalLikes = vid.baseLikes + vid.realLikes;
                return (
                  <motion.div
                    key={vid.id}
                    whileHover={{ y: -6 }}
                    className="bg-white dark:bg-zinc-900/30 border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 hover:shadow-xl dark:hover:shadow-2xl shadow-sm dark:shadow-none hover:shadow-blue-500/5 transition-all duration-300"
                    onClick={() => onSelectVideo(vid.id)}
                  >
                    
                    {/* Thumbnail banner */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img 
                        src={vid.thumbnailUrl} 
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Duration stamp */}
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur text-[10px] text-white font-mono font-bold px-2 py-0.5 rounded">
                        {vid.duration}
                      </span>

                      {/* Hover action icon overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-xl text-neutral-950 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <Play className="w-5 h-5 fill-[#050505] text-[#050505] translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Meta info bottom */}
                    <div className="p-4 space-y-3 flex-grow flex flex-col justify-between bg-white dark:bg-transparent">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {vid.title}
                        </h3>
                        {/* Views and Publication Date - both BOLDED as requested */}
                        <div className="flex items-center gap-2 text-[11px] mt-1.5 font-sans">
                          <span className="font-extrabold text-slate-900 dark:text-neutral-100">
                            {formatViews(totalViews)} views
                          </span>
                          <span className="text-slate-600 dark:text-neutral-500 font-bold">•</span>
                          <span className="font-extrabold text-slate-900 dark:text-neutral-100">
                            {formatDate(vid.backdatedDate || vid.publishedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                        {/* Author */}
                        <div className="flex items-center gap-2 min-w-0">
                          <img 
                            src={vid.author.avatar} 
                            alt={vid.author.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10"
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

                        {/* Likes Stats */}
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-950 dark:text-neutral-400 shrink-0 font-bold">
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-600 dark:text-neutral-500" />
                          <span>{formatViews(totalLikes)}</span>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
