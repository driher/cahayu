"use client";

import { useEffect, useRef, useState } from "react";

const STREAM_URL = "https://c4.siar.us:8099/live";
const ICECAST = "https://c4.siar.us:8099/status-json.xsl";
const DEFAULT_COVER = "/logo_radio_cahayu.png";
const WEBSITE_URL = "https://mediacahayu.com";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const [title, setTitle] = useState("Radio Cahayu");
  const [artist, setArtist] = useState("-");
  const [listeners, setListeners] = useState(0);

  const [volume, setVolume] = useState(80);
  const [cover, setCover] = useState(DEFAULT_COVER);

  // ===========================
  // VOLUME
  // ===========================

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // ===========================
  // PLAY / PAUSE
  // ===========================

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
    } catch (err) {
      console.error(err);
      setPlaying(false);
    } finally {
      setBuffering(false);
    }
  };

  // ===========================
  // SHARE WHATSAPP
  // ===========================

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Saya sedang mendengarkan "${title}" - ${artist}
Dengarkan Radio Cahayu download sekarang di: https://play.google.com/store/apps/details?id=app.radio.cahayu atau klik
${WEBSITE_URL}`
    );

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ===========================
  // WEBSITE
  // ===========================

  const openWebsite = () => {
    window.open(
      WEBSITE_URL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ===========================
  // WHATSAPP
  // ===========================

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      "Halo Radio Cahayu..."
    );

    window.open(
      `https://wa.me/628179090969?text=${text}`,
      "_blank"
    );
  };

  // ===========================
  // CLEAN TITLE
  // ===========================

  const cleanForSearch = (text: string) => {
    return (text || "")
      .replace(/^\d+\s*[-.)]?\s*/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ===========================
  // COVER FROM ITUNES
  // ===========================

  const fetchCover = async (
    artistName: string,
    songTitle: string
  ) => {
    try {
      if (!artistName || artistName === "-") {
        setCover(DEFAULT_COVER);
        return;
      }

      const query = encodeURIComponent(
        `${artistName} ${songTitle}`
      );

      const res = await fetch(
        `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`
      );

      const data = await res.json();

      const artwork =
        data?.results?.[0]?.artworkUrl100;

      if (artwork) {
        setCover(
          artwork.replace(
            "100x100",
            "600x600"
          )
        );
      } else {
        setCover(DEFAULT_COVER);
      }
    } catch {
      setCover(DEFAULT_COVER);
    }
  };

  // ===========================
  // FETCH ICECAST METADATA
  // ===========================

  const fetchMeta = async () => {
    try {
      const res = await fetch(ICECAST);
      const data = await res.json();

      const source = data?.icestats?.source;

      const live = Array.isArray(source)
        ? source.find((s: any) => s.listenurl) ||
          source[0]
        : source;

      const raw =
        live?.title ||
        live?.yp_currently_playing ||
        "Radio Cahayu";

      let displayArtist = "-";
      let displayTitle = raw;

      if (
        typeof raw === "string" &&
        raw.includes(" - ")
      ) {
        const parts = raw.split(" - ");

        displayArtist = parts[0].trim();
        displayTitle = parts
          .slice(1)
          .join(" - ")
          .trim();
      }

      setArtist(displayArtist);
      setTitle(displayTitle);
      setListeners(
        Number(live?.listeners ?? 0)
      );

      fetchCover(
        cleanForSearch(displayArtist),
        cleanForSearch(displayTitle)
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeta();

    const interval = setInterval(
      fetchMeta,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  // ===========================
  // MARQUEE
  // ===========================

  const isLong = (text: string) =>
    text.length > 30;

  const getSpeed = (text: string) => {
    if (text.length < 40) return "0s";
    if (text.length < 80) return "12s";
    if (text.length < 120) return "9s";
    return "7s";
  };

return (
  <>
  <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sky-900 via-blue-700 to-orange-500 relative overflow-hidden">

    {/* Background Blur */}
    <img
      src={cover}
      alt=""
      className="absolute inset-0 w-full h-full object-cover blur-3xl scale-150 opacity-20"
    />

    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    <div className="relative w-full max-w-md">

      {/* Glass Card */}
      <div className="rounded-[32px] bg-white/15 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">

        {/* Header */}
        <div className="text-center">

          <h1 className="text-3xl font-bold text-white">
            Radio Cahayu
          </h1>

          <p className="text-blue-100 text-sm mt-1">
            Lagu Enaknya Yaa Disini
          </p>

        </div>

        {/* Album Cover */}
        <div className="relative flex justify-center mt-8">

          <img
            src={cover}
            alt={title}
            className="absolute w-72 h-72 object-cover rounded-full blur-3xl opacity-40 scale-125"
          />

          <img
            src={cover}
            alt={title}
            className="relative w-60 h-60 rounded-3xl shadow-2xl object-cover border-4 border-white/20"
          />

        </div>

        {/* LIVE */}
        <div className="flex justify-center mt-6">

          {playing ? (

            <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-full shadow-lg">

              <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>

              <span className="font-semibold tracking-wider">
                LIVE
              </span>

            </div>

          ) : (

            <div className="bg-gray-300 text-gray-700 px-5 py-2 rounded-full">

              KLIK PLAY

            </div>

          )}

        </div>

        {/* Song Info */}
        <div className="mt-6 rounded-2xl bg-white/15 p-4 overflow-hidden text-center">

          {isLong(title) ? (

            <div
              className="whitespace-nowrap font-bold text-xl text-white"
              style={{
                animation: `marquee ${getSpeed(title)} linear infinite`,
              }}
            >
              {title} • {title} • {title}
            </div>

          ) : (

            <h2 className="font-bold text-xl text-white">

              {title}

            </h2>

          )}

          <p className="text-blue-100 mt-2">

            {artist}

          </p>

          <p className="text-sm text-white/80 mt-2">

            👥 {listeners} Listeners

          </p>

        </div>

        {/* Play */}
        <div className="flex justify-center mt-8">

          <button
            onClick={toggle}
            className="w-24 h-24 rounded-full bg-orange-500 hover:bg-orange-600 transition-all duration-300 active:scale-95 shadow-2xl text-white text-4xl"
          >

            {playing ? "⏸" : "▶"}

          </button>

        </div>

        {/* Volume */}
        <div className="mt-8 flex items-center gap-4">

          <span className="text-white">

            🔊

          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) =>
              setVolume(Number(e.target.value))
            }
            className="flex-1 accent-orange-500"
          />

          <span className="text-white text-sm w-8">

            {volume}

          </span>

        </div>

        {/* Action Buttons */}
<div className="flex gap-4 mt-8">

  <button
    onClick={shareToWhatsApp}
    className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide shadow-xl transition-all duration-300"
  >
    Share
  </button>

  <button
    onClick={openWebsite}
    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-xl transition-all duration-300"
  >
    Website
  </button>

</div>
        {buffering && (

          <p className="text-center text-orange-200 text-sm mt-6 animate-pulse">

            Connecting to Radio Cahayu...

          </p>

        )}

      </div>

    </div>

    {/* Floating WhatsApp */}
    <button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 transition-all shadow-2xl text-white text-3xl flex items-center justify-center z-50"
    >

      💬

    </button>
          <audio
	  suppressHydrationWarning
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        onPlaying={() => {
          setPlaying(true);
          setBuffering(false);
        }}
        onWaiting={() => setBuffering(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setBuffering(false);
        }}
      />

    </div>

    <style jsx global>{`
      @keyframes marquee {
        0% {
          transform: translateX(100%);
        }

        100% {
          transform: translateX(-100%);
        }
      }

      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.35);
      }

      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: #f97316;
        cursor: pointer;
      }

      input[type="range"]::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border: 0;
        border-radius: 9999px;
        background: #f97316;
        cursor: pointer;
      }
    `}</style>
</>
  );
}