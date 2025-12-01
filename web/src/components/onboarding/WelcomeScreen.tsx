"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NewProjectWizard } from "./NewProjectWizard";

interface WelcomeScreenProps {
  userName?: string | null;
  onCreateProject: (data: {
    projectType: "story" | "content" | null;
    projectName: string;
    logline: string;
    characters: { id: string; name: string; role: string }[];
    rules: { id: string; title: string; description: string }[];
    structureTemplate: "quick" | "three_act" | "custom";
    firstSceneTitle: string;
  }) => Promise<void>;
}

// Animated film sprocket holes
function SprocketTrack({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`
        absolute top-0 bottom-0 w-4 flex flex-col items-center gap-5 overflow-hidden opacity-20
        ${side === "left" ? "left-6" : "right-6"}
      `}
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2.5 h-4 rounded-sm bg-border-strong flex-shrink-0"
          animate={{ y: [-20, -44] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.125,
          }}
        />
      ))}
    </div>
  );
}

// Frame corner brackets
function FrameCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");

  return (
    <motion.div
      className={`
        absolute w-8 h-8
        ${isTop ? "top-0" : "bottom-0"}
        ${isLeft ? "left-0" : "right-0"}
      `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 + (isTop ? 0 : 0.1) + (isLeft ? 0 : 0.05), duration: 0.3 }}
    >
      <div
        className={`absolute ${isTop ? "top-0" : "bottom-0"} ${isLeft ? "left-0" : "right-0"} w-full h-px bg-border-strong`}
      />
      <div
        className={`absolute ${isTop ? "top-0" : "bottom-0"} ${isLeft ? "left-0" : "right-0"} w-px h-full bg-border-strong`}
      />
    </motion.div>
  );
}

// Ambient glow
function AmbientGlow() {
  return (
    <>
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)",
          opacity: 0.06,
          filter: "blur(80px)",
          top: "20%",
          left: "30%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          opacity: [0.04, 0.08, 0.04],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)",
          opacity: 0.04,
          filter: "blur(60px)",
          bottom: "10%",
          right: "20%",
        }}
        animate={{
          opacity: [0.03, 0.06, 0.03],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </>
  );
}

// Film grain overlay
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
        opacity: 0.03 * flicker,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Vignette
function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(5, 7, 18, 0.5) 100%)",
      }}
    />
  );
}

export function WelcomeScreen({ userName, onCreateProject }: WelcomeScreenProps) {
  const [showWizard, setShowWizard] = useState(false);

  const firstName = userName?.split(" ")[0] || "Director";

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-bg-app">
      {/* Background effects */}
      <AmbientGlow />
      <FilmGrain />
      <Vignette />

      {/* Film sprocket tracks */}
      <SprocketTrack side="left" />
      <SprocketTrack side="right" />

      <AnimatePresence mode="wait">
        {!showWizard ? (
          /* Welcome state */
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 text-center px-8 max-w-2xl"
          >
            {/* Frame corners */}
            <div className="relative p-16">
              <FrameCorner position="tl" />
              <FrameCorner position="tr" />
              <FrameCorner position="bl" />
              <FrameCorner position="br" />

              {/* Director's chair icon */}
              <motion.div
                className="mx-auto mb-8 w-20 h-20 rounded-2xl bg-accent-primary-soft flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <svg
                  className="w-10 h-10 text-accent-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                  />
                </svg>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-display mb-3"
                style={{ textShadow: "0 0 60px rgba(124, 92, 255, 0.3)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Welcome, {firstName}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-body text-text-muted mb-8 max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Ready to direct your first story? Create a project to start using AI-powered continuity agents.
              </motion.p>

              {/* Big question */}
              <motion.h2
                className="text-title text-text-primary mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                What are you directing first?
              </motion.h2>

              {/* CTA buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <motion.button
                  onClick={() => setShowWizard(true)}
                  className="btn btn-primary text-lg px-8 py-3 relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Glow effect */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Project
                  </span>
                </motion.button>
              </motion.div>

              {/* Hint text */}
              <motion.p
                className="mt-8 text-caption text-text-subtle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                Takes about 2 minutes to set up
              </motion.p>
            </div>
          </motion.div>
        ) : (
          /* Wizard state */
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 w-full max-w-3xl px-8 py-12"
          >
            <NewProjectWizard
              onComplete={onCreateProject}
              onCancel={() => setShowWizard(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
