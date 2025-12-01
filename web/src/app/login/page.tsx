"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Film sprocket holes component
function SprocketHoles({ side }: { side: "left" | "right" }) {
  return (
    <motion.div
      className={`absolute top-0 bottom-0 ${side === "left" ? "left-4" : "right-4"} w-3 flex flex-col justify-center gap-6 overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2.5 h-4 rounded-sm bg-border-subtle/40"
          animate={{ y: [0, -24] }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "linear",
            delay: i * 0.1,
          }}
        />
      ))}
    </motion.div>
  );
}

// Film frame corners
function FrameCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");

  return (
    <motion.div
      className={`absolute ${isTop ? "top-0" : "bottom-0"} ${isLeft ? "left-0" : "right-0"} w-12 h-12`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + (isTop ? 0 : 0.1) + (isLeft ? 0 : 0.05), duration: 0.4 }}
    >
      {/* Horizontal line */}
      <div
        className={`absolute ${isTop ? "top-0" : "bottom-0"} ${isLeft ? "left-0" : "right-0"} h-px w-full bg-border-strong`}
      />
      {/* Vertical line */}
      <div
        className={`absolute ${isTop ? "top-0" : "bottom-0"} ${isLeft ? "left-0" : "right-0"} w-px h-full bg-border-strong`}
      />
    </motion.div>
  );
}

// Noise overlay with flicker
function FilmGrain() {
  const [flicker, setFlicker] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(0.97 + Math.random() * 0.06);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        opacity: 0.04 * flicker,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Scan lines
function ScanLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        opacity: 0.03,
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.03) 2px,
          rgba(255, 255, 255, 0.03) 4px
        )`,
      }}
    />
  );
}

// Vignette effect
function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(5, 7, 18, 0.6) 100%)`,
      }}
    />
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = () => {
    window.location.href = "/api/v1/auth/login";
  };

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at center, var(--bg-surface) 0%, var(--bg-app) 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background effects */}
          <FilmGrain />
          <ScanLines />
          <Vignette />

          {/* Sprocket holes */}
          <SprocketHoles side="left" />
          <SprocketHoles side="right" />

          {/* Accent glow behind content */}
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: `radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)`,
              opacity: 0.08,
              filter: "blur(60px)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          />

          {/* Main content container */}
          <div className="relative z-20 w-full max-w-md px-8">
            {/* Frame corners */}
            <div className="relative p-12">
              <FrameCorner position="tl" />
              <FrameCorner position="tr" />
              <FrameCorner position="bl" />
              <FrameCorner position="br" />

              {/* Content */}
              <div className="flex flex-col items-center text-center space-y-8">
                {/* Logo / Wordmark */}
                <motion.h1
                  className="font-display text-4xl tracking-widest uppercase text-text-primary"
                  style={{
                    textShadow: "0 0 40px rgba(124, 92, 255, 0.3)",
                  }}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  directoris
                </motion.h1>

                {/* Tagline */}
                <motion.p
                  className="text-text-muted text-body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  AI-powered story continuity
                </motion.p>

                {/* Sign in button */}
                <motion.button
                  onClick={handleSignIn}
                  className="mt-4 px-8 py-3 bg-accent-primary text-white font-medium rounded-lg relative overflow-hidden group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Glow effect on hover */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)`,
                    }}
                  />
                  <span className="relative z-10">Continue</span>
                </motion.button>

                {/* Breathing pulse animation on button */}
                <motion.div
                  className="absolute -inset-1 rounded-lg pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)`,
                    opacity: 0,
                    filter: "blur(20px)",
                  }}
                  animate={{
                    opacity: [0.05, 0.1, 0.05],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <motion.footer
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <p className="text-text-subtle text-micro">
                © 2025 Filipe Labs
              </p>
            </motion.footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
