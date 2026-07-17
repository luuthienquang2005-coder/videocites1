import React, { useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
}

export default function LazyImage({ src, alt, className = "", referrerPolicy }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");

  useEffect(() => {
    // Reset loaded state when src changes
    setLoaded(false);
    setCurrentSrc(src);
  }, [src]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${!loaded ? "bg-slate-200 dark:bg-zinc-800 animate-pulse" : ""}`}>
      {/* Skeleton / Pulse Overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-zinc-800/80">
          <svg className="w-8 h-8 text-slate-400 dark:text-zinc-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          referrerPolicy={referrerPolicy}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)} // also trigger on error to avoid infinite loading state
        />
      )}
    </div>
  );
}
