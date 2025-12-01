"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { CharacterRelationship, Character } from "@/types";

interface RelationshipsSectionProps {
  characterId: string;
  relationships: CharacterRelationship[];
  allCharacters: Character[];
  onRelationshipsChange: (relationships: CharacterRelationship[]) => void;
  isLoading: boolean;
}

export function RelationshipsSection({
  characterId,
  relationships,
  allCharacters,
  onRelationshipsChange,
  isLoading,
}: RelationshipsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedToId, setSelectedToId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDynamic, setNewDynamic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Ensure we have arrays
  const safeRelationships = Array.isArray(relationships) ? relationships : [];
  const safeAllCharacters = Array.isArray(allCharacters) ? allCharacters : [];

  // Filter out self and already-related characters
  const availableCharacters = safeAllCharacters.filter(
    (c) => c.id !== characterId && !safeRelationships.some((r) => r.toId === c.id)
  );

  const getCharacterName = (id: string) => {
    return safeAllCharacters.find((c) => c.id === id)?.name || "Unknown";
  };

  const handleCreate = async () => {
    if (!selectedToId || !newLabel.trim()) return;

    setIsSubmitting(true);
    try {
      const relationship = await api.relationships.create(characterId, {
        toId: selectedToId,
        label: newLabel.trim(),
        description: newDescription.trim() || undefined,
        dynamic: newDynamic.trim() || undefined,
      });
      onRelationshipsChange([...relationships, relationship]);
      resetForm();
    } catch (err) {
      console.error("Failed to create relationship:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (rel: CharacterRelationship, updates: Partial<CharacterRelationship>) => {
    try {
      // Filter out null values for the DTO
      const dto: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== null) {
          dto[key] = value;
        }
      }
      const updated = await api.relationships.update(rel.id, dto);
      onRelationshipsChange(relationships.map((r) => (r.id === rel.id ? updated : r)));
    } catch (err) {
      console.error("Failed to update relationship:", err);
    }
  };

  const handleDelete = async (relId: string) => {
    try {
      await api.relationships.delete(relId);
      onRelationshipsChange(relationships.filter((r) => r.id !== relId));
    } catch (err) {
      console.error("Failed to delete relationship:", err);
    }
  };

  const resetForm = () => {
    setSelectedToId("");
    setNewLabel("");
    setNewDescription("");
    setNewDynamic("");
    setIsAdding(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-caption font-semibold text-text-muted uppercase tracking-wider">
          Relationships
        </h2>
        {!isAdding && availableCharacters.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-micro text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            + Add Relationship
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-caption text-text-subtle">Loading relationships...</div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {safeRelationships.map((rel) => (
              <motion.div
                key={rel.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-bg-elevated rounded-lg border border-border-subtle group"
              >
                {editingId === rel.id ? (
                  <RelationshipEditForm
                    relationship={rel}
                    onSave={(updates) => {
                      handleUpdate(rel, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-caption font-medium text-text-primary">
                          {rel.label}
                        </span>
                        <span className="text-micro text-text-subtle">→</span>
                        <span className="px-2 py-0.5 text-micro bg-accent-primary-soft text-accent-primary rounded-full">
                          {getCharacterName(rel.toId)}
                        </span>
                      </div>
                      {rel.description && (
                        <p className="text-body text-text-secondary mt-1">{rel.description}</p>
                      )}
                      {rel.dynamic && (
                        <p className="text-micro text-text-subtle mt-1 italic">
                          Dynamic: {rel.dynamic}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(rel.id)}
                        className="p-1 text-text-subtle hover:text-text-primary transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(rel.id)}
                        className="p-1 text-text-subtle hover:text-status-error transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add new form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-bg-elevated rounded-lg border border-accent-primary">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-micro text-text-subtle mb-1">
                        Related Character
                      </label>
                      <select
                        value={selectedToId}
                        onChange={(e) => setSelectedToId(e.target.value)}
                        className="input w-full text-body"
                        autoFocus
                      >
                        <option value="">Select a character...</option>
                        {availableCharacters.map((char) => (
                          <option key={char.id} value={char.id}>
                            {char.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Relationship label (e.g., Mentor, Rival, Friend)"
                      className="input w-full text-body"
                    />
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Description (optional)..."
                      className="input w-full min-h-[60px] resize-none text-body"
                    />
                    <input
                      type="text"
                      value={newDynamic}
                      onChange={(e) => setNewDynamic(e.target.value)}
                      placeholder="Dynamic (e.g., Tension, Trust, Evolving)"
                      className="input w-full text-body"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreate}
                        disabled={!selectedToId || !newLabel.trim() || isSubmitting}
                        className="btn btn-primary btn-sm"
                      >
                        {isSubmitting ? "..." : "Add"}
                      </button>
                      <button onClick={resetForm} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {safeRelationships.length === 0 && !isAdding && (
            <p className="text-caption text-text-subtle py-2">
              No relationships defined.{" "}
              {availableCharacters.length > 0
                ? "Add relationships to connect characters."
                : "Create more characters first."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function RelationshipEditForm({
  relationship,
  onSave,
  onCancel,
}: {
  relationship: CharacterRelationship;
  onSave: (updates: Partial<CharacterRelationship>) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(relationship.label);
  const [description, setDescription] = useState(relationship.description || "");
  const [dynamic, setDynamic] = useState(relationship.dynamic || "");

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Relationship label"
        className="input w-full text-body"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
        className="input w-full min-h-[60px] resize-none text-body"
      />
      <input
        type="text"
        value={dynamic}
        onChange={(e) => setDynamic(e.target.value)}
        placeholder="Dynamic"
        className="input w-full text-body"
      />
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSave({
              label,
              description: description || undefined,
              dynamic: dynamic || undefined,
            })
          }
          disabled={!label.trim()}
          className="btn btn-primary btn-sm"
        >
          Save
        </button>
        <button onClick={onCancel} className="btn btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
