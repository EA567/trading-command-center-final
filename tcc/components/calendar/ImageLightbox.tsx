"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2))), []);
  const reset = useCallback(() => setZoom(1), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, zoomIn, zoomOut, reset]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }, [zoomIn, zoomOut]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-[slideIn_0.15s_ease-out]">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1">
          <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom out" className="p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
            <ZoomOut size={16} />
          </button>
          <span className="px-2 text-xs font-mono text-zinc-400 min-w-[42px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} title="Zoom in" className="p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
            <ZoomIn size={16} />
          </button>
          <button onClick={reset} title="Reset zoom" className="p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors">
            <RotateCcw size={14} />
          </button>
        </div>
        <button onClick={onClose} title="Close" className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div
        className="relative w-full h-full flex items-center justify-center p-8 sm:p-16 overflow-auto"
        onWheel={onWheel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Journal attachment"
          draggable={false}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-150 ease-out select-none"
          style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? "grab" : "default" }}
        />
      </div>

      <p className="absolute bottom-4 inset-x-0 text-center text-[11px] text-zinc-500">
        Scroll or use the controls to zoom · Esc to close
      </p>
    </div>
  );
}
