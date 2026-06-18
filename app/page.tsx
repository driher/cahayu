"use client";

import SplashScreen from "@/components/SplashScreen";
import { useEffect, useRef, useState } from "react";

const STREAM_URL = "https://c4.siar.us:8092/live";
const ICECAST = "https://c4.siar.us:8092/status-json.xsl";
const DEFAULT_COVER = "/logo_radio_sehati.png";
const WEBSITE_URL = "https://radiosehati.com";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const splashLock = useRef(false);

  const [splashDone, setSplashDone] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const [title, setTitle] = useState("Radio Sehati");
  const [artist, setArtist] = useState("-");

  const [listeners, setListeners] = useState(0);
  const [volume, setVolume] = useState(80);
  const [cover, setCover] = useState(DEFAULT_COVER);

  // ======================
  // SPLASH ANTI LOOP FIX
  // ======================
  useEffect(() => {
    const t = setTimeout(() => {
      if (!splashLock.current) {
        splashLock.current = true;
        setSplashDone(true);
      }
    }, 1800);

    return () => clearTimeout(t);
  }, []);

  // ======================
  // VOLUME CONTROL
  // ======================
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // ======================
  // PLAY CONTROL
  // ======================
  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (!playing) {
        setBuffering(true);
        audio.load();
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setPlaying(false);
    } finally {
      setBuffering(false);
    }
  };

  // ======================
  // SHARE WA
  // ======================
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Saya sedang mendengarkan ${title} - ${artist}
di Radio Streaming Sehati Live. Dengar via ${WEBSITE_URL}`
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // ======================
  // OPEN WEBSITE
  // ======================
  const openWebsite = () => {
    window.open(WEBSITE_URL, "_blank", "noopener,noreferrer");
  };

  const openWhatsApp = () => {
  const text = encodeURIComponent(
    "Halo Radio Streaming Sehati"
  );

  window.open(
    `https://wa.me/628882282008?text=${text}`,
    "_blank"
  );
};

  // ======================
  // CLEAN FOR COVER SEARCH
  // ======================
  const cleanForSearch = (text: string) => {
    return (text || "-")
      .replace(/^\d+\s*[-.)]?\s*/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ======================
  // COVER FETCH
  // ======================
  const fetchCover = async (artistName: string, songTitle: string) => {
    try {
      if (!artistName || artistName === "-") {
        setCover(DEFAULT_COVER);
        return;
      }

      const query = encodeURIComponent(`${artistName} ${songTitle}`);

      const res = await fetch(
        `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`
      );

      const data = await res.json();
      const artwork = data?.results?.[0]?.artworkUrl100;

      setCover(
        artwork ? artwork.replace("100x100", "600x600") : DEFAULT_COVER
      );
    } catch {
      setCover(DEFAULT_COVER);
    }
  };

  // ======================
  // FETCH METADATA
  // ======================
  const fetchMeta = async () => {
    try {
      const res = await fetch(ICECAST);
      const data = await res.json();

      const source = data?.icestats?.source;

      const live = Array.isArray(source)
        ? source.find((s: any) => s?.listenurl) || source[0]
        : source;

      const raw =
        live?.title ||
        live?.yp_currently_playing ||
        "Radio Sehati";

      let displayArtist = "-";
      let displayTitle = raw;

      if (typeof raw === "string" && raw.includes(" - ")) {
        const parts = raw.split(" - ");
        displayArtist = parts[0]?.trim();
        displayTitle = parts.slice(1).join(" - ").trim();
      }

      setArtist(displayArtist);
      setTitle(displayTitle);
      setListeners(Number(live?.listeners ?? 0));

      const searchArtist = cleanForSearch(displayArtist);
      const searchTitle = cleanForSearch(displayTitle);

      fetchCover(searchArtist, searchTitle);

      if (!splashLock.current) {
        splashLock.current = true;
        setSplashDone(true);
      }
    } catch {
      if (!splashLock.current) {
        splashLock.current = true;
        setSplashDone(true);
      }
    }
  };

  useEffect(() => {
    fetchMeta();
    const i = setInterval(fetchMeta, 10000);
    return () => clearInterval(i);
  }, []);

  // ======================
  // MARQUEE PRO LOGIC
  // ======================
  const isLong = (text: string) => text.length > 30;

  const getSpeed = (text: string) => {
    if (text.length < 40) return "0s";
    if (text.length < 80) return "12s";
    if (text.length < 120) return "9s";
    return "7s";
  };

  return (
    <>
      {!splashDone && <SplashScreen />}

      <div
        className={`min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-100 transition-opacity duration-700 ${
          !splashDone ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative w-full max-w-md">
          <div className="bg-white/55 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl text-center">

            <h1 className="text-2xl font-semibold">
              Radio Streaming Sehati
            </h1>

            <p className="text-xs text-neutral-600 mt-1">
              Guyub Rukun Forever..!
            </p>

            {/* COVER */}
            <div className="relative flex justify-center my-6">
              <img
                src={cover}
                className="absolute w-64 h-64 blur-3xl opacity-30 object-cover"
              />
              <img
                src={cover}
                className="relative w-56 h-56 rounded-2xl object-cover shadow-lg"
              />
            </div>

            {/* LIVE */}
            <div className="flex justify-center mt-3">
              {playing ? (
                <div className="px-4 py-2 bg-red-500 text-white rounded-full flex items-center gap-2">
                  <span className="w-3 h-3 bg-white rounded-full animate-ping" />
                  LIVE
                </div>
              ) : (
                <div className="px-4 py-2 bg-gray-300 rounded-full">
                  OFF AIR
                </div>
              )}
            </div>

            {/* MARQUEE PRO */}
            <div className="mt-5 bg-white/40 rounded-2xl p-4 shadow-md overflow-hidden">

              {isLong(title) ? (
                <div
                  className="whitespace-nowrap font-semibold text-amber-700"
                  style={{
                    animation: `marquee ${getSpeed(title)} linear infinite`,
                  }}
                >
                  {title} • {title} • {title} • {title}
                </div>
              ) : (
                <p className="font-semibold text-amber-700">
                  {title}
                </p>
              )}

              <p className="text-sm text-neutral-700">{artist}</p>

              <p className="text-xs mt-1 text-gray-500">
                👥 {listeners} listeners
              </p>
            </div>

            {/* PLAY */}
            <div className="flex justify-center mt-6">
              <button
                onClick={toggle}
                className="w-24 h-24 rounded-full bg-amber-500 text-white shadow-lg active:scale-95"
              >
                {playing ? "⏸" : "▶"}
              </button>
            </div>

            {/* VOLUME */}
            <div className="mt-5 flex items-center gap-3 px-6">
              🔊
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-300 rounded-full"
              />
              <span className="text-xs w-8">{volume}</span>
            </div>

            {/* ACTION */}
            <div className="flex justify-center gap-4 mt-5">
              <button
                onClick={shareToWhatsApp}
                className="w-12 h-12 bg-green-500 text-white rounded-full"
              >
                📲
              </button>

              <button
                onClick={openWebsite}
                className="w-12 h-12 bg-blue-500 text-white rounded-full"
              >
                🌐
              </button>
            </div>

            {buffering && (
              <p className="text-xs mt-3 text-amber-700">
                Connecting stream...
              </p>
            )}

          </div>
        </div>
{/* Floating WhatsApp */}
<button
  onClick={openWhatsApp}
  className="
    fixed
    bottom-6
    right-6
    z-50
    w-16
    h-16
    rounded-full
    bg-green-500
    text-white
    flex
    items-center
    justify-center
    shadow-xl
    hover:scale-110
    active:scale-95
    transition-all
    duration-300
  "
  aria-label="WhatsApp Radio Sehati"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="w-8 h-8 fill-current"
  >
    <path d="M16.04 4C9.39 4 4 9.28 4 15.79c0 2.29.67 4.42 1.82 6.22L4 28l6.18-1.62a12.2 12.2 0 0 0 5.86 1.49C22.69 27.87 28 22.59 28 16.08S22.69 4 16.04 4zm6.92 17.15c-.29.81-1.68 1.55-2.32 1.65-.6.09-1.36.13-2.19-.13-.5-.15-1.15-.37-1.98-.72-3.48-1.47-5.75-4.91-5.92-5.14-.16-.23-1.41-1.84-1.41-3.5 0-1.65.88-2.47 1.19-2.81.31-.34.68-.42.9-.42h.65c.21 0 .5-.08.77.57.29.7.98 2.42 1.06 2.6.09.18.15.39.03.62-.12.23-.18.38-.35.58-.17.2-.36.44-.51.59-.17.17-.34.35-.15.69.18.34.82 1.33 1.76 2.16 1.22 1.08 2.24 1.42 2.57 1.58.34.17.54.14.74-.08.2-.23.87-.99 1.1-1.33.23-.34.46-.28.77-.17.31.11 1.98.92 2.32 1.08.34.17.57.25.65.39.08.13.08.78-.21 1.59z"/>
  </svg>

  <span className="absolute -top-1 -right-1 flex h-4 w-4">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-200"></span>
  </span>
</button>

        <audio
          ref={audioRef}
          src={STREAM_URL}
          preload="none"
          onPlaying={() => setPlaying(true)}
          onWaiting={() => setBuffering(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setBuffering(false);
          }}
        />
      </div>

      {/* MARQUEE KEYFRAMES */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </>
  );
}