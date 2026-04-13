"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";

/**
 * Renders a live timer into a Picture-in-Picture window using a canvas-backed
 * video element.  Uses setInterval (not requestAnimationFrame) so the canvas
 * keeps updating even when the parent tab is in the background.
 */
export function usePictureInPicture() {
  const [pipActive, setPipActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
    }
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
    setPipActive(false);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D) => {
    const store = useTaskStore.getState();
    const session = store.activeSession;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);

    if (!session) {
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No active timer", w / 2, h / 2);
      return;
    }

    let elapsed = session.accumulatedTime;
    if (!session.isPaused) {
      elapsed += Math.floor((Date.now() - session.lastResumeTime) / 1000);
    }

    const statusColor = session.isPaused ? "#f59e0b" : "#4ade80";
    const statusText = session.isPaused ? "PAUSED" : "FOCUSING";

    ctx.beginPath();
    ctx.arc(w / 2 - 52, 36, 5, 0, Math.PI * 2);
    ctx.fillStyle = statusColor;
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(statusText, w / 2 + 4, 36);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 52px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatTime(elapsed), w / 2, h / 2 + 8);

    ctx.fillStyle = "#475569";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FlowState", w / 2, h - 20);
  }, []);

  const startLoop = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawFrame(ctx);
      intervalRef.current = setInterval(() => {
        drawFrame(ctx);
      }, 1000);
    },
    [drawFrame]
  );

  const togglePip = useCallback(async () => {
    if (pipActive) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      cleanup();
      return;
    }

    if (!document.pictureInPictureEnabled) {
      alert("Picture-in-Picture is not supported in this browser.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 140;
    canvas.style.display = "none";
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      cleanup();
      return;
    }

    drawFrame(ctx);

    const video = document.createElement("video");
    video.style.display = "none";
    video.muted = true;
    video.autoplay = true;
    document.body.appendChild(video);
    videoRef.current = video;

    const stream = canvas.captureStream(30);
    video.srcObject = stream;

    try {
      await video.play();
      await video.requestPictureInPicture();
      setPipActive(true);
      startLoop(ctx);

      video.addEventListener("leavepictureinpicture", () => {
        cleanup();
      });
    } catch {
      cleanup();
    }
  }, [pipActive, cleanup, drawFrame, startLoop]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const isSupported =
    typeof document !== "undefined" && !!document.pictureInPictureEnabled;

  return { pipActive, togglePip, isSupported };
}
