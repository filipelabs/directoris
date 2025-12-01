"use client";

import { motion } from "framer-motion";

interface ProjectTypeCardProps {
  type: "story" | "content";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  examples: string[];
  selected: boolean;
  onSelect: () => void;
}

export function ProjectTypeCard({
  type,
  title,
  subtitle,
  icon,
  examples,
  selected,
  onSelect,
}: ProjectTypeCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`
        relative w-full p-6 rounded-xl text-left transition-all duration-200
        border-2 group overflow-hidden
        ${
          selected
            ? "bg-accent-primary-soft border-accent-primary"
            : "bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-bg-elevated"
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Selection indicator */}
      <motion.div
        className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: selected ? "var(--accent-primary)" : "var(--border-strong)",
          backgroundColor: selected ? "var(--accent-primary)" : "transparent",
        }}
        initial={false}
        animate={{ scale: selected ? 1 : 0.9 }}
      >
        {selected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </motion.div>

      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-lg flex items-center justify-center mb-4
          transition-colors duration-200
          ${selected ? "bg-accent-primary/20 text-accent-primary" : "bg-bg-elevated text-text-muted group-hover:text-text-primary"}
        `}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className={`
          text-title mb-1 transition-colors
          ${selected ? "text-text-primary" : "text-text-primary"}
        `}
      >
        {title}
      </h3>

      {/* Subtitle */}
      <p className="text-body text-text-muted mb-4">{subtitle}</p>

      {/* Examples */}
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <span
            key={example}
            className={`
              chip text-micro
              ${selected ? "bg-accent-primary/10 border-accent-primary/30 text-accent-primary" : ""}
            `}
          >
            {example}
          </span>
        ))}
      </div>

      {/* Decorative film strip element for story type */}
      {type === "story" && (
        <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="currentColor">
            <rect x="0" y="0" width="8" height="12" rx="1" />
            <rect x="0" y="17" width="8" height="12" rx="1" />
            <rect x="0" y="34" width="8" height="12" rx="1" />
            <rect x="0" y="51" width="8" height="12" rx="1" />
            <rect x="0" y="68" width="8" height="12" rx="1" />
            <rect x="72" y="0" width="8" height="12" rx="1" />
            <rect x="72" y="17" width="8" height="12" rx="1" />
            <rect x="72" y="34" width="8" height="12" rx="1" />
            <rect x="72" y="51" width="8" height="12" rx="1" />
            <rect x="72" y="68" width="8" height="12" rx="1" />
          </svg>
        </div>
      )}

      {/* Decorative wave element for content type */}
      {type === "content" && (
        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M0 40 Q20 20, 40 40 T80 40" />
            <path d="M0 50 Q20 30, 40 50 T80 50" />
            <path d="M0 60 Q20 40, 40 60 T80 60" />
          </svg>
        </div>
      )}
    </motion.button>
  );
}
