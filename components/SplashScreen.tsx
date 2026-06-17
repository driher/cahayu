"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
    }, 2000); // 2 detik splash

    return () => clearTimeout(timer);
  }, []);

  if (hide) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-100">
      
      <div className="text-center animate-pulse">
        
        {/* Logo */}
        <img
          src="/logo_radio_sehati.png"
          alt="Radio Sehati"
          className="w-28 h-28 mx-auto rounded-2xl shadow-lg"
        />

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold text-amber-700">
          Radio Sehati
        </h1>

        <p className="text-sm text-neutral-600 mt-1">
          Streaming Radio Online
        </p>

        {/* Loading dots */}
        <div className="flex justify-center mt-4 gap-1">
          <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>

      </div>
    </div>
  );
}