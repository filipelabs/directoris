"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { InlineAddForm, AddButton } from "./InlineAddForm";
import type { Act, Sequence, Scene } from "@/types";

interface SceneTreeProps {
  acts: Act[];
  selectedSceneId: string | null;
  onSelectScene: (scene: Scene) => void;
  suggestionCounts?: Record<string, number>;
  onCreateScene?: (sequenceId: string, title: string) => Promise<void>;
  onDeleteScene?: (sceneId: string) => Promise<void>;
  onCreateAct?: (title: string) => Promise<void>;
  onDeleteAct?: (actId: string) => Promise<void>;
  onUpdateAct?: (actId: string, title: string) => Promise<void>;
  onCreateSequence?: (actId: string, title: string) => Promise<void>;
  onDeleteSequence?: (sequenceId: string) => Promise<void>;
  onUpdateSequence?: (sequenceId: string, title: string) => Promise<void>;
}

export function SceneTree({
  acts = [],
  selectedSceneId,
  onSelectScene,
  suggestionCounts = {},
  onCreateScene,
  onDeleteScene,
  onCreateAct,
  onDeleteAct,
  onUpdateAct,
  onCreateSequence,
  onDeleteSequence,
  onUpdateSequence,
}: SceneTreeProps) {
  const safeActs = acts || [];
  const [isAddingAct, setIsAddingAct] = useState(false);

  const handleCreateAct = async (title: string) => {
    if (onCreateAct) {
      await onCreateAct(title);
      setIsAddingAct(false);
    }
  };

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
            onCreateScene={onCreateScene}
            onDeleteScene={onDeleteScene}
            onDeleteAct={onDeleteAct}
            onUpdateAct={onUpdateAct}
            onCreateSequence={onCreateSequence}
            onDeleteSequence={onDeleteSequence}
            onUpdateSequence={onUpdateSequence}
          />
        ))}

        {/* Add Act */}
        {onCreateAct && (
          <div className="px-4 mt-2">
            <InlineAddForm
              placeholder="New act title..."
              onSubmit={handleCreateAct}
              onCancel={() => setIsAddingAct(false)}
              isVisible={isAddingAct}
              indentLevel={0}
            />
            {!isAddingAct && (
              <AddButton
                label="Add Act"
                onClick={() => setIsAddingAct(true)}
                indentLevel={0}
              />
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {safeActs.length === 0 && !isAddingAct && (
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
  onCreateScene?: (sequenceId: string, title: string) => Promise<void>;
  onDeleteScene?: (sceneId: string) => Promise<void>;
  onDeleteAct?: (actId: string) => Promise<void>;
  onUpdateAct?: (actId: string, title: string) => Promise<void>;
  onCreateSequence?: (actId: string, title: string) => Promise<void>;
  onDeleteSequence?: (sequenceId: string) => Promise<void>;
  onUpdateSequence?: (sequenceId: string, title: string) => Promise<void>;
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
  onCreateScene,
  onDeleteScene,
  onDeleteAct,
  onUpdateAct,
  onCreateSequence,
  onDeleteSequence,
  onUpdateSequence,
}: ActNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingSequence, setIsAddingSequence] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(act.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDeleteAct = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteAct && confirm(`Delete act "${act.title}" and all its contents?`)) {
      await onDeleteAct(act.id);
    }
  };

  const handleCreateSequence = async (title: string) => {
    if (onCreateSequence) {
      await onCreateSequence(act.id, title);
      setIsAddingSequence(false);
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateAct) {
      setEditValue(act.title);
      setIsEditing(true);
    }
  };

  const handleSaveTitle = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== act.title && onUpdateAct) {
      await onUpdateAct(act.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditValue(act.title);
      setIsEditing(false);
    }
  };

  return (
    <div>
      {/* Act header */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-bg-hover transition-colors group"
        >
          <ChevronIcon isExpanded={isExpanded} />
          <span className="text-mono text-text-subtle text-xs">
            ACT {toRoman(act.index)}
          </span>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="text-caption font-medium text-text-primary bg-bg-elevated border border-border-default rounded px-1.5 py-0.5 outline-none focus:border-accent-primary flex-1 min-w-0"
            />
          ) : (
            <span
              onClick={handleTitleClick}
              className={clsx(
                "text-caption font-medium text-text-primary truncate",
                onUpdateAct && "cursor-text hover:bg-bg-elevated/50 rounded px-1 -mx-1"
              )}
            >
              {act.title}
            </span>
          )}
        </button>

        {/* Delete button */}
        {onDeleteAct && isHovered && !isEditing && (
          <button
            onClick={handleDeleteAct}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-subtle hover:text-status-error transition-colors rounded"
            title="Delete act"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Sequences */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {act.sequences?.map((seq) => (
              <SequenceNode
                key={seq.id}
                sequence={seq}
                isExpanded={expandedSequences.has(seq.id)}
                onToggle={() => onToggleSequence(seq.id)}
                selectedSceneId={selectedSceneId}
                onSelectScene={onSelectScene}
                suggestionCounts={suggestionCounts}
                onCreateScene={onCreateScene}
                onDeleteScene={onDeleteScene}
                onDeleteSequence={onDeleteSequence}
                onUpdateSequence={onUpdateSequence}
              />
            ))}

            {/* Add Sequence */}
            {onCreateSequence && (
              <div className="pl-4">
                <InlineAddForm
                  placeholder="New sequence title..."
                  onSubmit={handleCreateSequence}
                  onCancel={() => setIsAddingSequence(false)}
                  isVisible={isAddingSequence}
                  indentLevel={1}
                />
                {!isAddingSequence && (
                  <AddButton
                    label="Add Sequence"
                    onClick={() => setIsAddingSequence(true)}
                    indentLevel={1}
                  />
                )}
              </div>
            )}
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
  onCreateScene?: (sequenceId: string, title: string) => Promise<void>;
  onDeleteScene?: (sceneId: string) => Promise<void>;
  onDeleteSequence?: (sequenceId: string) => Promise<void>;
  onUpdateSequence?: (sequenceId: string, title: string) => Promise<void>;
}

function SequenceNode({
  sequence,
  isExpanded,
  onToggle,
  selectedSceneId,
  onSelectScene,
  suggestionCounts,
  onCreateScene,
  onDeleteScene,
  onDeleteSequence,
  onUpdateSequence,
}: SequenceNodeProps) {
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(sequence.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCreateScene = async (title: string) => {
    if (onCreateScene) {
      await onCreateScene(sequence.id, title);
      setIsAddingScene(false);
    }
  };

  const handleDeleteSequence = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteSequence && confirm(`Delete sequence "${sequence.title}" and all its scenes?`)) {
      await onDeleteSequence(sequence.id);
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateSequence) {
      setEditValue(sequence.title);
      setIsEditing(true);
    }
  };

  const handleSaveTitle = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== sequence.title && onUpdateSequence) {
      await onUpdateSequence(sequence.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditValue(sequence.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="pl-4">
      {/* Sequence header */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-bg-hover transition-colors group"
        >
          <ChevronIcon isExpanded={isExpanded} />
          <span className="text-mono text-text-subtle text-xs">
            SEQ {String(sequence.index).padStart(2, "0")}
          </span>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="text-caption text-text-primary bg-bg-elevated border border-border-default rounded px-1.5 py-0.5 outline-none focus:border-accent-primary flex-1 min-w-0"
            />
          ) : (
            <span
              onClick={handleTitleClick}
              className={clsx(
                "text-caption text-text-muted truncate group-hover:text-text-primary",
                onUpdateSequence && "cursor-text hover:bg-bg-elevated/50 rounded px-1 -mx-1"
              )}
            >
              {sequence.title}
            </span>
          )}
        </button>

        {/* Delete button */}
        {onDeleteSequence && isHovered && !isEditing && (
          <button
            onClick={handleDeleteSequence}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-subtle hover:text-status-error transition-colors rounded"
            title="Delete sequence"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Scenes */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {sequence.scenes?.map((scene) => (
              <SceneRow
                key={scene.id}
                scene={scene}
                isSelected={selectedSceneId === scene.id}
                onClick={() => onSelectScene(scene)}
                suggestionCount={suggestionCounts[scene.id] || 0}
                onDelete={onDeleteScene}
              />
            ))}

            {/* Add Scene - inline form or button */}
            {onCreateScene && (
              <div className="pl-4">
                <InlineAddForm
                  placeholder="New scene title..."
                  onSubmit={handleCreateScene}
                  onCancel={() => setIsAddingScene(false)}
                  isVisible={isAddingScene}
                  indentLevel={2}
                />
                {!isAddingScene && (
                  <AddButton
                    label="Add Scene"
                    onClick={() => setIsAddingScene(true)}
                    indentLevel={2}
                  />
                )}
              </div>
            )}
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
  onDelete?: (sceneId: string) => Promise<void>;
}

function SceneRow({
  scene,
  isSelected,
  onClick,
  suggestionCount,
  onDelete,
}: SceneRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Delete scene "${scene.title}"?`)) {
      await onDelete(scene.id);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <button
        onClick={onClick}
        className={clsx(
          "relative w-full flex items-center gap-2 px-4 py-2 pl-12 transition-colors",
          isSelected ? "bg-accent-primary-soft" : "hover:bg-bg-hover"
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
          SCN {String(scene.index).padStart(2, "0")}
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

      {/* Delete button (hover) */}
      {onDelete && isHovered && (
        <button
          onClick={handleDelete}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-subtle hover:text-status-error transition-colors rounded"
          title="Delete scene"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
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
