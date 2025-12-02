"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  onReorderActs?: (actIds: string[]) => Promise<void>;
  onReorderSequences?: (actId: string, sequenceIds: string[]) => Promise<void>;
  onReorderScenes?: (sequenceId: string, sceneIds: string[]) => Promise<void>;
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
  onReorderActs,
  onReorderSequences,
  onReorderScenes,
}: SceneTreeProps) {
  const safeActs = acts || [];
  const [isAddingAct, setIsAddingAct] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"act" | "sequence" | "scene" | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection that only allows dropping on same-type items
  const customCollisionDetection: CollisionDetection = (args) => {
    const { active } = args;
    const activeIdStr = active.id as string;

    // Get the type prefix of the active item
    let activePrefix = "";
    if (activeIdStr.startsWith("act-")) activePrefix = "act-";
    else if (activeIdStr.startsWith("seq-")) activePrefix = "seq-";
    else if (activeIdStr.startsWith("scene-")) activePrefix = "scene-";

    // Use closestCenter but filter to only same-type items
    const collisions = closestCenter(args);

    // Filter collisions to only include same-type items
    return collisions.filter((collision) => {
      const collidedId = collision.id as string;
      return collidedId.startsWith(activePrefix);
    });
  };

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

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    if (id.startsWith("act-")) {
      setActiveId(id.replace("act-", ""));
      setActiveType("act");
    } else if (id.startsWith("seq-")) {
      setActiveId(id.replace("seq-", ""));
      setActiveType("sequence");
    } else if (id.startsWith("scene-")) {
      setActiveId(id.replace("scene-", ""));
      setActiveType("scene");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Reorder acts
    if (activeIdStr.startsWith("act-") && overIdStr.startsWith("act-")) {
      const activeActId = activeIdStr.replace("act-", "");
      const overActId = overIdStr.replace("act-", "");

      const oldIndex = safeActs.findIndex((a) => a.id === activeActId);
      const newIndex = safeActs.findIndex((a) => a.id === overActId);

      if (oldIndex !== -1 && newIndex !== -1 && onReorderActs) {
        const newOrder = arrayMove(safeActs, oldIndex, newIndex);
        await onReorderActs(newOrder.map((a) => a.id));
      }
    }

    // Reorder sequences within an act
    if (activeIdStr.startsWith("seq-") && overIdStr.startsWith("seq-")) {
      const activeSeqId = activeIdStr.replace("seq-", "");
      const overSeqId = overIdStr.replace("seq-", "");

      // Find which act contains both sequences
      for (const act of safeActs) {
        const sequences = act.sequences || [];
        const activeIndex = sequences.findIndex((s) => s.id === activeSeqId);
        const overIndex = sequences.findIndex((s) => s.id === overSeqId);

        if (activeIndex !== -1 && overIndex !== -1 && onReorderSequences) {
          const newOrder = arrayMove(sequences, activeIndex, overIndex);
          await onReorderSequences(act.id, newOrder.map((s) => s.id));
          break;
        }
      }
    }

    // Reorder scenes within a sequence
    if (activeIdStr.startsWith("scene-") && overIdStr.startsWith("scene-")) {
      const activeSceneId = activeIdStr.replace("scene-", "");
      const overSceneId = overIdStr.replace("scene-", "");

      // Find which sequence contains both scenes
      for (const act of safeActs) {
        for (const seq of act.sequences || []) {
          const scenes = seq.scenes || [];
          const activeIndex = scenes.findIndex((s) => s.id === activeSceneId);
          const overIndex = scenes.findIndex((s) => s.id === overSceneId);

          if (activeIndex !== -1 && overIndex !== -1 && onReorderScenes) {
            const newOrder = arrayMove(scenes, activeIndex, overIndex);
            await onReorderScenes(seq.id, newOrder.map((s) => s.id));
            break;
          }
        }
      }
    }
  };

  // Find active item for drag overlay
  const getActiveItem = () => {
    if (!activeId || !activeType) return null;

    if (activeType === "act") {
      return safeActs.find((a) => a.id === activeId);
    }
    if (activeType === "sequence") {
      for (const act of safeActs) {
        const seq = act.sequences?.find((s) => s.id === activeId);
        if (seq) return seq;
      }
    }
    if (activeType === "scene") {
      for (const act of safeActs) {
        for (const seq of act.sequences || []) {
          const scene = seq.scenes?.find((s) => s.id === activeId);
          if (scene) return scene;
        }
      }
    }
    return null;
  };

  const activeItem = getActiveItem();

  return (
    <div className="pane pane-a py-4">
      {/* Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <span className="text-caption font-semibold text-text-muted uppercase tracking-wider">
          Structure
        </span>
      </div>

      {/* Tree */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col">
          <SortableContext
            items={safeActs.map((a) => `act-${a.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {safeActs.map((act) => (
              <SortableActNode
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
                onReorderScenes={onReorderScenes}
              />
            ))}
          </SortableContext>

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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem && activeType === "act" && (
            <div className="bg-bg-elevated border border-border-default rounded px-4 py-2 shadow-lg">
              <span className="text-mono text-text-subtle text-xs mr-2">
                ACT {toRoman((activeItem as Act).index)}
              </span>
              <span className="text-caption font-medium text-text-primary">
                {(activeItem as Act).title}
              </span>
            </div>
          )}
          {activeItem && activeType === "sequence" && (
            <div className="bg-bg-elevated border border-border-default rounded px-4 py-1.5 shadow-lg">
              <span className="text-mono text-text-subtle text-xs mr-2">
                SEQ {String((activeItem as Sequence).index).padStart(2, "0")}
              </span>
              <span className="text-caption text-text-muted">
                {(activeItem as Sequence).title}
              </span>
            </div>
          )}
          {activeItem && activeType === "scene" && (
            <div className="bg-bg-elevated border border-border-default rounded px-4 py-2 shadow-lg">
              <span className="text-mono text-text-subtle text-xs mr-2">
                SCN {String((activeItem as Scene).index).padStart(2, "0")}
              </span>
              <span className="text-caption text-text-muted">
                {(activeItem as Scene).title}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

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

// ─── Drag Handle Icon ──────────────────────────────────────────────────────

function DragHandleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-3 h-3 text-text-subtle", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8h16M4 16h16"
      />
    </svg>
  );
}

// ─── Sortable Act Node ─────────────────────────────────────────────────────

interface SortableActNodeProps extends ActNodeProps {
  onReorderScenes?: (sequenceId: string, sceneIds: string[]) => Promise<void>;
}

function SortableActNode(props: SortableActNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `act-${props.act.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ActNode {...props} dragHandleProps={{ ...attributes, ...listeners }} />
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
  onReorderScenes?: (sequenceId: string, sceneIds: string[]) => Promise<void>;
  dragHandleProps?: Record<string, unknown>;
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
  onReorderScenes,
  dragHandleProps,
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
          <span
            {...dragHandleProps}
            className="text-mono text-text-subtle text-xs cursor-grab active:cursor-grabbing hover:text-text-primary transition-colors"
          >
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
            <SortableContext
              items={(act.sequences || []).map((s) => `seq-${s.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {act.sequences?.map((seq) => (
                <SortableSequenceNode
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
                  onReorderScenes={onReorderScenes}
                />
              ))}
            </SortableContext>

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

// ─── Sortable Sequence Node ────────────────────────────────────────────────

interface SortableSequenceNodeProps extends SequenceNodeProps {
  onReorderScenes?: (sequenceId: string, sceneIds: string[]) => Promise<void>;
}

function SortableSequenceNode(props: SortableSequenceNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `seq-${props.sequence.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SequenceNode {...props} dragHandleProps={{ ...attributes, ...listeners }} />
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
  onReorderScenes?: (sequenceId: string, sceneIds: string[]) => Promise<void>;
  dragHandleProps?: Record<string, unknown>;
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
  onReorderScenes,
  dragHandleProps,
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
          <span
            {...dragHandleProps}
            className="text-mono text-text-subtle text-xs cursor-grab active:cursor-grabbing hover:text-text-primary transition-colors"
          >
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
            <SortableContext
              items={(sequence.scenes || []).map((s) => `scene-${s.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {sequence.scenes?.map((scene) => (
                <SortableSceneRow
                  key={scene.id}
                  scene={scene}
                  isSelected={selectedSceneId === scene.id}
                  onClick={() => onSelectScene(scene)}
                  suggestionCount={suggestionCounts[scene.id] || 0}
                  onDelete={onDeleteScene}
                />
              ))}
            </SortableContext>

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

// ─── Sortable Scene Row ────────────────────────────────────────────────────

function SortableSceneRow(props: SceneRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `scene-${props.scene.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SceneRow {...props} dragHandleProps={{ ...attributes, ...listeners }} />
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
  dragHandleProps?: Record<string, unknown>;
}

function SceneRow({
  scene,
  isSelected,
  onClick,
  suggestionCount,
  onDelete,
  dragHandleProps,
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

        {/* Scene number - drag handle */}
        <span
          {...dragHandleProps}
          className="text-mono text-text-subtle text-xs cursor-grab active:cursor-grabbing hover:text-text-primary transition-colors shrink-0"
        >
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
