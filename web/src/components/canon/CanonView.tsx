"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { CharacterList } from "./CharacterList";
import { CharacterDetail } from "./CharacterDetail";
import { RulesList } from "./RulesList";
import { RuleDetail } from "./RuleDetail";
import type { Character, WorldRule, Project } from "@/types";

type CanonTab = "characters" | "rules";

interface CanonViewProps {
  project: Project;
  characters: Character[];
  rules: WorldRule[];
  onCharactersChange: (characters: Character[]) => void;
  onRulesChange: (rules: WorldRule[]) => void;
}

// Get labels based on project type (from description which may contain type info)
function getCanonLabels(project: Project) {
  // For now, we detect type from project description or default to story
  // In future, Project model should have a `type` field
  const isUX = project.description?.toLowerCase().includes("ux") ||
               project.name?.toLowerCase().includes("ux");
  const isContent = project.description?.toLowerCase().includes("content") ||
                    project.name?.toLowerCase().includes("content");

  if (isUX) {
    return {
      charactersTab: "Personas",
      rulesTab: "UX Principles",
      characterSingular: "Persona",
      characterPlural: "Personas",
      archetypeLabel: "Type",
      ruleSingular: "Principle",
      rulePlural: "Principles",
    };
  }

  if (isContent) {
    return {
      charactersTab: "Key Figures",
      rulesTab: "Content Rules",
      characterSingular: "Figure",
      characterPlural: "Figures",
      archetypeLabel: "Role",
      ruleSingular: "Rule",
      rulePlural: "Rules",
    };
  }

  // Default: story
  return {
    charactersTab: "Characters",
    rulesTab: "World Rules",
    characterSingular: "Character",
    characterPlural: "Characters",
    archetypeLabel: "Archetype",
    ruleSingular: "Rule",
    rulePlural: "Rules",
  };
}

export function CanonView({
  project,
  characters,
  rules,
  onCharactersChange,
  onRulesChange,
}: CanonViewProps) {
  const [activeTab, setActiveTab] = useState<CanonTab>("characters");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    characters[0]?.id || null
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(
    rules[0]?.id || null
  );

  const labels = getCanonLabels(project);

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId) || null;
  const selectedRule = rules.find((r) => r.id === selectedRuleId) || null;

  const handleCharacterUpdate = useCallback(
    (updated: Character) => {
      onCharactersChange(
        characters.map((c) => (c.id === updated.id ? updated : c))
      );
    },
    [characters, onCharactersChange]
  );

  const handleCharacterDelete = useCallback(
    (id: string) => {
      onCharactersChange(characters.filter((c) => c.id !== id));
      if (selectedCharacterId === id) {
        const remaining = characters.filter((c) => c.id !== id);
        setSelectedCharacterId(remaining[0]?.id || null);
      }
    },
    [characters, onCharactersChange, selectedCharacterId]
  );

  const handleCharacterCreate = useCallback(
    (character: Character) => {
      onCharactersChange([...characters, character]);
      setSelectedCharacterId(character.id);
    },
    [characters, onCharactersChange]
  );

  const handleRuleUpdate = useCallback(
    (updated: WorldRule) => {
      onRulesChange(rules.map((r) => (r.id === updated.id ? updated : r)));
    },
    [rules, onRulesChange]
  );

  const handleRuleDelete = useCallback(
    (id: string) => {
      onRulesChange(rules.filter((r) => r.id !== id));
      if (selectedRuleId === id) {
        const remaining = rules.filter((r) => r.id !== id);
        setSelectedRuleId(remaining[0]?.id || null);
      }
    },
    [rules, onRulesChange, selectedRuleId]
  );

  const handleRuleCreate = useCallback(
    (rule: WorldRule) => {
      onRulesChange([...rules, rule]);
      setSelectedRuleId(rule.id);
    },
    [rules, onRulesChange]
  );

  return (
    <div className="col-span-3 flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-border-subtle bg-bg-surface">
        <TabButton
          label={labels.charactersTab}
          isActive={activeTab === "characters"}
          onClick={() => setActiveTab("characters")}
        />
        <TabButton
          label={labels.rulesTab}
          isActive={activeTab === "rules"}
          onClick={() => setActiveTab("rules")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "characters" ? (
          <>
            <CharacterList
              projectId={project.id}
              characters={characters}
              selectedId={selectedCharacterId}
              onSelect={setSelectedCharacterId}
              onCreate={handleCharacterCreate}
              labels={labels}
            />
            <CharacterDetail
              projectId={project.id}
              character={selectedCharacter}
              allCharacters={characters}
              onUpdate={handleCharacterUpdate}
              onDelete={handleCharacterDelete}
              labels={labels}
            />
          </>
        ) : (
          <>
            <RulesList
              projectId={project.id}
              rules={rules}
              selectedId={selectedRuleId}
              onSelect={setSelectedRuleId}
              onCreate={handleRuleCreate}
              labels={labels}
            />
            <RuleDetail
              rule={selectedRule}
              onUpdate={handleRuleUpdate}
              onDelete={handleRuleDelete}
              labels={labels}
            />
          </>
        )}
      </div>
    </div>
  );
}

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
        "relative px-4 py-2 text-caption font-medium transition-colors rounded-lg",
        isActive
          ? "text-text-primary bg-bg-elevated"
          : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
      )}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="canon-tab-indicator"
          className="absolute inset-0 bg-bg-elevated rounded-lg -z-10"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}
