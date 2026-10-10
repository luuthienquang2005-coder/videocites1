import React, { useRef, useState, useEffect, useMemo } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  ShieldAlert, Settings, SquareStack, Check, Tv
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { parseVideoSource } from "../utils/videoHelpers";
import { isIndexedDbUrl, getMediaBlobUrl, getIndexedDbId } from "../utils/indexedDbStorage";
import { isFirestoreMediaUrl, getFirestoreMediaId, loadVideoBlobFromFirestore } from "../utils/firestoreMediaStorage";
import VimeoPlayer from "@vimeo/player";

interface VideoPlayerProps {
  src: string;
  poster: string;
  viewerId?: string;
  onEnded?: () => void;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export default function VideoPlayer({ 
  src, 
  poster, 
  viewerId,
  onEnded,
  isTheaterMode = false,
  onToggleTheater
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolved source if using local indexedDB storage pointer (idb://) or Firestore database pointer (firestore://)
  const [resolvedSrc, setResolvedSrc] = useState<string>(src);
  const [dbDownloadProgress, setDbDownloadProgress] = useState<number | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // Vimeo player state and ref
  const vimeoIframeRef = useRef<HTMLIFrameElement>(null);
  const vimeoPlayerRef = useRef<VimeoPlayer | null>(null);
  const [isVimeoMuted, setIsVimeoMuted] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;
    setDbError(null);

    if (isFirestoreMediaUrl(src)) {
      const dbId = getFirestoreMediaId(src);
      setDbDownloadProgress(0);
      loadVideoBlobFromFirestore(dbId, (pct) => {
        if (active) setDbDownloadProgress(pct);
      }).then((blob) => {
        if (!active) return;
        setDbDownloadProgress(null);
        if (blob) {
          createdUrl = URL.createObjectURL(blob);
          setResolvedSrc(createdUrl);
        } else {
          setDbError("Không tìm thấy dữ liệu video trong cơ sở dữ liệu.");
          setResolvedSrc(src);
        }
      }).catch((err) => {
        if (!active) return;
        console.error("Firestore video load failed:", err);
        setDbDownloadProgress(null);
        setDbError("Lỗi kết nối khi tải video từ cơ sở dữ liệu.");
        setResolvedSrc(src);
      });
    } else if (isIndexedDbUrl(src)) {
      const dbId = getIndexedDbId(src);
      getMediaBlobUrl(dbId).then((url) => {
        if (active && url) {
          createdUrl = url;
          setResolvedSrc(url);
        } else if (active) {
          setResolvedSrc(src);
        }
      });
    } else {
      setResolvedSrc(src);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src]);

  // Parse source into YouTube, Vimeo, iframe or direct HTML5 video
  const parsedSource = useMemo(() => parseVideoSource(resolvedSrc), [resolvedSrc]);
  const isEmbed = parsedSource.type === "youtube" || parsedSource.type === "vimeo" || parsedSource.type === "iframe";

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem("videocites-volume");
      const val = saved ? parseFloat(saved) : 0.85;
      return val <= 0 ? 0.85 : val; // Ensure unmuted by default
    } catch {
      return 0.85;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRightClickWarning, setIsRightClickWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Watermark position shift to simulate anti-camtracing
  const [watermarkPos, setWatermarkPos] = useState({ top: "20%", left: "15%" });

  // Update watermark position every 15 seconds to deter bypass attempts
  useEffect(() => {
    const interval = setInterval(() => {
      const top = `${Math.floor(Math.random() * 60) + 15}%`;
      const left = `${Math.floor(Math.random() * 60) + 15}%`;
      setWatermarkPos({ top, left });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // For embed players, mark loading as finished after iframe mounts
  useEffect(() => {
    if (isEmbed) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [src, isEmbed]);

  // Vimeo Player SDK initialization: ensures unmuted playback by default
  useEffect(() => {
    if (parsedSource.type !== "vimeo" || !vimeoIframeRef.current) return;

    try {
      const player = new VimeoPlayer(vimeoIframeRef.current);
      vimeoPlayerRef.current = player;

      player.ready().then(async () => {
        try {
          await player.setMuted(false);
          await player.setVolume(1);
          setIsVimeoMuted(false);
        } catch (err) {
          console.log("Vimeo initial unmute policy check:", err);
          setIsVimeoMuted(true);
        }
      });

      player.on("play", async () => {
        try {
          await player.setMuted(false);
          await player.setVolume(1);
          setIsVimeoMuted(false);
        } catch (e) {}
      });

      player.on("volumechange", (data: { volume: number }) => {
        if (data.volume === 0) {
          setIsVimeoMuted(true);
        } else {
          setIsVimeoMuted(false);
        }
      });

      return () => {
        player.destroy().catch(() => {});
      };
    } catch (err) {
      console.warn("Vimeo SDK initialization:", err);
    }
  }, [parsedSource.type, parsedSource.embedUrl]);

  const handleUnmuteVimeo = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (vimeoPlayerRef.current) {
      try {
        await vimeoPlayerRef.current.setMuted(false);
        await vimeoPlayerRef.current.setVolume(1);
        setIsVimeoMuted(false);
      } catch (err) {
        console.warn("Failed to unmute Vimeo:", err);
      }
    }
  };

  // Control visibility timer for direct HTML5 player
  useEffect(() => {
    if (isEmbed) return;

    let timeoutId: number;
    const handleMouseMove = () => {
      setShowControls(true);
      window.clearTimeout(timeoutId);
      if (isPlaying) {
        timeoutId = window.setTimeout(() => {
          setShowControls(false);
          setShowSpeedMenu(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      window.clearTimeout(timeoutId);
    };
  }, [isPlaying, isEmbed]);

  // Handle media updates (HTML5 player)
  const handlePlayPause = () => {
    if (isEmbed || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log("Play failed: ", err));
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const lastBufferedIndex = videoRef.current.buffered.length - 1;
      const end = videoRef.current.buffered.end(lastBufferedIndex);
      setBufferedEnd(end);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      handleProgress();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    try {
      localStorage.setItem("videocites-volume", String(newVolume));
    } catch {}
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Error fullscreen:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error("Error exiting fullscreen:", err));
    }
  };

  // Keyboard shortcut keys for standard premium controls
  useEffect(() => {
    if (isEmbed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tagName = document.activeElement?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || document.activeElement?.getAttribute("contenteditable") === "true") {
        return;
      }

      if (!videoRef.current) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "j":
        case "arrowleft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case "l":
        case "arrowright":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration || videoRef.current.duration, videoRef.current.currentTime + 10);
          break;
        case "arrowup":
          e.preventDefault();
          const nextVolUp = Math.min(1, volume + 0.1);
          setVolume(nextVolUp);
          videoRef.current.volume = nextVolUp;
          videoRef.current.muted = false;
          setIsMuted(false);
          try {
            localStorage.setItem("videocites-volume", String(nextVolUp));
          } catch {}
          break;
        case "arrowdown":
          e.preventDefault();
          const nextVolDown = Math.max(0, volume - 0.1);
          setVolume(nextVolDown);
          videoRef.current.volume = nextVolDown;
          if (nextVolDown === 0) {
            setIsMuted(true);
            videoRef.current.muted = true;
          } else {
            setIsMuted(false);
            videoRef.current.muted = false;
          }
          try {
            localStorage.setItem("videocites-volume", String(nextVolDown));
          } catch {}
          break;
        case "f":
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case "m":
          e.preventDefault();
          handleMuteToggle();
          break;
        case "escape":
          if (document.fullscreenElement) {
            e.preventDefault();
            document.exitFullscreen()
              .then(() => setIsFullscreen(false))
              .catch(err => console.error("Error exiting fullscreen:", err));
          }
          break;
        case "t":
          if (onToggleTheater) {
            e.preventDefault();
            onToggleTheater();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume, duration, isMuted, onToggleTheater, isEmbed]);

  // Sync state on document-level fullscreen change
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const handlePiPToggle = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error("PiP error:", e);
    }
  };

  // Block context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRightClickWarning(true);
    setTimeout(() => {
      setIsRightClickWarning(false);
    }, 3000);
  };

  // Format Time Helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group border border-gray-200/10 select-none"
    >
      {/* Loading overlay for direct video or Database loading */}
      {dbDownloadProgress !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-35 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 max-w-xs text-center px-4">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="text-sm text-white font-semibold tracking-wide">Đang nạp video từ Database...</p>
            <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 rounded-full" 
                style={{ width: `${dbDownloadProgress}%` }}
              />
            </div>
            <p className="text-xs text-blue-400 font-mono">{dbDownloadProgress}% hoàn tất</p>
          </div>
        </div>
      )}

      {dbError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-35">
          <div className="flex flex-col items-center gap-2 text-center px-4 max-w-sm">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <p className="text-sm text-rose-400 font-medium">{dbError}</p>
          </div>
        </div>
      )}

      {!isEmbed && isLoading && dbDownloadProgress === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Initializing Stream...</p>
          </div>
        </div>
      )}

      {/* RENDER EMBED (YouTube, Vimeo, or generic iframe) */}
      {isEmbed ? (
        <div 
          onClick={parsedSource.type === "vimeo" ? handleUnmuteVimeo : undefined}
          className="relative w-full h-full bg-black overflow-hidden group/embed"
        >
          <iframe
            ref={parsedSource.type === "vimeo" ? vimeoIframeRef : undefined}
            src={parsedSource.embedUrl}
            title="Video Player"
            className={`w-full h-full border-0 ${
              parsedSource.type === "vimeo" 
                ? "transform scale-[1.035] origin-center" 
                : parsedSource.type === "youtube"
                ? "transform scale-[1.055] origin-center"
                : ""
            }`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; volume"
            allowFullScreen
          />
          {/* Default Unmute Banner for Vimeo if restricted by browser autoplay policy */}
          {parsedSource.type === "vimeo" && isVimeoMuted && (
            <button
              type="button"
              onClick={handleUnmuteVimeo}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-md transition-all cursor-pointer border border-white/20 animate-pulse hover:scale-105"
            >
              <Volume2 className="w-4 h-4" />
              <span>Bật tiếng Vimeo (Unmute)</span>
            </button>
          )}

          {/* Subtle bottom-right mask to hide Vimeo logo on basic tier players */}
          {parsedSource.type === "vimeo" && (
            <div 
              className="absolute bottom-0 right-0 w-24 h-12 pointer-events-none bg-gradient-to-tl from-black/85 via-black/40 to-transparent z-10"
              aria-hidden="true"
            />
          )}

          {/* YouTube Cinema Clean Masks: softens and conceals top channel/title bar and bottom-right YouTube logo */}
          {parsedSource.type === "youtube" && (
            <>
              {/* Top mask for YouTube Title & Channel */}
              <div 
                className="absolute top-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10"
                aria-hidden="true"
              />
              {/* Bottom-right mask for YouTube Logo & Channel Watermark */}
              <div 
                className="absolute bottom-0 right-0 w-36 h-14 pointer-events-none bg-gradient-to-tl from-black/90 via-black/40 to-transparent z-10"
                aria-hidden="true"
              />
            </>
          )}
        </div>
      ) : (
        /* RENDER DIRECT HTML5 VIDEO */
        <>
          <video
            ref={videoRef}
            src={resolvedSrc}
            poster={poster}
            muted={false}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handlePlayPause}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onCanPlay={() => {
              setIsLoading(false);
              if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.volume = volume;
              }
            }}
            onCanPlayThrough={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
            onProgress={handleProgress}
            onEnded={onEnded}
            preload="auto"
            className="w-full h-full object-contain cursor-pointer"
            playsInline
          />

          {/* Invisible overlay capturing click when speed menu is open to close it */}
          {showSpeedMenu && (
            <div 
              className="absolute inset-0 z-15" 
              onClick={() => setShowSpeedMenu(false)}
            />
          )}

          {/* Dynamic Floating Watermark with Viewer ID */}
          {viewerId && (
            <div 
              className="absolute pointer-events-none select-none z-10 opacity-30 transition-all duration-1000 ease-in-out font-mono text-[10px] text-white/50 tracking-wider bg-black/40 px-2 py-0.5 rounded border border-white/5 backdrop-blur-xs"
              style={{ top: watermarkPos.top, left: watermarkPos.left }}
            >
              {viewerId}
            </div>
          )}

          {/* YouTube-style brand watermark in bottom-right corner */}
          <div className="absolute bottom-16 right-4 md:bottom-20 md:right-6 pointer-events-none select-none z-10 flex flex-col items-center gap-1 opacity-25 md:opacity-35 group-hover:opacity-65 transition-opacity duration-300">
            <Logo className="w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" watermark={true} />
            <span className="text-[7px] md:text-[8px] font-mono tracking-widest text-white/70 font-bold uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              VIDEOCITES
            </span>
          </div>

          {/* Central Big Play/Pause Button on hover */}
          <div 
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 z-10 cursor-pointer"
          >
            {!isPlaying && !isLoading && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl text-white hover:scale-110 transition-transform"
              >
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </motion.div>
            )}
          </div>

          {/* Bottom Custom Playback Deck Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 flex flex-col gap-3"
              >
                {/* Seek bar */}
                <div className="relative w-full flex items-center group/seek">
                  {/* Virtual custom track layer for nice styling */}
                  <div className="absolute left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden pointer-events-none">
                    {/* Buffered track */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-white/20 transition-all duration-150"
                      style={{ width: `${duration > 0 ? (bufferedEnd / duration) * 100 : 0}%` }}
                    />
                    {/* Playing track */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 opacity-0 cursor-pointer z-10 accent-blue-500 group-hover/seek:opacity-100 transition-opacity"
                  />
                </div>

                {/* Controller row */}
                <div className="flex items-center justify-between text-white font-sans">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button 
                      onClick={handlePlayPause}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title={isPlaying ? "Tạm dừng" : "Phát"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white" />
                      )}
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2 group/vol">
                      <button 
                        onClick={handleMuteToggle}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-white/20 rounded-full appearance-none accent-blue-500 cursor-pointer hidden group-hover/vol:inline-block transition-all"
                      />
                    </div>

                    {/* Time Counter */}
                    <span className="text-xs font-mono text-gray-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right side controllers */}
                  <div className="flex items-center gap-3">
                    {/* Speed Selector */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-mono text-gray-300"
                        title="Tốc độ phát"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">{playbackSpeed}x</span>
                      </button>

                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-28 bg-gray-900/95 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden py-1 shadow-2xl z-30 animate-fade-in">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((sp) => (
                            <button
                              key={sp}
                              onClick={() => handleSpeedChange(sp)}
                              className="w-full px-3 py-1.5 text-xs font-mono hover:bg-white/10 flex items-center justify-between"
                            >
                              <span>{sp}x</span>
                              {playbackSpeed === sp && <Check className="w-3 h-3 text-blue-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PiP */}
                    <button 
                      onClick={handlePiPToggle}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-block"
                      title="Ảnh trong ảnh (PiP)"
                    >
                      <SquareStack className="w-4 h-4" />
                    </button>

                    {/* Theater Mode */}
                    {onToggleTheater && (
                      <button 
                        onClick={onToggleTheater}
                        className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-block ${
                          isTheaterMode ? "text-blue-400" : "text-gray-300"
                        }`}
                        title={isTheaterMode ? "Chế độ mặc định (t)" : "Chế độ rạp chiếu phim (t)"}
                      >
                        <Tv className="w-5 h-5" />
                      </button>
                    )}

                    {/* Fullscreen */}
                    <button 
                      onClick={handleFullscreenToggle}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Toàn màn hình"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Right-click protection notification banner */}
      <AnimatePresence>
        {isRightClickWarning && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-950/90 backdrop-blur-xl border border-red-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-red-200 shadow-xl z-30 font-sans"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Chính sách Bản quyền Videocites: Nội dung thuộc sở hữu trí tuệ tối cao. Hành vi click chuột phải hoặc tải nguồn bị cấm tuyệt đối.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
