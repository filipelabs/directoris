"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { api } from "@/lib/api";
import type { WorldRule } from "@/types";

interface CanonLabels {
  ruleSingular: string;
  rulePlural: string;
}

interface RulesListProps {
  projectId: string;
  rules: WorldRule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (rule: WorldRule) => void;
  labels: CanonLabels;
}

export function RulesList({
  projectId,
  rules,
  selectedId,
  onSelect,
  onCreate,
  labels,
}: RulesListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const rule = await api.rules.create(projectId, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory.trim() || undefined,
      });
      onCreate(rule);
      setNewTitle("");
      setNewDescription("");
      setNewCategory("");
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create rule:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setNewTitle("");
      setNewDescription("");
      setNewCategory("");
      setIsCreating(false);
    }
  };

  // Group rules by category
  const groupedRules = rules.reduce<Record<string, WorldRule[]>>((acc, rule) => {
    const category = rule.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(rule);
    return acc;
  }, {});

  const categories = Object.keys(groupedRules).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="w-72 flex-shrink-0 border-r border-border-subtle bg-bg-app flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <span className="text-caption font-medium text-text-muted uppercase tracking-wider">
          {labels.rulePlural}
        </span>
        <span className="text-micro text-text-subtle">{rules.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {categories.map((category) => (
            <div key={category} className="mb-4">
              <p className="px-2 py-1 text-micro text-text-subtle font-medium uppercase tracking-wider">
                {category}
              </p>
              {groupedRules[category].map((rule, index) => (
                <motion.button
                  key={rule.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onSelect(rule.id)}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors mb-1",
                    selectedId === rule.id
                      ? "bg-accent-primary-soft border-l-2 border-accent-primary"
                      : "hover:bg-bg-hover"
                  )}
                >
                  <div className="text-body font-medium text-text-primary truncate">
                    {rule.title}
                  </div>
                  {rule.description && (
                    <div className="text-micro text-text-subtle line-clamp-2 mt-0.5">
                      {rule.description}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          ))}
        </AnimatePresence>

        {rules.length === 0 && !isCreating && (
          <p className="text-caption text-text-subtle px-2 py-4 text-center">
            No {labels.rulePlural.toLowerCase()} yet.
          </p>
        )}

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
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${labels.ruleSingular} title...`}
                  className="input w-full text-body mb-2"
                  autoFocus
                  disabled={isSubmitting}
                />
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Description..."
                  className="input w-full text-caption min-h-[60px] resize-none mb-2"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Category (optional)"
                  className="input w-full text-caption mb-2"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={!newTitle.trim() || !newDescription.trim() || isSubmitting}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {isSubmitting ? "..." : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setNewTitle("");
                      setNewDescription("");
                      setNewCategory("");
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
            Add {labels.ruleSingular}
          </button>
        </div>
      )}
    </div>
  );
}
