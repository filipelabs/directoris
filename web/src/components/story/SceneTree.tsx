"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { Act, Sequence, Scene } from "@/types";

interface SceneTreeProps {
  acts: Act[];
  selectedSceneId: string | null;
  onSelectScene: (scene: Scene) => void;
  suggestionCounts?: Record<string, number>;
}

export function SceneTree({
  acts = [],
  selectedSceneId,
  onSelectScene,
  suggestionCounts = {},
}: SceneTreeProps) {
  // Ensure acts is always an array
  const safeActs = acts || [];

  const [expandedActs, setExpandedActs] = useState<Set<string>>(
    new Set(safeActs.map((a) => a.id))
  );
  const [expandedSequences, setExpandedSequences] = useState<Set<string>>(
    new Set(safeActs.flatMap((a) => a.sequences?.map((s) => s.id) || []))
  );

  const toggleAct = (actId: string) => {
    setExpandedActs((prev) => {
      const next = new Set(prev);
      if (next.has(actId)) {
        next.delete(actId);
      } else {
        next.add(actId);
      }
      return next;
    });
  };

  const toggleSequence = (seqId: string) => {
    setExpandedSequences((prev) => {
      const next = new Set(prev);
      if (next.has(seqId)) {
        next.delete(seqId);
      } else {
        next.add(seqId);
      }
      return next;
    });
  };

  return (
    <div className="pane pane-a py-4">
      {/* Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <span className="text-caption font-semibold text-text-muted uppercase tracking-wider">
          Structure
        </span>
        <button className="text-text-subtle hover:text-accent-primary transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {/* Tree */}
      <div className="flex flex-col">
        {safeActs.map((act) => (
          <ActNode
            key={act.id}
            act={act}
            isExpanded={expandedActs.has(act.id)}
            onToggle={() => toggleAct(act.id)}
            expandedSequences={expandedSequences}
            onToggleSequence={toggleSequence}
            selectedSceneId={selectedSceneId}
            onSelectScene={onSelectScene}
            suggestionCounts={suggestionCounts}
          />
        ))}
      </div>

      {/* Empty state */}
      {safeActs.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-text-subtle text-caption">
            No acts yet. Create your first act to get started.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Act Node ──────────────────────────────────────────────────────────────

interface ActNodeProps {
  act: Act;
  isExpanded: boolean;
  onToggle: () => void;
  expandedSequences: Set<string>;
  onToggleSequence: (id: string) => void;
  selectedSceneId: string | null;
  onSelectScene: (scene: Scene) => void;
  suggestionCounts: Record<string, number>;
}

function ActNode({
  act,
  isExpanded,
  onToggle,
  expandedSequences,
  onToggleSequence,
  selectedSceneId,
  onSelectScene,
  suggestionCounts,
}: ActNodeProps) {
  return (
    <div>
      {/* Act header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-bg-hover transition-colors group"
      >
        <ChevronIcon isExpanded={isExpanded} />
        <span className="text-mono text-text-subtle text-xs">
          ACT {toRoman(act.index + 1)}
        </span>
        <span className="text-caption font-medium text-text-primary truncate">
          {act.title}
        </span>
      </button>

      {/* Sequences */}
      <AnimatePresence initial={false}>
        {isExpanded && act.sequences && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {act.sequences.map((seq) => (
              <SequenceNode
                key={seq.id}
                sequence={seq}
                isExpanded={expandedSequences.has(seq.id)}
                onToggle={() => onToggleSequence(seq.id)}
                selectedSceneId={selectedSceneId}
                onSelectScene={onSelectScene}
                suggestionCounts={suggestionCounts}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sequence Node ─────────────────────────────────────────────────────────

interface SequenceNodeProps {
  sequence: Sequence;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSceneId: string | null;
  onSelectScene: (scene: Scene) => void;
  suggestionCounts: Record<string, number>;
}

function SequenceNode({
  sequence,
  isExpanded,
  onToggle,
  selectedSceneId,
  onSelectScene,
  suggestionCounts,
}: SequenceNodeProps) {
  return (
    <div className="pl-4">
      {/* Sequence header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-bg-hover transition-colors group"
      >
        <ChevronIcon isExpanded={isExpanded} />
        <span className="text-mono text-text-subtle text-xs">
          SEQ {String(sequence.index + 1).padStart(2, "0")}
        </span>
        <span className="text-caption text-text-muted truncate group-hover:text-text-primary">
          {sequence.title}
        </span>
      </button>

      {/* Scenes */}
      <AnimatePresence initial={false}>
        {isExpanded && sequence.scenes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {sequence.scenes.map((scene) => (
              <SceneRow
                key={scene.id}
                scene={scene}
                isSelected={selectedSceneId === scene.id}
                onClick={() => onSelectScene(scene)}
                suggestionCount={suggestionCounts[scene.id] || 0}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Scene Row ─────────────────────────────────────────────────────────────

interface SceneRowProps {
  scene: Scene;
  isSelected: boolean;
  onClick: () => void;
  suggestionCount: number;
}

function SceneRow({
  scene,
  isSelected,
  onClick,
  suggestionCount,
}: SceneRowProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative w-full flex items-center gap-2 px-4 py-2 pl-12 transition-colors",
        isSelected
          ? "bg-accent-primary-soft"
          : "hover:bg-bg-hover"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          layoutId="scene-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent-primary rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Scene number */}
      <span className="text-mono text-text-subtle text-xs shrink-0">
        SCN {String(scene.index + 1).padStart(2, "0")}
      </span>

      {/* Title */}
      <span
        className={clsx(
          "text-caption truncate flex-1 text-left",
          isSelected ? "text-text-primary" : "text-text-muted"
        )}
      >
        {scene.title}
      </span>

      {/* Right side: status + suggestion count */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status dot */}
        <span className="w-1.5 h-1.5 rounded-full bg-text-subtle" />

        {/* Suggestion badge */}
        {suggestionCount > 0 && (
          <span className="chip chip-accent text-micro px-1.5 py-0.5">
            {suggestionCount}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={{ duration: 0.15 }}
      className="w-3 h-3 text-text-subtle shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </motion.svg>
  );
}

function toRoman(num: number): string {
  const lookup: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  for (const [value, symbol] of lookup) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}
