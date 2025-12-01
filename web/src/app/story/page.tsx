"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar, Sidebar } from "@/components/shell";
import { SceneTree, SceneDetail } from "@/components/story";
import { AgentPanel } from "@/components/agents";
import { api } from "@/lib/api";
import type {
  User,
  Project,
  Act,
  Scene,
  Character,
  Location,
  AgentOutput,
  AgentType,
} from "@/types";

// Mock data for development when backend isn't running
const MOCK_DATA = {
  user: {
    id: "user_1",
    workosId: "wos_1",
    email: "director@example.com",
    name: "Director",
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  project: {
    id: "proj_1",
    name: "The Untold Story",
    description: "A cinematic masterpiece",
    ownerId: "user_1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  acts: [
    {
      id: "act_1",
      index: 0,
      title: "Setup",
      synopsis: "Introducing our world and characters",
      projectId: "proj_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sequences: [
        {
          id: "seq_1",
          index: 0,
          title: "The Arrival",
          summary: "Our hero arrives in the city",
          actId: "act_1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scenes: [
            {
              id: "scene_1",
              index: 0,
              title: "Opening shot",
              summary:
                "Aerial view of the city at dawn. The camera slowly descends through the clouds, revealing a sprawling metropolis awakening to a new day.",
              purpose: "Establish the setting and tone",
              tone: "Mysterious",
              sequenceId: "seq_1",
              locationId: "loc_1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              characters: [{ id: "sc_1", sceneId: "scene_1", characterId: "char_1" }],
            },
            {
              id: "scene_2",
              index: 1,
              title: "The deal is struck",
              summary:
                "In a dimly lit tavern, Lord Malachar meets with the mysterious stranger. They negotiate terms that will change the fate of the realm.",
              purpose: "Introduce the central conflict",
              tone: "Tense",
              sequenceId: "seq_1",
              locationId: "loc_2",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              characters: [
                { id: "sc_2", sceneId: "scene_2", characterId: "char_1" },
                { id: "sc_3", sceneId: "scene_2", characterId: "char_2" },
              ],
            },
          ],
        },
        {
          id: "seq_2",
          index: 1,
          title: "Rising Action",
          summary: "The stakes are raised",
          actId: "act_1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scenes: [
            {
              id: "scene_3",
              index: 0,
              title: "Discovery",
              summary: "Elira discovers the ancient artifact hidden in the library.",
              purpose: "Introduce the MacGuffin",
              tone: "Wonder",
              sequenceId: "seq_2",
              locationId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              characters: [{ id: "sc_4", sceneId: "scene_3", characterId: "char_2" }],
            },
          ],
        },
      ],
    },
    {
      id: "act_2",
      index: 1,
      title: "Confrontation",
      synopsis: "The conflict escalates",
      projectId: "proj_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sequences: [],
    },
  ],
  characters: [
    {
      id: "char_1",
      name: "Lord Malachar",
      bio: "A powerful lord with a dark past",
      archetype: "Anti-hero",
      voiceNotes: null,
      imageUrl: null,
      projectId: "proj_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "char_2",
      name: "Elira",
      bio: "A young scholar seeking ancient knowledge",
      archetype: "Seeker",
      voiceNotes: null,
      imageUrl: null,
      projectId: "proj_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  locations: [
    {
      id: "loc_1",
      name: "The City",
      description: "A sprawling metropolis",
      imageUrl: null,
      projectId: "proj_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "loc_2",
      name: "Dockside Tavern",
      description: "A dimly lit establishment by the waterfront",
      imageUrl: null,
      projectId: "proj_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  suggestions: [
    {
      id: "sug_1",
      agentType: "CONTINUITY" as AgentType,
      projectId: "proj_1",
      sceneId: "scene_2",
      shotId: null,
      severity: "ERROR" as const,
      title: "Magic rule violation",
      content:
        "Lord Malachar uses teleportation magic in this scene, but no sacrifice is shown. According to the world rules, all magic requires a sacrifice to function.",
      metadata: {
        characterName: "Lord Malachar",
        ruleTitle: "Magic requires sacrifice",
      },
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sug_2",
      agentType: "CONTINUITY" as AgentType,
      projectId: "proj_1",
      sceneId: "scene_2",
      shotId: null,
      severity: "WARNING" as const,
      title: "Timeline inconsistency",
      content:
        "This scene is set at night, but the previous scene established it was early morning. Consider adding a time transition.",
      metadata: {
        relatedSceneTitles: ["Opening shot"],
      },
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sug_3",
      agentType: "CHARACTER" as AgentType,
      projectId: "proj_1",
      sceneId: "scene_2",
      shotId: null,
      severity: "INFO" as const,
      title: "Character motivation unclear",
      content:
        "Elira's presence in this scene hasn't been established. Consider adding a brief explanation of why she's at the tavern.",
      metadata: {
        characterName: "Elira",
      },
      resolved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export default function StoryPage() {
  const [view, setView] = useState<"story" | "canon" | "agents">("story");
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [acts, setActs] = useState<Act[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [suggestions, setSuggestions] = useState<AgentOutput[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        // Try to get session
        const session = await api.auth.getSession();
        setUser(session.user);

        // Get projects
        const projects = await api.projects.list();
        if (projects.length > 0) {
          const proj = projects[0];
          setProject(proj);

          // Load project data
          const [actsData, charsData, locsData] = await Promise.all([
            api.acts.list(proj.id),
            api.characters.list(proj.id),
            api.locations.list(proj.id),
          ]);

          setActs(actsData);
          setCharacters(charsData);
          setLocations(locsData);
        }
      } catch (err) {
        console.log("Using mock data (backend not available)");
        setUseMockData(true);
        setUser(MOCK_DATA.user);
        setProject(MOCK_DATA.project);
        setActs(MOCK_DATA.acts as Act[]);
        setCharacters(MOCK_DATA.characters);
        setLocations(MOCK_DATA.locations);
        setSuggestions(MOCK_DATA.suggestions);
      }
    }

    loadData();
  }, []);

  // Load suggestions when scene changes
  useEffect(() => {
    if (!selectedScene || useMockData) return;

    async function loadSuggestions() {
      try {
        const data = await api.scenes.getSuggestions(selectedScene!.id);
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      }
    }

    loadSuggestions();
  }, [selectedScene, useMockData]);

  // Run agents
  const handleRunAgents = useCallback(
    async (agentTypes?: AgentType[]) => {
      if (!selectedScene) return;

      setIsLoadingAgents(true);
      try {
        if (useMockData) {
          // Simulate delay for mock
          await new Promise((r) => setTimeout(r, 1500));
          // Just use existing mock suggestions
        } else {
          const newSuggestions = await api.scenes.runAgents(
            selectedScene.id,
            agentTypes
          );
          setSuggestions((prev) => [...newSuggestions, ...prev]);
        }
      } catch (err) {
        console.error("Failed to run agents:", err);
      } finally {
        setIsLoadingAgents(false);
      }
    },
    [selectedScene, useMockData]
  );

  // Resolve suggestion
  const handleResolve = useCallback(
    async (id: string, resolved: boolean) => {
      try {
        if (!useMockData) {
          await api.agentOutputs.resolve(id, resolved);
        }
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, resolved } : s))
        );
      } catch (err) {
        console.error("Failed to resolve suggestion:", err);
      }
    },
    [useMockData]
  );

  // Find context for selected scene
  const findSceneContext = () => {
    if (!selectedScene) return { sequenceTitle: undefined, actTitle: undefined };

    for (const act of acts) {
      for (const seq of act.sequences || []) {
        if (seq.scenes?.some((s) => s.id === selectedScene.id)) {
          return { sequenceTitle: seq.title, actTitle: act.title };
        }
      }
    }
    return { sequenceTitle: undefined, actTitle: undefined };
  };

  const { sequenceTitle, actTitle } = findSceneContext();
  const selectedLocation = selectedScene?.locationId
    ? locations.find((l) => l.id === selectedScene.locationId)
    : null;

  // Suggestion counts by scene
  const suggestionCounts = suggestions.reduce(
    (acc, s) => {
      if (s.sceneId && !s.resolved) {
        acc[s.sceneId] = (acc[s.sceneId] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter suggestions for selected scene
  const sceneSuggestions = selectedScene
    ? suggestions.filter((s) => s.sceneId === selectedScene.id)
    : [];

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <TopBar project={project} user={user} />

      {/* Sidebar */}
      <Sidebar activeView={view} onViewChange={setView} />

      {/* Main Content - Three Panes */}
      <main className="app-main">
        {/* Pane A: Structure Tree */}
        <SceneTree
          acts={acts}
          selectedSceneId={selectedScene?.id || null}
          onSelectScene={setSelectedScene}
          suggestionCounts={suggestionCounts}
        />

        {/* Pane B: Scene Detail */}
        <SceneDetail
          scene={selectedScene}
          sequenceTitle={sequenceTitle}
          actTitle={actTitle}
          characters={characters}
          location={selectedLocation}
        />

        {/* Pane C: Agent Panel */}
        <AgentPanel
          sceneId={selectedScene?.id || null}
          suggestions={sceneSuggestions}
          isLoading={isLoadingAgents}
          onRunAgents={handleRunAgents}
          onResolve={handleResolve}
        />
      </main>
    </div>
  );
}
