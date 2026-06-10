"use client";

import { useEffect, useRef, useState } from "react";

const STREAM_URL = "http://c4.siar.us:8092/live";
const ICECAST = "http://c4.siar.us:8092/status-json.xsl";

const DEFAULT_COVER = "/logo_radio_sehati.png";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const [title, setTitle] = useState("Radio Sehati");
  const [artist, setArtist] = useState("-");
  const [listeners, setListeners] = useState(0);

  const [cover, setCover] = useState(DEFAULT_COVER);

  const isLongTitle = title.length > 35;

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

  const fetchCover = async (artistName: string, songTitle: string) => {
    try {
      if (!artistName || artistName === "-") {
        setCover(DEFAULT_COVER);
        return;
      }

      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          `${artistName} ${songTitle}`
        )}&entity=song&limit=1`
      );

      const data = await res.json();

      const artwork = data?.results?.[0]?.artworkUrl100;

      if (artwork) {
        setCover(artwork.replace("100x100", "600x600"));
      } else {
        setCover(DEFAULT_COVER);
      }
    } catch {
      setCover(DEFAULT_COVER);
    }
  };

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

      if (
        typeof raw === "string" &&
        raw.includes(" - ")
      ) {
        const parts = raw.split(" - ");

        artistName = parts[0]?.trim();
        songTitle = parts.slice(1).join(" - ").trim();
      }

      setArtist(artistName);
      setTitle(songTitle);
      setListeners(Number(live?.listeners ?? 0));

      fetchCover(artistName, songTitle);
    } catch (err) {
      console.log("ICECAST ERROR:", err);

      setArtist("-");
      setTitle("Radio Sehati");
      setListeners(0);
      setCover(DEFAULT_COVER);
    }
  };

  useEffect(() => {
    fetchMeta();

    const interval = setInterval(fetchMeta, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-100 text-neutral-900 px-4">
      <div className="absolute inset-0 bg-black/25" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/55 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl text-center">

          <h1 className="text-2xl font-semibold tracking-wide">
            Radio Streaming Sehati
          </h1>

          <p className="text-xs text-neutral-600 mt-1">
            Guyub Rukun Forever
          </p>

          <div className="flex justify-center my-6">
            <img
              src={cover}
              alt="Album Cover"
              className="w-56 h-56 rounded-2xl object-cover shadow-lg border border-white/40"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  DEFAULT_COVER;
              }}
            />
          </div>

          <span
            className={`px-4 py-1 rounded-full text-xs font-medium ${
              playing
                ? "bg-amber-500 text-white"
                : "bg-white/70 text-neutral-600"
            }`}
          >
            {playing ? "LIVE ON AIR" : "OFF AIR"}
          </span>

          <div className="mt-6 bg-white/50 rounded-2xl p-4 border border-white/40">

            {isLongTitle ? (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="marquee-track">
                  <span className="text-lg font-semibold text-amber-700">
                    {title}
                  </span>

                  <span
                    className="text-lg font-semibold text-amber-700"
                    aria-hidden="true"
                  >
                    {title}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-lg font-semibold text-amber-700">
                {title}
              </p>
            )}

            <p className="text-sm text-neutral-700 mt-2 truncate">
              {artist}
            </p>

            <p className="text-xs text-neutral-500 mt-2">
              👥 {listeners} listeners
            </p>

          </div>

          <button
            onClick={toggle}
            className="mt-6 w-full py-3 rounded-xl font-semibold transition active:scale-95 shadow-lg bg-amber-500 text-white hover:bg-amber-600"
          >
            {playing ? "Pause Radio" : "Play Radio"}
          </button>

          {buffering && (
            <p className="text-xs mt-3 text-amber-700">
              Connecting stream...
            </p>
          )}

          <p className="mt-5 text-xs text-neutral-500">
            © 2026 Radio Sehati
          </p>

        </div>
      </div>

      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        onPlaying={() => {
          setPlaying(true);
          setBuffering(false);
        }}
        onWaiting={() => {
          setBuffering(true);
        }}
        onPause={() => {
          setPlaying(false);
        }}
        onError={() => {
          setPlaying(false);
          setBuffering(false);
        }}
      />
    </div>
  );
}