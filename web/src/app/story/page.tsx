"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopBar, Sidebar, NewProjectModal } from "@/components/shell";
import { SceneTree, SceneDetail } from "@/components/story";
import { AgentPanel } from "@/components/agents";
import { CanonView } from "@/components/canon";
import { WelcomeScreen, OnboardingChecklist } from "@/components/onboarding";
import { api } from "@/lib/api";
import type {
  User,
  Project,
  Act,
  Sequence,
  Scene,
  Character,
  Location,
  WorldRule,
  AgentOutput,
  AgentType,
  UpdateSceneDto,
} from "@/types";

const LAST_PROJECT_KEY = "directoris:lastProjectId";

interface WizardData {
  projectType: "story" | "content" | "ux" | null;
  projectName: string;
  logline: string;
  characters: { id: string; name: string; role: string }[];
  rules: { id: string; title: string; description: string }[];
  structureTemplate: "quick" | "three_act" | "custom" | "ux_journey";
  firstSceneTitle: string;
}

export default function StoryPage() {
  const router = useRouter();
  const [view, setView] = useState<"story" | "canon" | "agents">("story");
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [acts, setActs] = useState<Act[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [rules, setRules] = useState<WorldRule[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [suggestions, setSuggestions] = useState<AgentOutput[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboardingChecklist, setShowOnboardingChecklist] = useState(false);
  const [hasRunAgents, setHasRunAgents] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Load project data for a specific project
  const loadProjectData = useCallback(async (proj: Project) => {
    const [actsData, charsData, locsData, rulesData] = await Promise.all([
      api.acts.list(proj.id),
      api.characters.list(proj.id),
      api.locations.list(proj.id),
      api.rules.list(proj.id),
    ]);

    // Ensure all arrays are defined (defensive)
    setActs(actsData || []);
    setCharacters(charsData || []);
    setLocations(locsData || []);
    setRules(rulesData || []);
    setSelectedScene(null);
    setSuggestions([]);

    // Show onboarding checklist for new projects
    const safeActsData = actsData || [];
    const safeCharsData = charsData || [];
    const safeRulesData = rulesData || [];
    const hasScenes = safeActsData.some(act =>
      act.sequences?.some(seq => seq.scenes && seq.scenes.length > 0)
    );
    if (safeCharsData.length <= 1 || safeRulesData.length <= 1 || !hasScenes) {
      setShowOnboardingChecklist(true);
    } else {
      setShowOnboardingChecklist(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Try to get session
        const session = await api.auth.getSession();
        setUser(session.user);

        // Get projects
        const projectsList = await api.projects.list();
        setProjects(projectsList || []);

        if (projectsList && projectsList.length > 0) {
          // Check localStorage for last selected project
          const lastProjectId = localStorage.getItem(LAST_PROJECT_KEY);
          const lastProject = lastProjectId
            ? projectsList.find(p => p.id === lastProjectId)
            : null;

          // Use last project or default to first
          const proj = lastProject || projectsList[0];
          setProject(proj);

          // Load project data
          await loadProjectData(proj);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        // Redirect to login on auth failure
        router.replace("/login");
        return;
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router, loadProjectData]);

  // Handle scene selection - fetch full scene data
  const handleSelectScene = useCallback(async (scene: Scene | null) => {
    if (!scene) {
      setSelectedScene(null);
      return;
    }

    // If scene already has full data (purpose/summary), use it directly
    // Otherwise fetch full scene details from API
    if (scene.summary !== undefined || scene.purpose !== undefined) {
      setSelectedScene(scene);
    } else {
      try {
        const fullScene = await api.scenes.get(scene.id);
        setSelectedScene(fullScene);
      } catch (err) {
        console.error("Failed to load scene details:", err);
        // Fallback to partial scene data
        setSelectedScene(scene);
      }
    }
  }, []);

  // Load suggestions when scene changes
  useEffect(() => {
    if (!selectedScene) return;

    async function loadSuggestions() {
      try {
        const data = await api.scenes.getSuggestions(selectedScene!.id);
        setSuggestions(data);
        if (data.length > 0) {
          setHasRunAgents(true);
        }
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      }
    }

    loadSuggestions();
  }, [selectedScene?.id]);

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
        setHasRunAgents(true);
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

  // Create scene
  const handleCreateScene = useCallback(
    async (sequenceId: string, title: string) => {
      try {
        // Get current scenes count in sequence to determine index
        let sceneIndex = 0;
        for (const act of acts) {
          for (const seq of act.sequences || []) {
            if (seq.id === sequenceId) {
              sceneIndex = (seq.scenes?.length || 0) + 1;
              break;
            }
          }
        }

        const newScene = await api.scenes.create(sequenceId, {
          index: sceneIndex,
          title,
        });

        // Update acts state to include the new scene
        setActs((prev) =>
          prev.map((act) => ({
            ...act,
            sequences: act.sequences?.map((seq) =>
              seq.id === sequenceId
                ? { ...seq, scenes: [...(seq.scenes || []), newScene] }
                : seq
            ),
          }))
        );

        // Auto-select the new scene (it already has full data from create response)
        setSelectedScene(newScene);
      } catch (err) {
        console.error("Failed to create scene:", err);
        throw err;
      }
    },
    [acts]
  );

  // Update scene
  const handleUpdateScene = useCallback(
    async (sceneId: string, data: UpdateSceneDto) => {
      try {
        const updated = await api.scenes.update(sceneId, data);

        // Update acts state with the updated scene
        setActs((prev) =>
          prev.map((act) => ({
            ...act,
            sequences: act.sequences?.map((seq) => ({
              ...seq,
              scenes: seq.scenes?.map((scene) =>
                scene.id === sceneId ? { ...scene, ...updated } : scene
              ),
            })),
          }))
        );

        // Update selected scene if it's the one being updated
        if (selectedScene?.id === sceneId) {
          setSelectedScene((prev) => (prev ? { ...prev, ...updated } : prev));
        }
      } catch (err) {
        console.error("Failed to update scene:", err);
        throw err;
      }
    },
    [selectedScene?.id]
  );

  // Delete scene
  const handleDeleteScene = useCallback(
    async (sceneId: string) => {
      try {
        await api.scenes.delete(sceneId);

        // Update acts state to remove the deleted scene
        setActs((prev) =>
          prev.map((act) => ({
            ...act,
            sequences: act.sequences?.map((seq) => ({
              ...seq,
              scenes: seq.scenes?.filter((scene) => scene.id !== sceneId),
            })),
          }))
        );

        // Clear selection if deleted scene was selected
        if (selectedScene?.id === sceneId) {
          setSelectedScene(null);
        }
      } catch (err) {
        console.error("Failed to delete scene:", err);
        throw err;
      }
    },
    [selectedScene?.id]
  );

  // Create act
  const handleCreateAct = useCallback(
    async (title: string) => {
      if (!project) return;
      try {
        const newAct = await api.acts.create(project.id, {
          title,
          index: acts.length,
        });
        setActs((prev) => [...prev, { ...newAct, sequences: [] }]);
      } catch (err) {
        console.error("Failed to create act:", err);
        throw err;
      }
    },
    [project, acts.length]
  );

  // Delete act
  const handleDeleteAct = useCallback(
    async (actId: string) => {
      try {
        await api.acts.delete(actId);
        setActs((prev) => prev.filter((a) => a.id !== actId));

        // Clear selection if deleted act contained the selected scene
        if (selectedScene) {
          const deletedAct = acts.find((a) => a.id === actId);
          const sceneInDeletedAct = deletedAct?.sequences?.some((seq) =>
            seq.scenes?.some((s) => s.id === selectedScene.id)
          );
          if (sceneInDeletedAct) {
            setSelectedScene(null);
          }
        }
      } catch (err) {
        console.error("Failed to delete act:", err);
        throw err;
      }
    },
    [acts, selectedScene]
  );

  // Create sequence
  const handleCreateSequence = useCallback(
    async (actId: string, title: string) => {
      try {
        const act = acts.find((a) => a.id === actId);
        const newSeq = await api.sequences.create(actId, {
          title,
          index: act?.sequences?.length || 0,
        });
        setActs((prev) =>
          prev.map((a) =>
            a.id === actId
              ? {
                  ...a,
                  sequences: [
                    ...(a.sequences || []),
                    { ...newSeq, scenes: [] },
                  ],
                }
              : a
          )
        );
      } catch (err) {
        console.error("Failed to create sequence:", err);
        throw err;
      }
    },
    [acts]
  );

  // Delete sequence
  const handleDeleteSequence = useCallback(
    async (sequenceId: string) => {
      try {
        await api.sequences.delete(sequenceId);
        setActs((prev) =>
          prev.map((a) => ({
            ...a,
            sequences: (a.sequences || []).filter((s) => s.id !== sequenceId),
          }))
        );

        // Clear selection if deleted sequence contained the selected scene
        if (selectedScene) {
          const sequenceHasScene = acts.some((a) =>
            a.sequences?.some(
              (seq) =>
                seq.id === sequenceId &&
                seq.scenes?.some((s) => s.id === selectedScene.id)
            )
          );
          if (sequenceHasScene) {
            setSelectedScene(null);
          }
        }
      } catch (err) {
        console.error("Failed to delete sequence:", err);
        throw err;
      }
    },
    [acts, selectedScene]
  );

  // Update act title
  const handleUpdateAct = useCallback(
    async (actId: string, title: string) => {
      try {
        await api.acts.update(actId, { title });
        setActs((prev) =>
          prev.map((a) => (a.id === actId ? { ...a, title } : a))
        );
      } catch (err) {
        console.error("Failed to update act:", err);
        throw err;
      }
    },
    []
  );

  // Update sequence title
  const handleUpdateSequence = useCallback(
    async (sequenceId: string, title: string) => {
      try {
        await api.sequences.update(sequenceId, { title });
        setActs((prev) =>
          prev.map((a) => ({
            ...a,
            sequences: a.sequences?.map((seq) =>
              seq.id === sequenceId ? { ...seq, title } : seq
            ),
          }))
        );
      } catch (err) {
        console.error("Failed to update sequence:", err);
        throw err;
      }
    },
    []
  );

  // Switch to a different project
  const handleSwitchProject = useCallback(
    async (proj: Project) => {
      if (proj.id === project?.id) return;

      setProject(proj);
      localStorage.setItem(LAST_PROJECT_KEY, proj.id);
      await loadProjectData(proj);
    },
    [project?.id, loadProjectData]
  );

  // Open new project modal
  const handleOpenNewProjectModal = useCallback(() => {
    setShowNewProjectModal(true);
  }, []);

  // Create project from wizard (also used by modal)
  const handleCreateProject = async (data: WizardData) => {
    try {
      // 1. Create project
      const newProject = await api.projects.create({
        name: data.projectName,
        description: data.logline || undefined,
      });

      // 2. Create characters
      const createdCharacters: Character[] = [];
      for (const char of data.characters) {
        if (char.name.trim()) {
          const created = await api.characters.create(newProject.id, {
            name: char.name,
            archetype: char.role,
          });
          createdCharacters.push(created);
        }
      }

      // 3. Create rules
      const createdRules: WorldRule[] = [];
      for (const rule of data.rules) {
        if (rule.title.trim()) {
          const created = await api.rules.create(newProject.id, {
            title: rule.title,
            description: rule.description || rule.title,
          });
          createdRules.push(created);
        }
      }

      // 4. Create structure based on template
      let createdActs: Act[] = [];

      if (data.structureTemplate !== "custom") {
        if (data.structureTemplate === "quick") {
          // Quick start: 1 act, 1 sequence, 1 scene
          const act = await api.acts.create(newProject.id, {
            index: 1,
            title: "Act I",
          });
          const seq = await api.sequences.create(act.id, {
            index: 1,
            title: "Opening",
          });
          await api.scenes.create(seq.id, {
            index: 1,
            title: data.firstSceneTitle || "Opening Scene",
          });

          // Reload acts with nested data
          createdActs = await api.acts.list(newProject.id);
        } else if (data.structureTemplate === "three_act") {
          // Three-act structure
          const actTitles = ["Act I - Setup", "Act II - Confrontation", "Act III - Resolution"];
          const seqTemplates = [
            ["Opening", "Inciting Incident"],
            ["Rising Action", "Midpoint", "Complications"],
            ["Crisis", "Climax", "Resolution"],
          ];

          for (let i = 0; i < 3; i++) {
            const act = await api.acts.create(newProject.id, {
              index: i + 1,
              title: actTitles[i],
            });

            for (let j = 0; j < seqTemplates[i].length; j++) {
              const seq = await api.sequences.create(act.id, {
                index: j + 1,
                title: seqTemplates[i][j],
              });

              // Create first scene only in first sequence
              if (i === 0 && j === 0) {
                await api.scenes.create(seq.id, {
                  index: 1,
                  title: data.firstSceneTitle || "Opening Scene",
                });
              }
            }
          }

          createdActs = await api.acts.list(newProject.id);
        } else if (data.structureTemplate === "ux_journey") {
          // UX Journey structure: Onboarding, Core Usage, Retention & Recovery
          const phaseTitles = ["Onboarding", "Core Usage", "Retention & Recovery"];
          const flowTemplates = [
            ["Sign Up & Activation", "First Meaningful Action"],
            ["Main Workflow", "Settings & Preferences"],
            ["Upgrade & Billing", "Churn Prevention"],
          ];

          for (let i = 0; i < 3; i++) {
            const act = await api.acts.create(newProject.id, {
              index: i + 1,
              title: phaseTitles[i],
            });

            for (let j = 0; j < flowTemplates[i].length; j++) {
              const seq = await api.sequences.create(act.id, {
                index: j + 1,
                title: flowTemplates[i][j],
              });

              // Create first screen only in first flow
              if (i === 0 && j === 0) {
                await api.scenes.create(seq.id, {
                  index: 1,
                  title: data.firstSceneTitle || "Landing Page",
                });
              }
            }
          }

          createdActs = await api.acts.list(newProject.id);
        }
      }

      // Update state (ensure arrays are defined)
      const safeCreatedActs = createdActs || [];
      setProjects(prev => [newProject, ...prev]);
      setProject(newProject);
      setCharacters(createdCharacters);
      setRules(createdRules);
      setActs(safeCreatedActs);
      setLocations([]);
      setShowOnboardingChecklist(true);
      localStorage.setItem(LAST_PROJECT_KEY, newProject.id);

      // Select the first scene if available (will fetch full data)
      if (safeCreatedActs.length > 0) {
        const firstAct = safeCreatedActs[0];
        if (firstAct.sequences && firstAct.sequences.length > 0) {
          const firstSeq = firstAct.sequences[0];
          if (firstSeq.scenes && firstSeq.scenes.length > 0) {
            handleSelectScene(firstSeq.scenes[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      throw err;
    }
  };

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

  // Check if there are any scenes
  const hasScenes = acts.some(act =>
    act.sequences?.some(seq => seq.scenes && seq.scenes.length > 0)
  );

  // Onboarding checklist items
  const checklistItems = [
    {
      id: "character",
      label: "Add at least 1 character",
      completed: characters.length > 0,
      action: () => setView("canon"),
    },
    {
      id: "rule",
      label: "Add at least 1 world rule",
      completed: rules.length > 0,
      action: () => setView("canon"),
    },
    {
      id: "scene",
      label: "Create at least 1 scene",
      completed: hasScenes,
      action: () => setView("story"),
    },
    {
      id: "agents",
      label: "Run agents on a scene",
      completed: hasRunAgents,
      action: selectedScene ? () => handleRunAgents() : undefined,
    },
  ];

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

  // No projects - show welcome/onboarding
  if (!project) {
    return (
      <WelcomeScreen
        userName={user?.name}
        onCreateProject={handleCreateProject}
      />
    );
  }

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <TopBar
        project={project}
        projects={projects}
        user={user}
        onSelectProject={handleSwitchProject}
        onCreateProject={handleOpenNewProjectModal}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Sidebar */}
      <Sidebar activeView={view} onViewChange={setView} />

      {/* Main Content */}
      <main className="app-main">
        {view === "canon" ? (
          /* Canon View - Full Width */
          <CanonView
            project={project}
            characters={characters}
            rules={rules}
            onCharactersChange={setCharacters}
            onRulesChange={setRules}
          />
        ) : (
          /* Story View - Three Panes */
          <>
            {/* Pane A: Structure Tree */}
            <div className="pane pane-a relative">
              <SceneTree
                acts={acts}
                selectedSceneId={selectedScene?.id || null}
                onSelectScene={handleSelectScene}
                suggestionCounts={suggestionCounts}
                onCreateScene={handleCreateScene}
                onDeleteScene={handleDeleteScene}
                onCreateAct={handleCreateAct}
                onDeleteAct={handleDeleteAct}
                onUpdateAct={handleUpdateAct}
                onCreateSequence={handleCreateSequence}
                onDeleteSequence={handleDeleteSequence}
                onUpdateSequence={handleUpdateSequence}
              />

              {/* Onboarding checklist */}
              {showOnboardingChecklist && (
                <div className="absolute bottom-4 left-4 right-4">
                  <OnboardingChecklist
                    items={checklistItems}
                    onDismiss={() => setShowOnboardingChecklist(false)}
                  />
                </div>
              )}
            </div>

            {/* Pane B: Scene Detail */}
            <SceneDetail
              scene={selectedScene}
              sequenceTitle={sequenceTitle}
              actTitle={actTitle}
              characters={characters}
              location={selectedLocation}
              onUpdateScene={handleUpdateScene}
            />

            {/* Pane C: Agent Panel */}
            <AgentPanel
              sceneId={selectedScene?.id || null}
              suggestions={sceneSuggestions}
              isLoading={isLoadingAgents}
              onRunAgents={handleRunAgents}
              onResolve={handleResolve}
            />
          </>
        )}
      </main>
    </div>
  );
}
