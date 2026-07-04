import React, { useRef, useState, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, ShieldAlert, Settings, SquareStack, Check, Tv
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  viewerId = "mnzfrankie@gmail.com",
  onEnded,
  isTheaterMode = false,
  onToggleTheater
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem("videocites-volume");
      return saved ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
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

  // Control visibility timer
  useEffect(() => {
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
  }, [isPlaying]);

  // Handle media updates
  const handlePlayPause = () => {
    if (!videoRef.current) return;
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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing events if user is currently typing in input field or text area (e.g. searching/commenting)
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
  }, [isPlaying, volume, duration, isMuted, onToggleTheater]);

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
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Initializing Stream...</p>
          </div>
        </div>
      )}

      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handlePlayPause}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
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

      {/* Anti-camtracing watermark ID tracking overlay (Enterprise standard) */}
      <div 
        className="absolute pointer-events-none text-white font-mono select-none z-10 font-bold tracking-widest transition-all duration-1000 ease-in-out"
        style={{ 
          top: watermarkPos.top, 
          left: watermarkPos.left,
          opacity: 0.07, // Highly invisible trace, only visible on scrutiny
          fontSize: "13px",
          textShadow: "1px 1px 0px rgba(0,0,0,0.8)"
        }}
      >
        VNAOH CO-STREAM WATERMARK ID: {viewerId} / IP: SECURE_TUNNEL
      </div>

      {/* Alternate floating watermark for screen edge safety */}
      <div className="absolute top-4 right-4 pointer-events-none text-[10px] text-white opacity-5 font-mono select-none z-10 tracking-widest">
        ENCRYPTED FEED: {viewerId}
      </div>

      {/* Right-click protection notification banner */}
      <AnimatePresence>
        {isRightClickWarning && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-950/90 backdrop-blur-xl border border-red-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-red-200 shadow-xl z-20 font-sans"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Chính sách Bản quyền Vnaoh: Nội dung thuộc sở hữu trí tuệ tối cao. Hành vi click chuột phải hoặc tải nguồn bị cấm tuyệt đối.</span>
          </motion.div>
        )}
      </AnimatePresence>

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

                {/* Rewind */}
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-block"
                  title="Tua lại 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Volume Deck */}
                <div className="flex items-center gap-2 group/volume">
                  <button 
                    onClick={handleMuteToggle}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-gray-400" />
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
                    className="w-0 group-hover/volume:w-16 h-1 cursor-pointer accent-white transition-all overflow-hidden duration-300"
                  />
                </div>

                {/* Time string */}
                <span className="text-xs font-mono text-gray-300">
                  {formatTime(currentTime)} <span className="text-gray-500">/</span> {formatTime(duration)}
                </span>
              </div>

              {/* Right tools */}
              <div className="flex items-center gap-2.5">
                {/* Speed settings toggle */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-mono ${showSpeedMenu ? 'bg-white/15' : ''}`}
                    title="Tốc độ phát"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{playbackSpeed}x</span>
                  </button>

                  {/* Speed Popover */}
                  {showSpeedMenu && (
                    <div className="absolute bottom-10 right-0 bg-neutral-950/95 border border-white/10 rounded-xl py-1.5 w-28 text-left shadow-2xl backdrop-blur-xl z-30">
                      {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
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
    </div>
  );
}
