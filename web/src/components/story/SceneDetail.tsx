"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useAutoSave } from "@/hooks";
import type { Scene, Character, Location, UpdateSceneDto } from "@/types";

type Tab = "overview" | "beats";

interface SceneDetailProps {
  scene: Scene | null;
  sequenceTitle?: string;
  actTitle?: string;
  characters?: Character[];
  location?: Location | null;
  onUpdateScene?: (sceneId: string, data: UpdateSceneDto) => Promise<void>;
}

export function SceneDetail({
  scene,
  sequenceTitle,
  actTitle,
  characters = [],
  location,
  onUpdateScene,
}: SceneDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [editedPurpose, setEditedPurpose] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Sync local state with scene prop
  useEffect(() => {
    if (scene) {
      setEditedTitle(scene.title);
      setEditedSummary(scene.summary || "");
      setEditedPurpose(scene.purpose || "");
    }
  }, [scene?.id]);

  // Memoized data for auto-save
  const sceneData = useMemo(
    () => ({
      title: editedTitle,
      summary: editedSummary,
      purpose: editedPurpose,
    }),
    [editedTitle, editedSummary, editedPurpose]
  );

  // Auto-save hook - key resets state when scene changes
  const { status, lastSaved, isPending } = useAutoSave({
    data: sceneData,
    onSave: async (data) => {
      if (scene && onUpdateScene) {
        await onUpdateScene(scene.id, data);
      }
    },
    debounceMs: 800,
    enabled: !!scene && !!onUpdateScene,
    key: scene?.id ?? null,
  });

  if (!scene) {
    return (
      <div className="pane pane-b flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
            <svg
              className="w-8 h-8 text-text-subtle"
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
          </div>
          <p className="text-text-muted text-body">Select a scene to view details</p>
          <p className="text-text-subtle text-caption mt-1">
            Choose from the structure panel on the left
          </p>
        </div>
      </div>
    );
  }

  // Get characters in this scene
  const sceneCharacters = (scene.characters || [])
    .map((sc) => characters.find((c) => c.id === sc.characterId))
    .filter(Boolean) as Character[];

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEditingTitle(false);
    } else if (e.key === "Escape") {
      setEditedTitle(scene.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="pane pane-b flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-surface border-b border-border-subtle px-6 py-4">
        {/* Title row with save status */}
        <div className="flex items-center gap-3 mb-3">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="flex-1 text-title text-text-primary bg-transparent border-b-2 border-accent-primary focus:outline-none"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-title text-text-primary cursor-text hover:text-accent-primary transition-colors"
              title="Click to edit"
            >
              {editedTitle || scene.title}
            </h1>
          )}

          {/* Save status indicator */}
          <SaveStatusIndicator status={status} lastSaved={lastSaved} isPending={isPending} />
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap items-center gap-2">
          {sequenceTitle && (
            <span className="chip">
              <span className="text-mono text-text-subtle text-micro">SEQ</span>
              {sequenceTitle}
            </span>
          )}

          {actTitle && (
            <span className="chip">
              <span className="text-mono text-text-subtle text-micro">ACT</span>
              {actTitle}
            </span>
          )}

          {scene.tone && <span className="chip chip-accent">{scene.tone}</span>}

          {location && (
            <span className="chip">
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
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              {location.name}
            </span>
          )}

          <div className="flex-1" />

          {sceneCharacters.length > 0 && (
            <div className="flex -space-x-2">
              {sceneCharacters.slice(0, 4).map((char) => (
                <CharacterAvatar key={char.id} character={char} />
              ))}
              {sceneCharacters.length > 4 && (
                <span className="w-7 h-7 rounded-full bg-bg-elevated border-2 border-bg-surface flex items-center justify-center text-micro text-text-muted">
                  +{sceneCharacters.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4 -mb-4 border-b border-transparent">
          {(["overview", "beats"] as Tab[]).map((tab) => (
            <TabButton
              key={tab}
              label={tab.charAt(0).toUpperCase() + tab.slice(1)}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "overview" && (
            <OverviewTab
              scene={scene}
              location={location}
              editedPurpose={editedPurpose}
              editedSummary={editedSummary}
              onPurposeChange={setEditedPurpose}
              onSummaryChange={setEditedSummary}
            />
          )}
          {activeTab === "beats" && <BeatsTab scene={scene} />}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Save Status Indicator ─────────────────────────────────────────────────

function SaveStatusIndicator({
  status,
  lastSaved,
  isPending,
}: {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  isPending: boolean;
}) {
  const getStatusText = () => {
    if (isPending) return "Unsaved changes...";
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        return lastSaved
          ? `Saved ${formatTimeAgo(lastSaved)}`
          : "Saved";
      case "error":
        return "Save failed";
      default:
        return lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : "";
    }
  };

  const statusText = getStatusText();
  if (!statusText) return null;

  return (
    <span
      className={clsx(
        "text-micro transition-colors",
        status === "error" ? "text-status-error" : "text-text-subtle"
      )}
    >
      {status === "saving" && (
        <span className="inline-block w-2 h-2 mr-1.5 rounded-full bg-accent-primary animate-pulse" />
      )}
      {status === "saved" && (
        <span className="inline-block w-2 h-2 mr-1.5 rounded-full bg-status-success" />
      )}
      {statusText}
    </span>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

// ─── Tab Button ────────────────────────────────────────────────────────────

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative px-4 py-3 text-caption font-medium transition-colors",
        isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
      )}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="tab-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────

function OverviewTab({
  scene,
  location,
  editedPurpose,
  editedSummary,
  onPurposeChange,
  onSummaryChange,
}: {
  scene: Scene;
  location?: Location | null;
  editedPurpose: string;
  editedSummary: string;
  onPurposeChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Purpose */}
      <div>
        <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-2">
          Purpose
        </h3>
        <textarea
          value={editedPurpose}
          onChange={(e) => onPurposeChange(e.target.value)}
          placeholder="What does this scene accomplish in the story?"
          className="w-full min-h-[80px] p-3 bg-bg-elevated border border-border-subtle rounded-lg text-body text-text-primary leading-relaxed resize-none focus:outline-none focus:border-accent-primary placeholder:text-text-subtle"
        />
      </div>

      {/* Summary */}
      <div>
        <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-2">
          Summary
        </h3>
        <textarea
          value={editedSummary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Brief overview of what happens in this scene..."
          className="w-full min-h-[120px] p-3 bg-bg-elevated border border-border-subtle rounded-lg text-body text-text-primary leading-relaxed resize-none focus:outline-none focus:border-accent-primary placeholder:text-text-subtle"
        />
      </div>

      {/* Location details */}
      {location?.description && (
        <div>
          <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-2">
            Location
          </h3>
          <div className="card p-4">
            <span className="text-subtitle font-medium text-text-primary">
              {location.name}
            </span>
            <p className="text-body text-text-muted mt-1">{location.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Beats Tab ─────────────────────────────────────────────────────────────

function BeatsTab({ scene }: { scene: Scene }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
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
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </div>
      <p className="text-text-muted text-body">Character arc beats</p>
      <p className="text-text-subtle text-caption mt-1">
        Connect this scene to character arcs
      </p>
    </div>
  );
}

// ─── Character Avatar ──────────────────────────────────────────────────────

function CharacterAvatar({ character }: { character: Character }) {
  return (
    <div
      className="w-7 h-7 rounded-full bg-bg-elevated border-2 border-bg-surface flex items-center justify-center overflow-hidden"
      title={character.name}
    >
      {character.imageUrl ? (
        <img
          src={character.imageUrl}
          alt={character.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-micro font-medium text-text-muted">
          {character.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
