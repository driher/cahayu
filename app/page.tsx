"use client";

import SplashScreen from "@/components/SplashScreen";
import { useEffect, useRef, useState } from "react";

const STREAM_URL = "https://c4.siar.us:8092/live";
const ICECAST = "https://c4.siar.us:8092/status-json.xsl";
const DEFAULT_COVER = "/logo_radio_sehati.png";
const WEBSITE_URL = "https://radiosehati.com";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // =========================
  // SPLASH ANTI LOOP LOCK
  // =========================
  const [splashDone, setSplashDone] = useState(false);
  const splashLocked = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const [title, setTitle] = useState("Radio Sehati");
  const [artist, setArtist] = useState("-");
  const [listeners, setListeners] = useState(0);
  const [volume, setVolume] = useState(80);

  const [cover, setCover] = useState(DEFAULT_COVER);

  const isLongTitle = title.length > 35;

  // =========================
  // SPLASH CONTROL (FIX LOOP)
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!splashLocked.current) {
        splashLocked.current = true;
        setSplashDone(true);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // =========================
  // VOLUME SYNC
  // =========================
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // =========================
  // PLAY CONTROL
  // =========================
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
      console.log("PLAY ERROR:", err);
      setPlaying(false);
    } finally {
      setBuffering(false);
    }
  };

  // =========================
  // SHARE WHATSAPP
  // =========================
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `🎧 Sedang mendengarkan ${title} - ${artist}
📻 Radio Sehati Live
🔊 ${WEBSITE_URL}`
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // =========================
  // OPEN WEBSITE
  // =========================
  const openWebsite = () => {
    window.open(WEBSITE_URL, "_blank", "noopener,noreferrer");
  };

  // =========================
  // SMART CLEAN FUNCTION
  // =========================
  const cleanArtist = (text: string) => {
    return (text || "-")
      .replace(/^\d+\s*[-.)]?\s*/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const cleanTitle = (text: string) => {
    return (text || "Radio Sehati")
      .replace(/\(.*?\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // =========================
  // COVER FETCH
  // =========================
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

  // =========================
  // METADATA STREAM
  // =========================
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

      let artistName = "-";
      let songTitle = raw;

      if (typeof raw === "string" && raw.includes(" - ")) {
        const parts = raw.split(" - ");
        artistName = parts[0]?.trim();
        songTitle = parts.slice(1).join(" - ").trim();
      }

      // =========================
      // CLEAN SMART METADATA
      // =========================
      artistName = cleanArtist(artistName);
      songTitle = cleanTitle(songTitle);

      setArtist(artistName);
      setTitle(songTitle);
      setListeners(Number(live?.listeners ?? 0));

      fetchCover(artistName, songTitle);

      if (!splashLocked.current) {
        splashLocked.current = true;
        setSplashDone(true);
      }
    } catch (err) {
      console.log("ICECAST ERROR:", err);

      if (!splashLocked.current) {
        splashLocked.current = true;
        setSplashDone(true);
      }
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchMeta();
    const interval = setInterval(fetchMeta, 10000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <>
      {!splashDone && <SplashScreen />}

      <div
        className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-100 text-neutral-900 px-4 transition-opacity duration-700 ${
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
              Guyub Rukun Forever
            </p>

            {/* COVER */}
            <div className="relative flex justify-center my-6">
              <img
                src={cover}
                className="absolute w-64 h-64 object-cover blur-3xl opacity-30"
              />
              <img
                src={cover}
                className="relative w-56 h-56 rounded-2xl object-cover shadow-lg border border-white/40"
              />
            </div>

            {/* LIVE STATUS */}
            <div className="flex justify-center mt-4">
              {playing ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white shadow-lg">
                  <span className="w-3 h-3 bg-white rounded-full animate-ping" />
                  <span className="text-sm font-semibold">LIVE</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-full bg-gray-300 text-gray-700 text-sm">
                  OFF AIR
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="mt-6 bg-white/50 rounded-2xl p-4 border border-white/40">
              <p className="text-lg font-semibold text-amber-700 truncate">
                {title}
              </p>
              <p className="text-sm text-neutral-700">{artist}</p>
              <p className="text-xs text-neutral-500 mt-2">
                👥 {listeners} listeners
              </p>
            </div>

            {/* PLAY */}
            <div className="flex justify-center mt-6">
              <button
                onClick={toggle}
                className="w-24 h-24 rounded-full bg-amber-500 text-white shadow-[0_0_40px_rgba(245,158,11,0.6)] active:scale-95"
              >
                {playing ? "⏸" : "▶"}
              </button>
            </div>

            {/* VOLUME */}
            <div className="mt-5 px-6 flex items-center gap-3">
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
                className="w-12 h-12 rounded-full bg-green-500 text-white text-xl shadow-lg hover:scale-105"
              >
                📲
              </button>

              <button
                onClick={openWebsite}
                className="w-12 h-12 rounded-full bg-blue-500 text-white text-xl shadow-lg hover:scale-105"
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
    </>
  );
}