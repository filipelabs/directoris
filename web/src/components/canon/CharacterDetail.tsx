"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { FactsSection } from "./FactsSection";
import { RelationshipsSection } from "./RelationshipsSection";
import { ArcsSection } from "./ArcsSection";
import type { Character, CharacterFact, CharacterRelationship, CharacterArc } from "@/types";

interface CanonLabels {
  characterSingular: string;
  archetypeLabel: string;
}

interface CharacterDetailProps {
  projectId: string;
  character: Character | null;
  allCharacters: Character[];
  onUpdate: (character: Character) => void;
  onDelete: (id: string) => void;
  labels: CanonLabels;
}

export function CharacterDetail({
  projectId,
  character,
  allCharacters,
  onUpdate,
  onDelete,
  labels,
}: CharacterDetailProps) {
  const [editedName, setEditedName] = useState("");
  const [editedArchetype, setEditedArchetype] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedVoiceNotes, setEditedVoiceNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Character sub-entities
  const [facts, setFacts] = useState<CharacterFact[]>([]);
  const [relationships, setRelationships] = useState<CharacterRelationship[]>([]);
  const [arcs, setArcs] = useState<CharacterArc[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Sync local state with character prop
  useEffect(() => {
    if (character) {
      setEditedName(character.name);
      setEditedArchetype(character.archetype || "");
      setEditedBio(character.bio || "");
      setEditedVoiceNotes(character.voiceNotes || "");
      loadCharacterDetails(character.id);
    }
  }, [character?.id]);

  const loadCharacterDetails = async (characterId: string) => {
    setIsLoadingDetails(true);
    try {
      const [factsData, relationshipsData, arcsData] = await Promise.all([
        api.facts.list(characterId),
        api.relationships.list(characterId),
        api.arcs.list(characterId),
      ]);
      setFacts(Array.isArray(factsData) ? factsData : []);
      // Backend returns { outgoing, incoming } - we display outgoing relationships
      const outgoing = relationshipsData?.outgoing;
      setRelationships(Array.isArray(outgoing) ? outgoing : []);
      setArcs(Array.isArray(arcsData) ? arcsData : []);
    } catch (err) {
      console.error("Failed to load character details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!character) return;

    const hasChanges =
      editedName !== character.name ||
      editedArchetype !== (character.archetype || "") ||
      editedBio !== (character.bio || "") ||
      editedVoiceNotes !== (character.voiceNotes || "");

    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const updated = await api.characters.update(character.id, {
        name: editedName,
        archetype: editedArchetype || undefined,
        bio: editedBio || undefined,
        voiceNotes: editedVoiceNotes || undefined,
      });
      onUpdate(updated);
    } catch (err) {
      console.error("Failed to update character:", err);
    } finally {
      setIsSaving(false);
    }
  }, [character, editedName, editedArchetype, editedBio, editedVoiceNotes, onUpdate]);

  const handleDelete = async () => {
    if (!character) return;
    if (!confirm(`Delete ${labels.characterSingular.toLowerCase()} "${character.name}"?`)) return;

    setIsDeleting(true);
    try {
      await api.characters.delete(character.id);
      onDelete(character.id);
    } catch (err) {
      console.error("Failed to delete character:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!character) {
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <p className="text-text-muted text-body">
            Select a {labels.characterSingular.toLowerCase()} to view details
          </p>
          <p className="text-text-subtle text-caption mt-1">
            Or create a new one from the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-surface overflow-hidden min-h-0">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center overflow-hidden">
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-title font-medium text-text-muted">
                {character.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-title text-text-primary">{character.name}</h1>
            {character.archetype && (
              <p className="text-caption text-text-muted">{character.archetype}</p>
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
            title={`Delete ${labels.characterSingular.toLowerCase()}`}
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
      <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0">
        {/* Basic Info */}
        <section>
          <h2 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-4">
            Basic Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-caption text-text-muted mb-1">Name</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSave}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-caption text-text-muted mb-1">
                {labels.archetypeLabel}
              </label>
              <input
                type="text"
                value={editedArchetype}
                onChange={(e) => setEditedArchetype(e.target.value)}
                onBlur={handleSave}
                placeholder={`e.g., Protagonist, Mentor, New User...`}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-caption text-text-muted mb-1">Bio</label>
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                onBlur={handleSave}
                placeholder="Background, personality, goals..."
                className="input w-full min-h-[100px] resize-none"
              />
            </div>
            <div>
              <label className="block text-caption text-text-muted mb-1">Voice Notes</label>
              <textarea
                value={editedVoiceNotes}
                onChange={(e) => setEditedVoiceNotes(e.target.value)}
                onBlur={handleSave}
                placeholder="Speech patterns, dialect, tone..."
                className="input w-full min-h-[80px] resize-none"
              />
            </div>
          </div>
        </section>

        {/* Facts */}
        <FactsSection
          characterId={character.id}
          facts={facts}
          allCharacters={allCharacters}
          onFactsChange={setFacts}
          isLoading={isLoadingDetails}
        />

        {/* Relationships */}
        <RelationshipsSection
          characterId={character.id}
          relationships={relationships}
          allCharacters={allCharacters}
          onRelationshipsChange={setRelationships}
          isLoading={isLoadingDetails}
        />

        {/* Arcs */}
        <ArcsSection
          characterId={character.id}
          arcs={arcs}
          onArcsChange={setArcs}
          isLoading={isLoadingDetails}
        />
      </div>
    </div>
  );
}
