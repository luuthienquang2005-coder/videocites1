export interface ParsedVideoSource {
  type: 'html5' | 'youtube' | 'vimeo' | 'iframe';
  src: string;
  embedUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
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

  // 1. YouTube check
  const ytId = extractYouTubeId(targetUrl);
  if (ytId) {
    return {
      type: 'youtube',
      src: targetUrl,
      videoId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
    };
  }

  // 2. Vimeo check
  const vimeoId = extractVimeoId(targetUrl);
  if (vimeoId) {
    return {
      type: 'vimeo',
      src: targetUrl,
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=3b82f6&title=0&byline=0&portrait=0`,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`
    };
  }

  // 3. If extracted from an iframe tag but not YT/Vimeo, treat as generic embed iframe
  if (iframeSrc || clean.startsWith('http') && (clean.includes('/embed/') || clean.includes('/player/'))) {
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
