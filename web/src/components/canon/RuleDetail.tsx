"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { WorldRule } from "@/types";

interface CanonLabels {
  ruleSingular: string;
}

interface RuleDetailProps {
  rule: WorldRule | null;
  onUpdate: (rule: WorldRule) => void;
  onDelete: (id: string) => void;
  labels: CanonLabels;
}

export function RuleDetail({
  rule,
  onUpdate,
  onDelete,
  labels,
}: RuleDetailProps) {
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync local state with rule prop
  useEffect(() => {
    if (rule) {
      setEditedTitle(rule.title);
      setEditedDescription(rule.description || "");
      setEditedCategory(rule.category || "");
    }
  }, [rule?.id]);

  const handleSave = useCallback(async () => {
    if (!rule) return;

    const hasChanges =
      editedTitle !== rule.title ||
      editedDescription !== (rule.description || "") ||
      editedCategory !== (rule.category || "");

    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const updated = await api.rules.update(rule.id, {
        title: editedTitle,
        description: editedDescription || undefined,
        category: editedCategory || undefined,
      });
      onUpdate(updated);
    } catch (err) {
      console.error("Failed to update rule:", err);
    } finally {
      setIsSaving(false);
    }
  }, [rule, editedTitle, editedDescription, editedCategory, onUpdate]);

  const handleDelete = async () => {
    if (!rule) return;
    if (!confirm(`Delete ${labels.ruleSingular.toLowerCase()} "${rule.title}"?`)) return;

    setIsDeleting(true);
    try {
      await api.rules.delete(rule.id);
      onDelete(rule.id);
    } catch (err) {
      console.error("Failed to delete rule:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!rule) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-surface">
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
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <p className="text-text-muted text-body">
            Select a {labels.ruleSingular.toLowerCase()} to view details
          </p>
          <p className="text-text-subtle text-caption mt-1">
            Or create a new one from the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-surface overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
            <svg
              className="w-6 h-6 text-accent-primary"
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
          </div>
          <div>
            <h1 className="text-title text-text-primary">{rule.title}</h1>
            {rule.category && (
              <p className="text-caption text-text-muted">{rule.category}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-micro text-text-subtle">Saving...</span>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-text-subtle hover:text-status-error transition-colors rounded-lg hover:bg-bg-hover"
            title={`Delete ${labels.ruleSingular.toLowerCase()}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Title */}
          <div>
            <label className="block text-caption text-text-muted mb-1">Title</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSave}
              className="input w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-caption text-text-muted mb-1">Category</label>
            <input
              type="text"
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              onBlur={handleSave}
              placeholder="e.g., Core, Technical, Behavioral..."
              className="input w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-caption text-text-muted mb-1">Description</label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Describe this rule in detail..."
              className="input w-full min-h-[200px] resize-none"
            />
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-border-subtle">
            <p className="text-micro text-text-subtle">
              Created {new Date(rule.createdAt).toLocaleDateString()}
              {rule.updatedAt !== rule.createdAt && (
                <> &middot; Updated {new Date(rule.updatedAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
