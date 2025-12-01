"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { api } from "@/lib/api";
import type { Character } from "@/types";

interface CanonLabels {
  characterSingular: string;
  characterPlural: string;
  archetypeLabel: string;
}

interface CharacterListProps {
  projectId: string;
  characters: Character[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (character: Character) => void;
  labels: CanonLabels;
}

export function CharacterList({
  projectId,
  characters,
  selectedId,
  onSelect,
  onCreate,
  labels,
}: CharacterListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const character = await api.characters.create(projectId, {
        name: newName.trim(),
      });
      onCreate(character);
      setNewName("");
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create character:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      setNewName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 flex-shrink-0 border-r border-border-subtle bg-bg-app flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <span className="text-caption font-medium text-text-muted uppercase tracking-wider">
          {labels.characterPlural}
        </span>
        <span className="text-micro text-text-subtle">{characters.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {characters.map((character, index) => (
            <motion.button
              key={character.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => onSelect(character.id)}
              className={clsx(
                "w-full text-left px-3 py-2.5 rounded-lg transition-colors mb-1",
                selectedId === character.id
                  ? "bg-accent-primary-soft border-l-2 border-accent-primary"
                  : "hover:bg-bg-hover"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {character.imageUrl ? (
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-caption font-medium text-text-muted">
                      {character.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-body font-medium text-text-primary truncate">
                    {character.name}
                  </div>
                  {character.archetype && (
                    <div className="text-micro text-text-subtle truncate">
                      {character.archetype}
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Add new form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 bg-bg-surface rounded-lg border border-border-subtle">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${labels.characterSingular} name...`}
                  className="input w-full text-body"
                  autoFocus
                  disabled={isSubmitting}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || isSubmitting}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {isSubmitting ? "..." : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setNewName("");
                      setIsCreating(false);
                    }}
                    className="btn btn-secondary btn-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add button */}
      {!isCreating && (
        <div className="p-2 border-t border-border-subtle">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-caption text-accent-primary hover:bg-accent-primary-soft rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {labels.characterSingular}
          </button>
        </div>
      )}
    </div>
  );
}
