/**
 * Turn any pasted video URL into something renderable on the homepage.
 * Recognises YouTube, Vimeo and direct video files (e.g. an R2 .mp4 link);
 * everything else is ignored so the section simply stays hidden.
 */
export type VideoKind = 'youtube' | 'vimeo' | 'file' | 'none';

export interface VideoEmbed {
  kind: VideoKind;
  /** iframe src for YouTube/Vimeo, or the direct file URL for 'file'. */
  src: string;
}

function parseYouTube(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = u.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/);
      if (m) return `https://www.youtube.com/embed/${m[2]}`;
    }
  } catch {
    return null;
  }
  return null;
}

function parseVimeo(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === 'player.vimeo.com') return url;
  } catch {
    return null;
  }
  return null;
}

/** Resolve a pasted URL into a renderable embed, or null if unrecognised. */
export function getVideoEmbed(rawUrl: string): VideoEmbed | null {
  const url = (rawUrl || '').trim();
  if (!url) return null;
  const yt = parseYouTube(url);
  if (yt) return { kind: 'youtube', src: yt };
  const vimeo = parseVimeo(url);
  if (vimeo) return { kind: 'vimeo', src: vimeo };
  // A direct video file (mp4/webm/ogg/mov) or any other http(s) URL
  // (e.g. a public R2 link) plays via a native <video> element.
  if (/\.(mp4|webm|ogg|ogv|mov)(\?.*)?$/i.test(url) || /^https?:\/\//i.test(url)) {
    return { kind: 'file', src: url };
  }
  return null;
}
