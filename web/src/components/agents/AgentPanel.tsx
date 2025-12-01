"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { AgentOutput, AgentType } from "@/types";
import { SuggestionCard } from "./SuggestionCard";

type FilterType = "all" | AgentType;

interface AgentPanelProps {
  sceneId: string | null;
  suggestions: AgentOutput[];
  isLoading?: boolean;
  onRunAgents: (agentTypes?: AgentType[]) => void;
  onResolve: (id: string, resolved: boolean) => void;
}

const agentLabels: Record<AgentType, string> = {
  CONTINUITY: "Continuity",
  STORY_STRUCTURE: "Structure",
  CHARACTER: "Character",
  STORYBOARD: "Storyboard",
};

export function AgentPanel({
  sceneId,
  suggestions,
  isLoading = false,
  onRunAgents,
  onResolve,
}: AgentPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showResolved, setShowResolved] = useState(false);

  // Filter suggestions
  const filteredSuggestions = suggestions.filter((s) => {
    if (activeFilter !== "all" && s.agentType !== activeFilter) return false;
    if (!showResolved && s.resolved) return false;
    return true;
  });

  // Count by agent type
  const counts = suggestions.reduce(
    (acc, s) => {
      if (!s.resolved) {
        acc[s.agentType] = (acc[s.agentType] || 0) + 1;
        acc.all++;
      }
      return acc;
    },
    { all: 0 } as Record<string, number>
  );

  // No scene selected
  if (!sceneId) {
    return (
      <div className="pane pane-c flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 mb-3 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
          <svg
            className="w-6 h-6 text-text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
            />
          </svg>
        </div>
        <p className="text-text-muted text-body text-center">AI Agents</p>
        <p className="text-text-subtle text-caption text-center mt-1">
          Select a scene to run analysis
        </p>
      </div>
    );
  }

  return (
    <div className="pane pane-c flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-app border-b border-border-subtle px-4 py-4">
        {/* Run button */}
        <button
          onClick={() => onRunAgents()}
          disabled={isLoading}
          className={clsx(
            "btn btn-primary w-full mb-4",
            isLoading && "opacity-70 cursor-wait"
          )}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Running agents...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                />
              </svg>
              Run agents
            </>
          )}
        </button>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="All"
            count={counts.all}
            isActive={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          {(Object.keys(agentLabels) as AgentType[]).map((type) => (
            <FilterPill
              key={type}
              label={agentLabels[type]}
              count={counts[type] || 0}
              isActive={activeFilter === type}
              onClick={() => setActiveFilter(type)}
            />
          ))}
        </div>

        {/* Show resolved toggle */}
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-border-strong bg-bg-elevated text-accent-primary focus:ring-accent-primary focus:ring-offset-0"
          />
          <span className="text-caption text-text-muted">Show resolved</span>
        </label>
      </div>

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredSuggestions.length > 0 ? (
            <motion.div className="space-y-3">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SuggestionCard
                    suggestion={suggestion}
                    onResolve={(resolved) => onResolve(suggestion.id, resolved)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-10 h-10 mb-3 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
              <p className="text-text-muted text-caption text-center">
                {suggestions.length > 0
                  ? "All issues resolved"
                  : "No issues found"}
              </p>
              <p className="text-text-subtle text-micro text-center mt-1">
                Run agents to analyze this scene
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Filter Pill ───────────────────────────────────────────────────────────

function FilterPill({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "chip transition-all",
        isActive
          ? "bg-accent-primary-soft border-accent-primary text-accent-primary"
          : "hover:border-border-strong"
      )}
    >
      {label}
      {count > 0 && (
        <span
          className={clsx(
            "ml-1 px-1.5 py-0.5 rounded-full text-micro",
            isActive
              ? "bg-accent-primary/20 text-accent-primary"
              : "bg-bg-hover text-text-subtle"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Loading Spinner ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
