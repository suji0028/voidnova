import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { gsap } from 'gsap';
import LiveUsers from './LiveUsers';

const assets = import.meta.glob('../assets/**/*.{opus,mp4,jpg}', {
  eager: true,
  query: '?url',
  import: 'default'
});

const asset = (file) => assets[`../assets/${file}`];

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

const playlist = [
  ['Kabhi Jo Baadal', 'kabhi_jo_badal.opus', '#c1362b', 'img/arijit.jpg'],
  ['Kabhi Kabhi Aditi', 'kabh_kabhi_aditi.opus', '#e7b158', 'img/arijit.jpg'],
  ['Khamosiya', 'khamosiya.opus', '#3b6a3a', 'img/khamosiyan.jpg'],
  ['Labon Ko', 'labon_ko.opus', '#4a7fa0', 'img/labon_ko.jpg'],
  ['Maahi', 'maahi.opus', '#7d2119', 'img/raaz.jpg'],
  ['Mujhse Mohabbat', 'mujhse_mohabbat.opus', '#b65a35', 'img/mujhse_mohabbat.jpg'],
  ['Saaiyaan', 'saaiyaan.opus', '#7b4fa3', 'img/saiyaan.jpg'],
  ['Tera Mera Rishta', 'tera_mera_rishta.opus', '#547f76', 'img/tera_mera_rishta.jpg'],
  ['Tujhe Bhula Diya', 'tujhe_bhula_diya.opus', '#d67545', 'img/arijit.jpg'],
  ['Tu Hai Ki Nahi', 'tu_hai_ki_nahi.opus', '#4d658e', 'img/roy.jpg'],
  ['Ye Jo Mohabbat Hai', 'ye_jo_mohabbat_hai.opus', '#8a5637', 'img/saiyaan.jpg'],
  ['Zara Sa', 'zara_sa.opus', '#a5405d', 'img/jannat.jpg']
].map(([title, src, color, artwork]) => ({ title, src: asset(src), color, artwork: artwork && asset(artwork) }));

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const formatTime = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function VinylArt({ color }) {
  return <svg viewBox="0 0 60 60" aria-hidden="true"><rect width="60" height="60" fill={color}/><circle cx="30" cy="30" r="17" fill="rgba(0,0,0,.35)"/><circle cx="30" cy="30" r="12" fill="rgba(0,0,0,.25)"/><circle cx="30" cy="30" r="4" fill="#f7ecd9"/></svg>;
}

export default function App() {
  const sceneRef = useRef(null);
  const audioRef = useRef(null);
  const autoplayRef = useRef(false);
  const signageRef = useRef(null);
  const playerRef = useRef(null);
  const artRef = useRef(null);
  const metadataRef = useRef(null);
  const order = useMemo(() => shuffle(playlist.map((_, index) => index)), []);
  const [orderIndex, setOrderIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [clock, setClock] = useState('');
  const song = playlist[order[orderIndex]];
  const quote = quotes[order[orderIndex]];
  const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useLayoutEffect(() => {
    if (!motionAllowed()) return undefined;
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
    const audio = audioRef.current;
    audio.load();
    setPlaying(false);
    setProgress({ current: 0, duration: 0 });
    if (autoplayRef.current) play();
  }, [song]);

  const play = async () => {
    try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); }
  };
  const togglePlay = () => playing ? (audioRef.current.pause(), setPlaying(false)) : play();
  const next = (autoplay = playing) => {
    autoplayRef.current = autoplay;
    setOrderIndex((index) => (index + 1) % order.length);
  };
  const previous = (autoplay = playing) => {
    autoplayRef.current = autoplay;
    setOrderIndex((index) => (index - 1 + order.length) % order.length);
  };
  const seek = (event) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    if (progress.duration) audioRef.current.currentTime = ((event.clientX - left) / width) * progress.duration;
  };

  return <main className="scene">
    <video className="background-video" autoPlay muted loop playsInline aria-hidden="true"><source src={asset('void.mp4')} type="video/mp4" /></video>
    <div className="sky" /><div className="grain" /><div className="vignette" />
    <header className="topbar">
      <time className="clock">{clock}</time>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {/* <LiveUsers /> */}
        <div className="links"><a className="chip" href="https://open.spotify.com/playlist/7DDMXrDijZD95GlYRnL7Zg" target="_blank" rel="noreferrer">Spotify</a></div>
      </div>
    </header>
    <section className="signage"><h1>Void Nova</h1><p><TypeAnimation key={quote} sequence={[quote]} speed={55} cursor={false} wrapper="span" /></p></section>
    <section className="player-wrap"><div className={`player${playing ? ' is-playing' : ''}`}>
      <div className="art">{song.artwork ? <img src={song.artwork} alt={`${song.title} album artwork`} /> : <VinylArt color={song.color} />}</div>
      <div className="meta"><div className="title">{song.title}</div><div className="artist">Void Nova</div><div className="progress-row"><div className="progress-bar" onClick={seek} role="slider" aria-label="Seek through song" tabIndex="0"><div className="progress-fill" style={{ width: `${progress.duration ? (progress.current / progress.duration) * 100 : 0}%` }} /></div><time className="time">{formatTime(progress.current)} / {progress.duration ? formatTime(progress.duration) : '--:--'}</time></div></div>
      <div className="controls"><button className="ctrl-btn" onClick={previous} aria-label="Previous song">◀</button><button className="play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button><button className="ctrl-btn" onClick={next} aria-label="Next song">▶</button></div>
    </div></section>
    <audio ref={audioRef} src={song.src} preload="metadata" onLoadedMetadata={(event) => setProgress({ current: 0, duration: event.currentTarget.duration })} onTimeUpdate={(event) => setProgress({ current: event.currentTarget.currentTime, duration: event.currentTarget.duration })} onEnded={() => next(true)} onError={() => setPlaying(false)} />
  </main>;
}
