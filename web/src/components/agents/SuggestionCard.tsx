"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { AgentOutput, SuggestionSeverity, AgentType } from "@/types";

interface SuggestionCardProps {
  suggestion: AgentOutput;
  onResolve: (resolved: boolean) => void;
}

const severityConfig: Record<
  SuggestionSeverity,
  { label: string; class: string; borderClass: string }
> = {
  ERROR: {
    label: "ERROR",
    class: "severity-error",
    borderClass: "border-l-status-error",
  },
  WARNING: {
    label: "WARNING",
    class: "severity-warning",
    borderClass: "border-l-status-warning",
  },
  INFO: {
    label: "INFO",
    class: "severity-info",
    borderClass: "border-l-status-info",
  },
};

const agentLabels: Record<AgentType, string> = {
  CONTINUITY: "Continuity",
  STORY_STRUCTURE: "Structure",
  CHARACTER: "Character",
  STORYBOARD: "Storyboard",
};

export function SuggestionCard({ suggestion, onResolve }: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const severity = severityConfig[suggestion.severity];

  return (
    <motion.div
      layout
      className={clsx(
        "card overflow-hidden border-l-[3px]",
        severity.borderClass,
        suggestion.resolved && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        {/* Severity badge */}
        <span className={clsx("chip text-micro font-semibold", severity.class)}>
          {severity.label}
        </span>

        {/* Title and agent */}
        <div className="flex-1 min-w-0">
          <h4 className="text-caption font-medium text-text-primary truncate">
            {suggestion.title}
          </h4>
          <span className="text-micro text-text-subtle">
            {agentLabels[suggestion.agentType]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Expand/collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-text-subtle hover:text-text-muted transition-colors"
          >
            <motion.svg
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.15 }}
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </motion.svg>
          </button>

          {/* Resolve checkbox */}
          <button
            onClick={() => onResolve(!suggestion.resolved)}
            className={clsx(
              "w-5 h-5 rounded border flex items-center justify-center transition-all",
              suggestion.resolved
                ? "bg-accent-secondary border-accent-secondary"
                : "border-border-strong hover:border-accent-secondary"
            )}
          >
            {suggestion.resolved && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content (collapsible) */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-3 pb-3">
          {/* Content body */}
          <p className="text-caption text-text-muted leading-relaxed mb-3">
            {suggestion.content}
          </p>

          {/* Metadata pills */}
          {hasMetadata(suggestion.metadata) && (
            <div className="flex flex-wrap gap-1.5">
              {suggestion.metadata.characterName && (
                <MetadataPill
                  icon={
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  }
                  label={suggestion.metadata.characterName}
                />
              )}

              {suggestion.metadata.ruleTitle && (
                <MetadataPill
                  icon={
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  }
                  label={suggestion.metadata.ruleTitle}
                />
              )}

              {suggestion.metadata.relatedSceneTitles?.map((sceneTitle) => (
                <MetadataPill
                  key={sceneTitle}
                  icon={
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  }
                  label={sceneTitle}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Metadata Pill ─────────────────────────────────────────────────────────

function MetadataPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bg-hover text-micro text-text-muted">
      {icon}
      {label}
    </span>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function hasMetadata(metadata: AgentOutput["metadata"]): boolean {
  return !!(
    metadata.characterName ||
    metadata.ruleTitle ||
    (metadata.relatedSceneTitles && metadata.relatedSceneTitles.length > 0)
  );
}
