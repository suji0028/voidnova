import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { gsap } from 'gsap';
import LiveUsers from './LiveUsers';

/*
  ADD / EDIT PLAYLISTS HERE
  name: display name for the playlist
  youtubePlaylistId: YouTube playlist ID
  background: local background image for this playlist
*/
const emraanBackground = new URL('../assets/backgrounds/emraan.png', import.meta.url).href;
const hrithikBackground = new URL('../assets/backgrounds/hrithik.png', import.meta.url).href;
const hollywoodBackground = new URL('../assets/backgrounds/hollywood.png', import.meta.url).href;

const PLAYLISTS = [
  { id: 'emraan', name: 'Emraan Hashmi', youtubePlaylistId: 'PLTV9wb1Wz6O0', background: emraanBackground },
  { id: 'hrithik', name: 'Hrithik Roshan', youtubePlaylistId: 'PLdZ9AKDEcqfU', background: hrithikBackground },
  { id: 'hollywood', name: 'Lo-Fi Nights', youtubePlaylistId: 'PLTV9wb1Wz6O0', background: hollywoodBackground }
];

const normalizePlaylistId = (value) => {
  if (!value) return '';

  const playlistValue = String(value).trim();
  const match = playlistValue.match(/[?&]list=([A-Za-z0-9_-]+)/);

  return match ? match[1] : playlistValue;
};

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const backgroundVideoSource = new URL('../assets/void.mp4', import.meta.url).href;

if (!YOUTUBE_API_KEY) {
  console.warn('[खालीपन] VITE_YOUTUBE_API_KEY is not configured. YouTube metadata requests will be unavailable.');
}

const fetchPlaylistMetadata = async (playlistId) => {
  const normalizedPlaylistId = normalizePlaylistId(playlistId);
  if (!YOUTUBE_API_KEY || !normalizedPlaylistId) return [];

  if (!globalThis.__VOID_NOVA_YT_CACHE__) {
    globalThis.__VOID_NOVA_YT_CACHE__ = new Map();
  }

  const cache = globalThis.__VOID_NOVA_YT_CACHE__;
  const cacheKey = `youtube-playlist:${normalizedPlaylistId}`;
  const failureKey = `youtube-playlist-failed:${normalizedPlaylistId}`;

  if (cache.has(cacheKey)) return cache.get(cacheKey);
  if (cache.has(failureKey)) return [];

  if (!/^PL[\w-]{10,}$/.test(normalizedPlaylistId)) {
    cache.set(failureKey, true);
    console.warn('[खालीपन] Skipping YouTube metadata fetch: invalid playlist ID format.');
    return [];
  }

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${new URLSearchParams({
      part: 'snippet,contentDetails',
      maxResults: '50',
      playlistId: normalizedPlaylistId,
      key: YOUTUBE_API_KEY
    })}`);

    if (!response.ok) {
      cache.set(failureKey, true);
      throw new Error(`YouTube Data API request failed: ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    cache.set(cacheKey, items);
    return items;
  } catch (error) {
    cache.set(failureKey, true);
    console.warn('[खालीपन] Unable to load YouTube playlist metadata. This usually means the playlist is private, the API key is restricted, or the playlist ID is invalid.');
    return [];
  }
};

const quotes = [
  "It's not who I am underneath, but what I do that defines me",
  "हर पल में एक नई धुन छुपी है",
  "It's not the plane, it's the pilot",
  "लबों से नहीं, दिल से सुनो",
  "There is no courage without fear",
  "क्यों जुड़ता इस जहाँ से तू इक दिन यह गुज़र ही जायेगा",
  "Blink of an Eye",
  "कितना भी समेट ले यहाँ मुट्ठी से फिसल ही जायेगा",
  "The way to get started is to quit talking and begin doing",
  "खुद को ढूँढना भी एक सफ़र है",
  "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success",
  "थोड़ी सी उम्मीद बहुत होती है"
];

const formatTime = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function VinylArt({ color }) {
  return <svg viewBox="0 0 60 60" aria-hidden="true"><rect width="60" height="60" fill={color} /><circle cx="30" cy="30" r="17" fill="rgba(0,0,0,.35)" /><circle cx="30" cy="30" r="12" fill="rgba(0,0,0,.25)" /><circle cx="30" cy="30" r="4" fill="#f7ecd9" /></svg>;
}

function PlaylistSelector({ isOpen, onClose, playlists, activePlaylistId, onSelect }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    if (!isOpen || !backdropRef.current || !panelRef.current) return;
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' });
    gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.9, y: 18 }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: 'back.out(1.5)' });
    gsap.fromTo('.ps-row', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.08, ease: 'power2.out', delay: 0.16 });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={backdropRef} className="playlist-backdrop" onClick={onClose}>
      <div ref={panelRef} className="playlist-selector" onClick={(ev) => ev.stopPropagation()}>
        <p className="ps-label">Choose a vibe</p>
        <div className="ps-list">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              className={`ps-row${activePlaylistId === playlist.id ? ' ps-row--active' : ''}`}
              onClick={() => onSelect(playlist)}
              type="button"
            >
              <span className="ps-avatar" style={{ backgroundImage: `url(${playlist.background})` }} />
              <span className="ps-info">
                <span className="ps-name">{playlist.name}</span>
                <span className="ps-sub">{activePlaylistId === playlist.id ? 'Now Playing' : 'Tap to switch'}</span>
              </span>
              {activePlaylistId === playlist.id && <span className="ps-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const sceneRef = useRef(null);
  const youtubeContainerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const signageRef = useRef(null);
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const defaultTrackInfo = { title: 'खालीपन', artist: 'खालीपन', color: '#e7b158', artwork: '', index: 0 };
  const [trackInfo, setTrackInfo] = useState(defaultTrackInfo);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [clock, setClock] = useState('');
  const [playerReady, setPlayerReady] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(PLAYLISTS[0]);
  const [playlistSelectorOpen, setPlaylistSelectorOpen] = useState(false);
  const playlistRequestRef = useRef(0);
  const playerInstanceIdRef = useRef(0);
  const autoPlayOnReadyRef = useRef(false);
  const playlistItemsRef = useRef([]);
  const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quote = quotes[trackInfo.index % quotes.length];

  const updateProgressFromPlayer = (player) => {
    if (!player || !player.getCurrentTime || !player.getDuration) return;
    setProgress({
      current: Number(player.getCurrentTime()) || 0,
      duration: Number(player.getDuration()) || 0
    });
  };

  const syncTrackInfo = (player) => {
    if (!player || !player.getVideoData) {
      setTrackInfo((current) => current || defaultTrackInfo);
      return;
    }

    const videoData = player.getVideoData();
    const playlistIndex = typeof player.getPlaylistIndex === 'function' ? player.getPlaylistIndex() : 0;
    const videoId = videoData?.video_id;
    const playlistItem = playlistItemsRef.current[playlistIndex];
    const youtubeTitle = playlistItem?.snippet?.title || videoData?.title || 'खालीपन';
    const youtubeArtist = playlistItem?.snippet?.videoOwnerChannelTitle || 'खालीपन';
    const youtubeThumbnail = playlistItem?.snippet?.thumbnails?.high?.url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

    setTrackInfo({
      title: youtubeTitle,
      artist: youtubeArtist,
      color: '#e7b158',
      artwork: youtubeThumbnail || '',
      index: playlistIndex
    });

    updateProgressFromPlayer(player);
  };

  const createYouTubePlayer = (playlistIdOverride, shouldAutoPlay = false) => {
    if (!youtubeContainerRef.current || !window.YT || !window.YT.Player) return;

    const nextPlayerInstanceId = ++playerInstanceIdRef.current;
    const playlistId = normalizePlaylistId(playlistIdOverride || activePlaylist?.youtubePlaylistId || PLAYLISTS[0].youtubePlaylistId);
    autoPlayOnReadyRef.current = shouldAutoPlay;

    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.stopVideo();
        youtubePlayerRef.current.destroy();
      } catch {
        // Ignore teardown errors during playlist swaps.
      }
      youtubePlayerRef.current = null;
    }

    const player = new window.YT.Player(youtubeContainerRef.current, {
      width: '0',
      height: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        listType: 'playlist',
        list: playlistId
      },
      events: {
        onReady: (event) => {
          if (nextPlayerInstanceId !== playerInstanceIdRef.current) {
            try {
              event.target.destroy();
            } catch {
              // Ignore stale player during quick playlist switches.
            }
            return;
          }

          setPlayerReady(true);
          youtubePlayerRef.current = event.target;
          syncTrackInfo(event.target);
          if (autoPlayOnReadyRef.current) {
            autoPlayOnReadyRef.current = false;
            try {
              event.target.playVideo();
              setPlaying(true);
            } catch {
              setPlaying(false);
            }
          } else {
            setPlaying(false);
          }
        },
        onStateChange: (event) => {
          if (nextPlayerInstanceId !== playerInstanceIdRef.current) return;

          const playerState = event.data;
          if (playerState === window.YT.PlayerState.PLAYING) {
            setPlaying(true);
          } else if (playerState === window.YT.PlayerState.PAUSED || playerState === window.YT.PlayerState.ENDED || playerState === window.YT.PlayerState.CUED) {
            setPlaying(false);
          }

          syncTrackInfo(event.target);
        },
        onError: () => {
          if (nextPlayerInstanceId !== playerInstanceIdRef.current) return;

          setPlaying(false);
          setProgress({ current: 0, duration: 0 });
          if (youtubePlayerRef.current && typeof youtubePlayerRef.current.nextVideo === 'function') {
            try {
              youtubePlayerRef.current.nextVideo();
            } catch {
              // Ignore next-video failures and keep UI alive.
            }
          }
        }
      }
    });

    youtubePlayerRef.current = player;
  };

  useLayoutEffect(() => {
    if (!motionAllowed() || !playerRef.current || !signageRef.current) return undefined;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline.from('.topbar', { y: -20, opacity: 0, duration: 0.55 })
        .from(signageRef.current, { y: 36, opacity: 0, duration: 0.8 }, '-=0.25')
        .from(playerRef.current, { y: 44, opacity: 0, scale: 0.97, duration: 0.7 }, '-=0.45');
    }, sceneRef);
    return () => context.revert();
  }, []);

  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date()).toLowerCase());
    updateClock();
    const timer = setInterval(updateClock, 10_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++playlistRequestRef.current;

    const loadPlaylistMetadata = async () => {
      if (!activePlaylist?.youtubePlaylistId) {
        setPlaylistItems([]);
        playlistItemsRef.current = [];
        return;
      }

      const items = await fetchPlaylistMetadata(activePlaylist.youtubePlaylistId);
      if (!cancelled && requestId === playlistRequestRef.current) {
        playlistItemsRef.current = items;
        setPlaylistItems(items);
      }
    };

    setPlaylistItems([]);
    playlistItemsRef.current = [];
    loadPlaylistMetadata();

    return () => {
      cancelled = true;
    };
  }, [activePlaylist]);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createYouTubePlayer(activePlaylist?.youtubePlaylistId || PLAYLISTS[0].youtubePlaylistId);
      return undefined;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (existingScript) {
      existingScript.addEventListener('load', () => createYouTubePlayer(activePlaylist?.youtubePlaylistId || PLAYLISTS[0].youtubePlaylistId), { once: true });
      return () => existingScript.removeEventListener('load', () => createYouTubePlayer(activePlaylist?.youtubePlaylistId || PLAYLISTS[0].youtubePlaylistId));
    }

    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      createYouTubePlayer(activePlaylist?.youtubePlaylistId || PLAYLISTS[0].youtubePlaylistId);
    };

    return () => {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch {
          // Ignore teardown errors.
        }
        youtubePlayerRef.current = null;
      }
      setPlayerReady(false);
    };
  }, []);

  useEffect(() => {
    if (!playerReady || !youtubePlayerRef.current) return undefined;

    if (!playing) {
      updateProgressFromPlayer(youtubePlayerRef.current);
      return undefined;
    }

    const intervalId = setInterval(() => {
      if (!youtubePlayerRef.current || !youtubePlayerRef.current.getCurrentTime) return;
      const currentState = youtubePlayerRef.current.getPlayerState();
      if (currentState === window.YT.PlayerState.PLAYING) {
        updateProgressFromPlayer(youtubePlayerRef.current);
        syncTrackInfo(youtubePlayerRef.current);
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [playing, playerReady]);

  const play = () => {
    const player = youtubePlayerRef.current;
    if (!player || typeof player.playVideo !== 'function') return;

    try {
      player.playVideo();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const togglePlay = () => {
    const player = youtubePlayerRef.current;
    if (!player) return;

    if (playing) {
      player.pauseVideo();
      setPlaying(false);
      return;
    }

    play();
  };

  const next = () => {
    const player = youtubePlayerRef.current;
    if (player && typeof player.nextVideo === 'function') {
      player.nextVideo();
      setPlaying(true);
    }
  };

  const previous = () => {
    const player = youtubePlayerRef.current;
    if (player && typeof player.previousVideo === 'function') {
      player.previousVideo();
      setPlaying(true);
    }
  };

  const switchPlaylist = (selectedPlaylist) => {
    if (!selectedPlaylist) {
      setPlaylistSelectorOpen(false);
      return;
    }

    const playlistId = normalizePlaylistId(selectedPlaylist.youtubePlaylistId);
    setPlaylistItems([]);
    setActivePlaylist({ ...selectedPlaylist, youtubePlaylistId: playlistId });
    setPlaylistSelectorOpen(false);
    setProgress({ current: 0, duration: 0 });
    setPlaying(false);
    setTrackInfo({ ...defaultTrackInfo, title: selectedPlaylist.name, artist: 'Loading...' });

    if (window.YT && window.YT.Player) {
      createYouTubePlayer(playlistId, true);
      return;
    }
  };

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') setPlaylistSelectorOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const seek = (event) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const player = youtubePlayerRef.current;
    const duration = progress.duration || 0;

    if (!duration || !player || typeof player.seekTo !== 'function') return;

    const ratio = (event.clientX - left) / width;
    const nextTime = Math.min(Math.max(ratio, 0), 1) * duration;
    player.seekTo(nextTime, true);
    setProgress({ current: nextTime, duration });
  };

  return (
    <main className="scene" ref={sceneRef}>
      <div className="playlist-background" style={{ backgroundImage: `url(${activePlaylist.background})` }} />

      <div className="sky" /><div className="grain" /><div className="vignette" />
      <div ref={youtubeContainerRef} className="youtube-player" aria-hidden="true" />
      <header className="topbar">
        <time className="clock">{clock}</time>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LiveUsers />
          <div className="links"><a className="chip" href="https://open.spotify.com/playlist/7DDMXrDijZD95GlYRnL7Zg" target="_blank" rel="noreferrer">Spotify</a></div>
        </div>
      </header>
      <section ref={signageRef} className="signage">
        <h1>खालीपन</h1>
        <p><TypeAnimation key={quote} sequence={[quote]} speed={55} cursor={false} wrapper="span" /></p>
      </section>
      <section className="player-wrap">
        <button
          className="playlist-hint"
          onClick={() => setPlaylistSelectorOpen(true)}
          aria-label="Change playlist"
        >
          <span className="playlist-hint-dot" />
          Click to change playlist
        </button>
        <div ref={playerRef} className={`player${playing ? ' is-playing' : ''}`}>
          <div className="art">
            {trackInfo.artwork ? <img src={trackInfo.artwork} alt={`${trackInfo.title} album artwork`} /> : <VinylArt color={trackInfo.color} />}
          </div>
          <div className="meta">
            <div
              className="meta-info"
              onClick={() => setPlaylistSelectorOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setPlaylistSelectorOpen(true); } }}
            >
              <div className="title">{trackInfo.title}</div>
              <div className="artist">{activePlaylist.name}</div>
            </div>
            <div className="progress-row">
              <div className="progress-bar" onClick={seek} role="slider" aria-label="Seek through song" tabIndex="0">
                <div className="progress-fill" style={{ width: `${progress.duration ? (progress.current / progress.duration) * 100 : 0}%` }} />
              </div>
              <time className="time">{formatTime(progress.current)} / {progress.duration ? formatTime(progress.duration) : '--:--'}</time>
            </div>
          </div>
          <div className="controls">
            <button className="ctrl-btn" onClick={previous} aria-label="Previous song">◀</button>
            <button className="play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
            <button className="ctrl-btn" onClick={next} aria-label="Next song">▶</button>
          </div>
        </div>
      </section>
      <PlaylistSelector isOpen={playlistSelectorOpen} onClose={() => setPlaylistSelectorOpen(false)} playlists={PLAYLISTS} activePlaylistId={activePlaylist.id} onSelect={switchPlaylist} />
      <span className="signature" aria-hidden="true">Sachin</span>
    </main>
  );
}
