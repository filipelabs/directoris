"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { CharacterFact, Character } from "@/types";

interface FactsSectionProps {
  characterId: string;
  facts: CharacterFact[];
  allCharacters: Character[];
  onFactsChange: (facts: CharacterFact[]) => void;
  isLoading: boolean;
}

export function FactsSection({
  characterId,
  facts,
  allCharacters,
  onFactsChange,
  isLoading,
}: FactsSectionProps) {
  // Ensure we have arrays
  const safeFacts = Array.isArray(facts) ? facts : [];
  const safeAllCharacters = Array.isArray(allCharacters) ? allCharacters : [];

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newIsSecret, setNewIsSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newLabel.trim() || !newValue.trim()) return;

    setIsSubmitting(true);
    try {
      const fact = await api.facts.create(characterId, {
        label: newLabel.trim(),
        value: newValue.trim(),
        isSecret: newIsSecret,
      });
      onFactsChange([...facts, fact]);
      setNewLabel("");
      setNewValue("");
      setNewIsSecret(false);
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to create fact:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (fact: CharacterFact, updates: Partial<CharacterFact>) => {
    try {
      const updated = await api.facts.update(fact.id, updates);
      onFactsChange(facts.map((f) => (f.id === fact.id ? updated : f)));
    } catch (err) {
      console.error("Failed to update fact:", err);
    }
  };

  const handleDelete = async (factId: string) => {
    try {
      await api.facts.delete(factId);
      onFactsChange(facts.filter((f) => f.id !== factId));
    } catch (err) {
      console.error("Failed to delete fact:", err);
    }
  };

  const getKnownByNames = (knownByIds: string[]) => {
    const safeKnownByIds = Array.isArray(knownByIds) ? knownByIds : [];
    return safeKnownByIds
      .map((id) => safeAllCharacters.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-caption font-semibold text-text-muted uppercase tracking-wider">
          Facts
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-micro text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            + Add Fact
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-caption text-text-subtle">Loading facts...</div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {safeFacts.map((fact) => (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-bg-elevated rounded-lg border border-border-subtle group"
              >
                {editingId === fact.id ? (
                  <FactEditForm
                    fact={fact}
                    allCharacters={allCharacters}
                    onSave={(updates) => {
                      handleUpdate(fact, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-caption font-medium text-text-primary">
                          {fact.label}
                        </span>
                        {fact.isSecret && (
                          <span className="px-1.5 py-0.5 text-micro bg-status-warning/10 text-status-warning rounded">
                            Secret
                          </span>
                        )}
                      </div>
                      <p className="text-body text-text-secondary mt-1">{fact.value}</p>
                      {fact.isSecret && fact.knownByIds.length > 0 && (
                        <p className="text-micro text-text-subtle mt-1">
                          Known by: {getKnownByNames(fact.knownByIds)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(fact.id)}
                        className="p-1 text-text-subtle hover:text-text-primary transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(fact.id)}
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
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Fact label (e.g., Age, Occupation)"
                      className="input w-full text-body"
                      autoFocus
                    />
                    <textarea
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Fact value..."
                      className="input w-full min-h-[60px] resize-none text-body"
                    />
                    <label className="flex items-center gap-2 text-caption text-text-muted">
                      <input
                        type="checkbox"
                        checked={newIsSecret}
                        onChange={(e) => setNewIsSecret(e.target.checked)}
                        className="rounded border-border-subtle"
                      />
                      This is a secret fact
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreate}
                        disabled={!newLabel.trim() || !newValue.trim() || isSubmitting}
                        className="btn btn-primary btn-sm"
                      >
                        {isSubmitting ? "..." : "Add"}
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setNewLabel("");
                          setNewValue("");
                          setNewIsSecret(false);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {safeFacts.length === 0 && !isAdding && (
            <p className="text-caption text-text-subtle py-2">
              No facts added yet. Add facts to track important details.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function FactEditForm({
  fact,
  allCharacters,
  onSave,
  onCancel,
}: {
  fact: CharacterFact;
  allCharacters: Character[];
  onSave: (updates: Partial<CharacterFact>) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(fact.label);
  const [value, setValue] = useState(fact.value);
  const [isSecret, setIsSecret] = useState(fact.isSecret);
  const [knownByIds, setKnownByIds] = useState<string[]>(fact.knownByIds);

  const toggleKnownBy = (characterId: string) => {
    if (knownByIds.includes(characterId)) {
      setKnownByIds(knownByIds.filter((id) => id !== characterId));
    } else {
      setKnownByIds([...knownByIds, characterId]);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Fact label"
        className="input w-full text-body"
        autoFocus
      />
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Fact value..."
        className="input w-full min-h-[60px] resize-none text-body"
      />
      <label className="flex items-center gap-2 text-caption text-text-muted">
        <input
          type="checkbox"
          checked={isSecret}
          onChange={(e) => setIsSecret(e.target.checked)}
          className="rounded border-border-subtle"
        />
        This is a secret fact
      </label>
      {isSecret && allCharacters.length > 0 && (
        <div>
          <p className="text-micro text-text-subtle mb-2">Who knows this secret?</p>
          <div className="flex flex-wrap gap-2">
            {allCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => toggleKnownBy(char.id)}
                className={`px-2 py-1 text-micro rounded transition-colors ${
                  knownByIds.includes(char.id)
                    ? "bg-accent-primary text-white"
                    : "bg-bg-hover text-text-muted hover:text-text-primary"
                }`}
              >
                {char.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ label, value, isSecret, knownByIds })}
          disabled={!label.trim() || !value.trim()}
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
