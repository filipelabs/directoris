"use client";

import { motion } from "framer-motion";
import type { Project, User } from "@/types";

interface TopBarProps {
  project?: Project | null;
  user?: User | null;
}

export function TopBar({ project, user }: TopBarProps) {
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

        {/* User avatar */}
        {user && (
          <button className="w-8 h-8 rounded-full bg-bg-elevated border border-border-subtle overflow-hidden hover:border-accent-primary transition-colors">
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
        )}
      </div>
    </header>
  );
}
