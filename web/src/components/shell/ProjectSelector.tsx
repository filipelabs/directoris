"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/types";

interface ProjectSelectorProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateNew: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function ProjectSelector({
  projects,
  currentProject,
  onSelectProject,
  onCreateNew,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (project: Project) => {
    onSelectProject(project);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    onCreateNew();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          bg-bg-elevated border border-border-subtle
          hover:border-accent-primary/30 hover:bg-bg-hover
          transition-all duration-150
          group
        "
      >
        {currentProject ? (
          <>
            <span className="text-text-primary font-medium text-body">
              {currentProject.name}
            </span>
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-text-subtle group-hover:text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </>
        ) : (
          <span className="text-text-muted text-body">Select project...</span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="
              absolute left-0 top-full mt-2 z-50
              min-w-[280px] max-w-[320px]
              bg-bg-elevated border border-border-subtle rounded-lg
              shadow-[0_18px_45px_rgba(0,0,0,0.45)]
              overflow-hidden
            "
          >
            {/* Project List */}
            <div className="max-h-[280px] overflow-y-auto py-1">
              {projects.map((project, index) => {
                const isSelected = currentProject?.id === project.id;

                return (
                  <motion.button
                    key={project.id}
                    onClick={() => handleSelect(project)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.15 }}
                    className={`
                      relative w-full text-left px-4 py-3
                      hover:bg-bg-hover transition-colors
                      ${isSelected ? "bg-accent-primary-soft/30" : ""}
                    `}
                  >
                    {/* Selected indicator bar */}
                    {isSelected && (
                      <motion.div
                        layoutId="project-selected-bar"
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-accent-primary rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* Project info */}
                    <div className="pl-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-body font-medium ${isSelected ? "text-text-primary" : "text-text-muted"}`}>
                          {project.name}
                        </span>
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-accent-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className="text-micro text-text-subtle mt-0.5">
                        {project.description || "No description"}
                        <span className="mx-1.5">•</span>
                        {formatRelativeTime(project.updatedAt)}
                      </p>
                    </div>
                  </motion.button>
                );
              })}

              {projects.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <p className="text-text-subtle text-caption">No projects yet</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border-subtle" />

            {/* New Project Button */}
            <motion.button
              onClick={handleCreateNew}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: projects.length * 0.03 + 0.05 }}
              className="
                w-full flex items-center gap-2 px-4 py-3
                text-accent-primary hover:bg-accent-primary-soft
                transition-colors
              "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-body font-medium">New Project</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
