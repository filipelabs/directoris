"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { CharacterArc, CharacterArcBeat } from "@/types";

interface ArcsSectionProps {
  characterId: string;
  arcs: CharacterArc[];
  onArcsChange: (arcs: CharacterArc[]) => void;
  isLoading: boolean;
}

export function ArcsSection({
  characterId,
  arcs,
  onArcsChange,
  isLoading,
}: ArcsSectionProps) {
  // Ensure we have an array
  const safeArcs = Array.isArray(arcs) ? arcs : [];

  const [isAddingArc, setIsAddingArc] = useState(false);
  const [expandedArcId, setExpandedArcId] = useState<string | null>(null);

  const handleCreateArc = async (data: { title: string; summary?: string; startState?: string; endState?: string }) => {
    try {
      const arc = await api.arcs.create(characterId, data);
      onArcsChange([...arcs, arc]);
      setIsAddingArc(false);
      setExpandedArcId(arc.id);
    } catch (err) {
      console.error("Failed to create arc:", err);
    }
  };

  const handleUpdateArc = async (arcId: string, updates: Partial<CharacterArc>) => {
    try {
      // Filter out null values for the DTO
      const dto: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== null) {
          dto[key] = value;
        }
      }
      const updated = await api.arcs.update(arcId, dto);
      onArcsChange(arcs.map((a) => (a.id === arcId ? { ...a, ...updated } : a)));
    } catch (err) {
      console.error("Failed to update arc:", err);
    }
  };

  const handleDeleteArc = async (arcId: string) => {
    try {
      await api.arcs.delete(arcId);
      onArcsChange(arcs.filter((a) => a.id !== arcId));
      if (expandedArcId === arcId) setExpandedArcId(null);
    } catch (err) {
      console.error("Failed to delete arc:", err);
    }
  };

  const handleBeatsChange = (arcId: string, beats: CharacterArcBeat[]) => {
    onArcsChange(arcs.map((a) => (a.id === arcId ? { ...a, beats } : a)));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-caption font-semibold text-text-muted uppercase tracking-wider">
          Character Arcs
        </h2>
        {!isAddingArc && (
          <button
            onClick={() => setIsAddingArc(true)}
            className="text-micro text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            + Add Arc
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-caption text-text-subtle">Loading arcs...</div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {safeArcs.map((arc) => (
              <ArcCard
                key={arc.id}
                arc={arc}
                isExpanded={expandedArcId === arc.id}
                onToggle={() => setExpandedArcId(expandedArcId === arc.id ? null : arc.id)}
                onUpdate={(updates) => handleUpdateArc(arc.id, updates)}
                onDelete={() => handleDeleteArc(arc.id)}
                onBeatsChange={(beats) => handleBeatsChange(arc.id, beats)}
              />
            ))}
          </AnimatePresence>

          {/* Add arc form */}
          <AnimatePresence>
            {isAddingArc && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ArcCreateForm
                  onCreate={handleCreateArc}
                  onCancel={() => setIsAddingArc(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {safeArcs.length === 0 && !isAddingArc && (
            <p className="text-caption text-text-subtle py-2">
              No character arcs defined. Add arcs to track character development.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ArcCard({
  arc,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onBeatsChange,
}: {
  arc: CharacterArc;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<CharacterArc>) => void;
  onDelete: () => void;
  onBeatsChange: (beats: CharacterArcBeat[]) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [beats, setBeats] = useState<CharacterArcBeat[]>(arc.beats || []);
  const [isLoadingBeats, setIsLoadingBeats] = useState(false);

  const loadBeats = async () => {
    if (beats.length > 0 || isLoadingBeats) return;
    setIsLoadingBeats(true);
    try {
      const loaded = await api.beats.list(arc.id);
      setBeats(loaded);
      onBeatsChange(loaded);
    } catch (err) {
      console.error("Failed to load beats:", err);
    } finally {
      setIsLoadingBeats(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded) {
      loadBeats();
    }
    onToggle();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-bg-elevated rounded-lg border border-border-subtle overflow-hidden"
    >
      {/* Arc header */}
      <div
        className="p-3 flex items-start justify-between gap-2 cursor-pointer hover:bg-bg-hover transition-colors"
        onClick={handleToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 text-text-subtle transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
            </svg>
            <span className="text-body font-medium text-text-primary">{arc.title}</span>
            {arc.season && (
              <span className="px-1.5 py-0.5 text-micro bg-bg-hover text-text-subtle rounded">
                Season {arc.season}
              </span>
            )}
          </div>
          {arc.summary && (
            <p className="text-caption text-text-secondary mt-1 ml-6">{arc.summary}</p>
          )}
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-text-subtle hover:text-text-primary transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-text-subtle hover:text-status-error transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-border-subtle">
              {/* Start/End states */}
              {(arc.startState || arc.endState) && (
                <div className="flex gap-4 py-3 border-b border-border-subtle">
                  {arc.startState && (
                    <div className="flex-1">
                      <p className="text-micro text-text-subtle mb-1">Start State</p>
                      <p className="text-caption text-text-secondary">{arc.startState}</p>
                    </div>
                  )}
                  {arc.endState && (
                    <div className="flex-1">
                      <p className="text-micro text-text-subtle mb-1">End State</p>
                      <p className="text-caption text-text-secondary">{arc.endState}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Beats */}
              <BeatsSection
                arcId={arc.id}
                beats={beats}
                onBeatsChange={(newBeats) => {
                  setBeats(newBeats);
                  onBeatsChange(newBeats);
                }}
                isLoading={isLoadingBeats}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {isEditing && (
          <ArcEditModal
            arc={arc}
            onSave={(updates) => {
              onUpdate(updates);
              setIsEditing(false);
            }}
            onClose={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ArcCreateForm({
  onCreate,
  onCancel,
}: {
  onCreate: (data: { title: string; summary?: string; startState?: string; endState?: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [startState, setStartState] = useState("");
  const [endState, setEndState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onCreate({
      title: title.trim(),
      summary: summary.trim() || undefined,
      startState: startState.trim() || undefined,
      endState: endState.trim() || undefined,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="p-3 bg-bg-elevated rounded-lg border border-accent-primary">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Arc title (e.g., Redemption Arc)"
          className="input w-full text-body"
          autoFocus
        />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary (optional)..."
          className="input w-full min-h-[60px] resize-none text-body"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={startState}
            onChange={(e) => setStartState(e.target.value)}
            placeholder="Start state"
            className="input w-full text-caption"
          />
          <input
            type="text"
            value={endState}
            onChange={(e) => setEndState(e.target.value)}
            placeholder="End state"
            className="input w-full text-caption"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? "..." : "Add Arc"}
          </button>
          <button onClick={onCancel} className="btn btn-secondary btn-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ArcEditModal({
  arc,
  onSave,
  onClose,
}: {
  arc: CharacterArc;
  onSave: (updates: Partial<CharacterArc>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(arc.title);
  const [summary, setSummary] = useState(arc.summary || "");
  const [startState, setStartState] = useState(arc.startState || "");
  const [endState, setEndState] = useState(arc.endState || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-bg-surface rounded-xl border border-border-subtle p-4 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-title font-medium text-text-primary mb-4">Edit Arc</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Arc title"
            className="input w-full"
            autoFocus
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summary..."
            className="input w-full min-h-[80px] resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-micro text-text-subtle mb-1">Start State</label>
              <input
                type="text"
                value={startState}
                onChange={(e) => setStartState(e.target.value)}
                className="input w-full text-caption"
              />
            </div>
            <div>
              <label className="block text-micro text-text-subtle mb-1">End State</label>
              <input
                type="text"
                value={endState}
                onChange={(e) => setEndState(e.target.value)}
                className="input w-full text-caption"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() =>
                onSave({
                  title,
                  summary: summary || undefined,
                  startState: startState || undefined,
                  endState: endState || undefined,
                })
              }
              disabled={!title.trim()}
              className="btn btn-primary flex-1"
            >
              Save
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BeatsSection({
  arcId,
  beats,
  onBeatsChange,
  isLoading,
}: {
  arcId: string;
  beats: CharacterArcBeat[];
  onBeatsChange: (beats: CharacterArcBeat[]) => void;
  isLoading: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBeat = async () => {
    if (!newDescription.trim()) return;
    setIsSubmitting(true);
    try {
      const beat = await api.beats.create(arcId, {
        description: newDescription.trim(),
        index: beats.length,
        type: newType.trim() || undefined,
      });
      onBeatsChange([...beats, beat]);
      setNewDescription("");
      setNewType("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to create beat:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBeat = async (beatId: string) => {
    try {
      await api.beats.delete(beatId);
      onBeatsChange(beats.filter((b) => b.id !== beatId));
    } catch (err) {
      console.error("Failed to delete beat:", err);
    }
  };

  return (
    <div className="pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-micro font-medium text-text-subtle uppercase tracking-wider">Beats</p>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-micro text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            + Add Beat
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-micro text-text-subtle">Loading beats...</p>
      ) : (
        <div className="space-y-2">
          {beats.map((beat, index) => (
            <div
              key={beat.id}
              className="flex items-start gap-2 p-2 bg-bg-hover rounded group"
            >
              <span className="text-micro text-text-subtle w-5 flex-shrink-0">{index + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-caption text-text-secondary">{beat.description}</p>
                {beat.type && (
                  <span className="text-micro text-text-subtle">{beat.type}</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteBeat(beat.id)}
                className="p-0.5 text-text-subtle hover:text-status-error transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add beat form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-2 bg-bg-hover rounded border border-accent-primary">
                  <div className="space-y-2">
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Beat description..."
                      className="input w-full min-h-[50px] resize-none text-caption"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      placeholder="Type (optional, e.g., Turning Point)"
                      className="input w-full text-micro"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateBeat}
                        disabled={!newDescription.trim() || isSubmitting}
                        className="btn btn-primary btn-sm text-micro"
                      >
                        {isSubmitting ? "..." : "Add"}
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setNewDescription("");
                          setNewType("");
                        }}
                        className="btn btn-secondary btn-sm text-micro"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {beats.length === 0 && !isAdding && (
            <p className="text-micro text-text-subtle py-1">No beats yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
