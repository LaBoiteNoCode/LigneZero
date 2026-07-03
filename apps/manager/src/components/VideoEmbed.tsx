import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { parseVideoUrl } from '@/lib/video';

export interface VideoEmbedHandle {
  seek: (sec: number) => void;
  getTime: () => number | null;
}

interface VideoEmbedProps {
  url: string;
  onReady?: () => void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: string, opts: unknown) => any };
    onYouTubeIframeAPIReady?: () => void;
    Twitch?: { Player: { new (el: string, opts: unknown): any; READY: string } };
  }
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }
  return ytApiPromise;
}

let twitchApiPromise: Promise<void> | null = null;
function loadTwitchApi(): Promise<void> {
  if (window.Twitch?.Player) return Promise.resolve();
  if (!twitchApiPromise) {
    twitchApiPromise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://player.twitch.tv/js/embed/v1.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }
  return twitchApiPromise;
}

/**
 * Lecteur VOD avec seek programmatique — YouTube et Twitch (VOD) via leurs API
 * d'embed respectives. Pour tout autre lien : repli en simple bouton d'ouverture
 * (pas de saut auto possible, les checkpoints n'affichent que l'horodatage).
 */
export const VideoEmbed = forwardRef<VideoEmbedHandle, VideoEmbedProps>(function VideoEmbed(
  { url, onReady },
  ref,
) {
  const containerId = useRef(`video-embed-${Math.random().toString(36).slice(2)}`).current;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const parsed = parseVideoUrl(url);

  useImperativeHandle(ref, () => ({
    seek(sec: number) {
      if (!playerRef.current) return;
      if (parsed.platform === 'youtube') playerRef.current.seekTo(sec, true);
      if (parsed.platform === 'twitch') playerRef.current.seek(sec);
    },
    getTime() {
      if (!playerRef.current) return null;
      if (parsed.platform === 'youtube' || parsed.platform === 'twitch') {
        return playerRef.current.getCurrentTime() as number;
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [parsed.platform]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    playerRef.current = null;

    if (parsed.platform === 'youtube' && parsed.id) {
      loadYouTubeApi().then(() => {
        if (cancelled) return;
        playerRef.current = new window.YT!.Player(containerId, {
          videoId: parsed.id,
          events: {
            onReady: () => {
              if (cancelled) return;
              setReady(true);
              onReady?.();
            },
          },
        });
      });
    } else if (parsed.platform === 'twitch' && parsed.id) {
      loadTwitchApi().then(() => {
        if (cancelled) return;
        const player = new window.Twitch!.Player(containerId, {
          video: parsed.id,
          width: '100%',
          height: '100%',
          autoplay: false,
        });
        playerRef.current = player;
        player.addEventListener(window.Twitch!.Player.READY, () => {
          if (cancelled) return;
          setReady(true);
          onReady?.();
        });
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (parsed.platform === 'other') {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-line-strong bg-base-900 p-6 text-center">
        <p className="font-mono text-xs text-[color:var(--text-mute)]">
          Aperçu non disponible pour ce lien — les checkpoints affichent l'horodatage sans saut automatique.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent hover:underline">
          ↗ Ouvrir la vidéo
        </a>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full border border-line-strong bg-base-900">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-[color:var(--text-mute)]">
          Chargement du lecteur…
        </div>
      )}
      <div id={containerId} className="h-full w-full" />
    </div>
  );
});
