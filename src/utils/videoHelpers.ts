export interface ParsedVideoSource {
  type: 'html5' | 'youtube' | 'vimeo' | 'iframe';
  src: string;
  embedUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
}

export interface VideoMetadataResult {
  type: 'html5' | 'youtube' | 'vimeo' | 'iframe';
  videoId?: string;
  title?: string;
  author?: string;
  duration?: number;
  durationFormatted?: string;
  thumbnailUrl?: string;
}

/**
 * Formats a duration in seconds to standard MM:SS or HH:MM:SS format
 */
export function formatSecondsToDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "00:00";
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Extracts YouTube video ID from various URL patterns:
 * - standard: https://www.youtube.com/watch?v=VIDEO_ID
 * - short: https://youtu.be/VIDEO_ID
 * - embed: https://www.youtube.com/embed/VIDEO_ID
 * - shorts: https://www.youtube.com/shorts/VIDEO_ID
 * - live: https://www.youtube.com/live/VIDEO_ID
 * - iframe markup: <iframe src="https://www.youtube.com/embed/VIDEO_ID"...
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // If pasted as full <iframe> tag
  const iframeMatch = cleanUrl.match(/src=["'](?:https?:)?\/\/www\.youtube(?:-nocookie)?\.com\/embed\/([^"&?\/\s]{11})["']/i);
  if (iframeMatch && iframeMatch[1]) return iframeMatch[1];

  const standardMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (standardMatch && standardMatch[1]) return standardMatch[1];

  return null;
}

/**
 * Extracts Vimeo video ID from URL or embed:
 * - https://vimeo.com/123456789
 * - https://player.vimeo.com/video/123456789
 * - <iframe src="https://player.vimeo.com/video/123456789"...
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  const iframeMatch = cleanUrl.match(/src=["'](?:https?:)?\/\/player\.vimeo\.com\/video\/(\d+)["']/i);
  if (iframeMatch && iframeMatch[1]) return iframeMatch[1];

  const match = cleanUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|video\/|album\/\d+\/video\/|))(\d+)/i);
  if (match && match[1]) return match[1];

  const playerMatch = cleanUrl.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (playerMatch && playerMatch[1]) return playerMatch[1];

  return null;
}

/**
 * Extracts generic iframe embed src if user pasted a raw <iframe> code snippet
 */
export function extractIframeSrc(input: string): string | null {
  if (!input) return null;
  const match = input.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

/**
 * Parses any video input string into a structured video source
 */
export function parseVideoSource(rawUrl: string): ParsedVideoSource {
  if (!rawUrl) {
    return { type: 'html5', src: '' };
  }

  const clean = rawUrl.trim();

  // Check if raw string is an <iframe> tag
  const iframeSrc = extractIframeSrc(clean);
  const targetUrl = iframeSrc || clean;

  // 1. YouTube check - defaults to unmuted (mute=0) and high quality
  const ytId = extractYouTubeId(targetUrl);
  if (ytId) {
    return {
      type: 'youtube',
      src: targetUrl,
      videoId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=0&enablejsapi=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
    };
  }

  // 2. Vimeo check - defaults to unmuted (muted=0), hides default badges, and requests logo removal (logo=0)
  const vimeoId = extractVimeoId(targetUrl);
  if (vimeoId) {
    return {
      type: 'vimeo',
      src: targetUrl,
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&color=3b82f6&title=0&byline=0&portrait=0&badge=0&logo=0&vimeo_logo=0`,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`
    };
  }

  // 3. If extracted from an iframe tag but not YT/Vimeo, treat as generic embed iframe
  if (iframeSrc || (clean.startsWith('http') && (clean.includes('/embed/') || clean.includes('/player/')))) {
    return {
      type: 'iframe',
      src: iframeSrc || clean,
      embedUrl: iframeSrc || clean
    };
  }

  // 4. Fallback to direct HTML5 video stream (mp4, webm, blob, m3u8, direct CDN url)
  return {
    type: 'html5',
    src: clean
  };
}

/**
 * Retrieves metadata (duration, high-res thumbnail, title, author) from Vimeo via public oEmbed
 */
export async function fetchVimeoMetadata(vimeoId: string): Promise<{
  duration?: number;
  durationFormatted?: string;
  thumbnailUrl?: string;
  title?: string;
  author?: string;
} | null> {
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
    if (res.ok) {
      const data = await res.json();
      const dur = typeof data.duration === 'number' ? data.duration : undefined;
      let thumb = data.thumbnail_url;
      // Convert lower-res Vimeo thumbnail to high-res if dimensions pattern exists
      if (thumb && /_\d+x\d+/.test(thumb)) {
        thumb = thumb.replace(/_\d+x\d+/, '_1280');
      }
      return {
        duration: dur,
        durationFormatted: dur !== undefined ? formatSecondsToDuration(dur) : undefined,
        thumbnailUrl: thumb || `https://vumbnail.com/${vimeoId}.jpg`,
        title: data.title,
        author: data.author_name
      };
    }
  } catch (err) {
    console.warn("Vimeo oEmbed fetch error:", err);
  }

  return {
    thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`
  };
}

/**
 * Detects duration from YouTube using temporary YouTube IFrame API instance in the browser
 */
export function getYouTubeDuration(ytId: string): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);

    // Timeout safety in case YouTube IFrame API is blocked by firewall or ad-blocker
    const timeout = setTimeout(() => {
      resolve(null);
    }, 4500);

    const initPlayer = () => {
      const container = document.createElement('div');
      container.id = `yt-sniffer-${Date.now()}`;
      container.style.cssText = 'position:fixed;width:1px;height:1px;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(container);

      try {
        const player = new (window as any).YT.Player(container, {
          videoId: ytId,
          playerVars: { autoplay: 0, controls: 0, mute: 1 },
          events: {
            onReady: (event: any) => {
              clearTimeout(timeout);
              const dur = event.target.getDuration();
              try {
                event.target.destroy();
                container.remove();
              } catch {}
              resolve(dur && dur > 0 ? dur : null);
            },
            onError: () => {
              clearTimeout(timeout);
              try {
                container.remove();
              } catch {}
              resolve(null);
            }
          }
        });
      } catch {
        clearTimeout(timeout);
        try {
          container.remove();
        } catch {}
        resolve(null);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        initPlayer();
      };
    }
  });
}

/**
 * Retrieves metadata (duration, maxres thumbnail, title, author) from YouTube
 */
export async function fetchYouTubeMetadata(ytId: string): Promise<{
  duration?: number;
  durationFormatted?: string;
  thumbnailUrl: string;
  title?: string;
  author?: string;
}> {
  let title: string | undefined;
  let author: string | undefined;

  // Try fetching title & author from noembed (CORS friendly)
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`);
    if (res.ok) {
      const data = await res.json();
      title = data.title;
      author = data.author_name;
    }
  } catch {}

  const dur = await getYouTubeDuration(ytId);

  return {
    thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
    title,
    author,
    duration: dur ?? undefined,
    durationFormatted: dur ? formatSecondsToDuration(dur) : undefined
  };
}

/**
 * Detects duration from direct HTML5 video stream (MP4, WebM, etc.) via DOM metadata
 */
export function getDirectVideoDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    const timer = setTimeout(() => {
      video.remove();
      resolve(null);
    }, 4000);
    video.onloadedmetadata = () => {
      clearTimeout(timer);
      const dur = video.duration;
      video.remove();
      resolve(dur && !isNaN(dur) && isFinite(dur) ? dur : null);
    };
    video.onerror = () => {
      clearTimeout(timer);
      video.remove();
      resolve(null);
    };
  });
}

/**
 * High-level unified detector for any video URL (YouTube, Vimeo, MP4, Embed)
 * Automatically returns thumbnail URL, duration (formatted MM:SS), and title if available.
 */
export async function fetchAutoVideoMetadata(url: string): Promise<VideoMetadataResult> {
  const parsed = parseVideoSource(url);

  if (parsed.type === 'vimeo' && parsed.videoId) {
    const meta = await fetchVimeoMetadata(parsed.videoId);
    return {
      type: 'vimeo',
      videoId: parsed.videoId,
      thumbnailUrl: meta?.thumbnailUrl || parsed.thumbnailUrl,
      duration: meta?.duration,
      durationFormatted: meta?.durationFormatted,
      title: meta?.title,
      author: meta?.author
    };
  }

  if (parsed.type === 'youtube' && parsed.videoId) {
    const meta = await fetchYouTubeMetadata(parsed.videoId);
    return {
      type: 'youtube',
      videoId: parsed.videoId,
      thumbnailUrl: meta.thumbnailUrl || parsed.thumbnailUrl,
      duration: meta.duration,
      durationFormatted: meta.durationFormatted,
      title: meta.title,
      author: meta.author
    };
  }

  if (parsed.type === 'html5' && parsed.src) {
    const dur = await getDirectVideoDuration(parsed.src);
    return {
      type: 'html5',
      duration: dur ?? undefined,
      durationFormatted: dur ? formatSecondsToDuration(dur) : undefined
    };
  }

  return {
    type: parsed.type,
    thumbnailUrl: parsed.thumbnailUrl
  };
}
