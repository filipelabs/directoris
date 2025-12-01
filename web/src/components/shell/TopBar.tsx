"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Project, User } from "@/types";

interface TopBarProps {
  project?: Project | null;
  user?: User | null;
}

export function TopBar({ project, user }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    api.auth.logout();
  };

  return (
    <header className="app-topbar flex items-center justify-between px-4">
      {/* Left: Brand + Project */}
      <div className="flex items-center gap-4">
        <span className="text-mono text-text-subtle text-sm tracking-wider uppercase">
          directoris
        </span>

        {project && (
          <>
            <span className="text-text-subtle">/</span>
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-text-primary font-medium"
            >
              {project.name}
            </motion.span>
          </>
        )}
      </div>

      {/* Right: Environment + Avatar */}
      <div className="flex items-center gap-3">
        {/* Environment pill */}
        <span className="chip text-micro">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse-soft" />
          Dev
        </span>

        {/* User avatar with dropdown */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-bg-elevated border border-border-subtle overflow-hidden hover:border-accent-primary transition-colors"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-caption text-text-muted">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-bg-elevated border border-border-subtle rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <p className="text-sm text-text-primary truncate">
                      {user.name || user.email}
                    </p>
                    {user.name && (
                      <p className="text-xs text-text-muted truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-surface transition-colors"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
