"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered");

          reg.update();

          setInterval(() => {
            reg.update();
          }, 60000);
        })
        .catch((err) => {
          console.error("SW Error:", err);
        });
    }
  }, []);

  return null;
}