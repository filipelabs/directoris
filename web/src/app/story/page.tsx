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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
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
        console.error("Failed to load data:", err);
        setError("Failed to connect. Please ensure the backend is running and you're logged in.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Load suggestions when scene changes
  useEffect(() => {
    if (!selectedScene) return;

    async function loadSuggestions() {
      try {
        const data = await api.scenes.getSuggestions(selectedScene!.id);
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      }
    }

    loadSuggestions();
  }, [selectedScene]);

  // Run agents
  const handleRunAgents = useCallback(
    async (agentTypes?: AgentType[]) => {
      if (!selectedScene) return;

      setIsLoadingAgents(true);
      try {
        const newSuggestions = await api.scenes.runAgents(
          selectedScene.id,
          agentTypes
        );
        setSuggestions((prev) => [...newSuggestions, ...prev]);
      } catch (err) {
        console.error("Failed to run agents:", err);
      } finally {
        setIsLoadingAgents(false);
      }
    },
    [selectedScene]
  );

  // Resolve suggestion
  const handleResolve = useCallback(
    async (id: string, resolved: boolean) => {
      try {
        await api.agentOutputs.resolve(id, resolved);
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, resolved } : s))
        );
      } catch (err) {
        console.error("Failed to resolve suggestion:", err);
      }
    },
    []
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

  // Loading state
  if (isLoading) {
    return (
      <div className="app-shell">
        <TopBar project={null} user={null} />
        <Sidebar activeView={view} onViewChange={setView} />
        <main className="app-main">
          <div className="col-span-3 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app-shell">
        <TopBar project={null} user={null} />
        <Sidebar activeView={view} onViewChange={setView} />
        <main className="app-main">
          <div className="col-span-3 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-severity-error/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-severity-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-text-primary mb-2">Connection Error</h2>
              <p className="text-text-secondary mb-4">{error}</p>
              <a
                href="/api/v1/auth/login"
                className="inline-flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                Sign in with WorkOS
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Empty state - no projects
  if (!project) {
    return (
      <div className="app-shell">
        <TopBar project={null} user={user} />
        <Sidebar activeView={view} onViewChange={setView} />
        <main className="app-main">
          <div className="col-span-3 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-text-primary mb-2">No Projects Yet</h2>
              <p className="text-text-secondary mb-4">Create your first story project to get started.</p>
              <button
                onClick={() => {/* TODO: Create project modal */}}
                className="inline-flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
