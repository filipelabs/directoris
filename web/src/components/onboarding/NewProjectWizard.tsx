"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectTypeCard } from "./ProjectTypeCard";
import { WizardStepIndicator } from "./WizardStepIndicator";

type ProjectType = "story" | "content" | "ux";

interface CharacterInput {
  id: string;
  name: string;
  role: string;
}

interface RuleInput {
  id: string;
  title: string;
  description: string;
}

interface WizardData {
  projectType: ProjectType | null;
  projectName: string;
  logline: string;
  characters: CharacterInput[];
  rules: RuleInput[];
  structureTemplate: "quick" | "three_act" | "custom" | "ux_journey";
  firstSceneTitle: string;
}

interface NewProjectWizardProps {
  onComplete: (data: WizardData) => void;
  onCancel?: () => void;
}

const STEPS = ["Type", "Details", "Canon", "Structure"];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function NewProjectWizard({ onComplete, onCancel }: NewProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState<WizardData>({
    projectType: null,
    projectName: "",
    logline: "",
    characters: [{ id: "1", name: "", role: "Protagonist" }],
    rules: [{ id: "1", title: "", description: "" }],
    structureTemplate: "quick",
    firstSceneTitle: "",
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.projectType !== null;
      case 1:
        return data.projectName.trim().length > 0;
      case 2:
        return true; // Canon is optional
      case 3:
        return true; // Structure has defaults
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    await onComplete(data);
    setIsSubmitting(false);
  };

  const addCharacter = () => {
    setData((d) => ({
      ...d,
      characters: [
        ...d.characters,
        { id: String(Date.now()), name: "", role: "Supporting" },
      ],
    }));
  };

  const removeCharacter = (id: string) => {
    if (data.characters.length > 1) {
      setData((d) => ({
        ...d,
        characters: d.characters.filter((c) => c.id !== id),
      }));
    }
  };

  const updateCharacter = (id: string, field: keyof CharacterInput, value: string) => {
    setData((d) => ({
      ...d,
      characters: d.characters.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const addRule = () => {
    setData((d) => ({
      ...d,
      rules: [...d.rules, { id: String(Date.now()), title: "", description: "" }],
    }));
  };

  const removeRule = (id: string) => {
    if (data.rules.length > 1) {
      setData((d) => ({
        ...d,
        rules: d.rules.filter((r) => r.id !== id),
      }));
    }
  };

  const updateRule = (id: string, field: keyof RuleInput, value: string) => {
    setData((d) => ({
      ...d,
      rules: d.rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  const roleOptions = data.projectType === "content"
    ? ["Myself", "My Audience", "My Product", "Competitor", "Other"]
    : data.projectType === "ux"
    ? ["New User", "Power User", "Admin", "Billing User", "Guest", "Other"]
    : ["Protagonist", "Antagonist", "Supporting", "Mentor", "Love Interest", "Other"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="mb-12">
        <WizardStepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 0: Project Type */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-display text-text-primary mb-2">
                  What are you directing?
                </h2>
                <p className="text-body text-text-muted">
                  Choose the type of project you want to create
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProjectTypeCard
                  type="story"
                  title="Story Project"
                  subtitle="Acts, scenes, characters"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                    </svg>
                  }
                  examples={["TV Shows", "Films", "Games"]}
                  selected={data.projectType === "story"}
                  onSelect={() => setData((d) => ({ ...d, projectType: "story" }))}
                />

                <ProjectTypeCard
                  type="content"
                  title="Content Project"
                  subtitle="Series, posts, arcs"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  }
                  examples={["LinkedIn", "YouTube", "Blog"]}
                  selected={data.projectType === "content"}
                  onSelect={() => setData((d) => ({ ...d, projectType: "content" }))}
                />

                <ProjectTypeCard
                  type="ux"
                  title="UX Project"
                  subtitle="Journeys, flows, personas"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  }
                  examples={["Apps", "SaaS", "Websites"]}
                  selected={data.projectType === "ux"}
                  onSelect={() => setData((d) => ({ ...d, projectType: "ux" }))}
                />
              </div>
            </motion.div>
          )}

          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-display text-text-primary mb-2">
                  Name your {data.projectType === "content" ? "content project" : data.projectType === "ux" ? "UX project" : "story"}
                </h2>
                <p className="text-body text-text-muted">
                  Give it a working title - you can always change it later
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-caption text-text-muted mb-2 uppercase tracking-wider">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={data.projectName}
                    onChange={(e) => setData((d) => ({ ...d, projectName: e.target.value }))}
                    placeholder={
                      data.projectType === "content"
                        ? "Build in public - directoris"
                        : data.projectType === "ux"
                        ? "SaaS Dashboard v2"
                        : "The Tethered City"
                    }
                    className="input text-lg py-3"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-caption text-text-muted mb-2 uppercase tracking-wider">
                    {data.projectType === "content" ? "Tagline" : data.projectType === "ux" ? "Product Description" : "Logline"}
                    <span className="text-text-subtle ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={data.logline}
                    onChange={(e) => setData((d) => ({ ...d, logline: e.target.value }))}
                    placeholder={
                      data.projectType === "content"
                        ? "A founder building an AI story OS in public."
                        : data.projectType === "ux"
                        ? "Analytics dashboard for small business owners."
                        : "A city held above a void by forgotten magic."
                    }
                    className="input min-h-[80px] resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Canon */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-display text-text-primary mb-2">
                  {data.projectType === "ux" ? "Define your context" : "Define your canon"}
                </h2>
                <p className="text-body text-text-muted">
                  {data.projectType === "ux"
                    ? "Add personas and UX principles - agents use these for consistency checks"
                    : "Add characters and rules - agents use these for continuity checks"}
                </p>
              </div>

              {/* Characters / Personas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-caption text-text-muted uppercase tracking-wider">
                    {data.projectType === "content" ? "Key Figures" : data.projectType === "ux" ? "Personas" : "Characters"}
                  </label>
                  <button
                    onClick={addCharacter}
                    className="text-caption text-accent-primary hover:text-accent-primary-hover transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {data.characters.map((char, index) => (
                    <motion.div
                      key={char.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid gap-3 items-start"
                      style={{ gridTemplateColumns: "1fr 140px 40px" }}
                    >
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => updateCharacter(char.id, "name", e.target.value)}
                        placeholder={data.projectType === "ux" ? `Persona ${index + 1} name` : `Character ${index + 1} name`}
                        className="input w-full"
                      />
                      <select
                        value={char.role}
                        onChange={(e) => updateCharacter(char.id, "role", e.target.value)}
                        className="input w-full"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeCharacter(char.id)}
                        disabled={data.characters.length === 1}
                        className="p-2 text-text-subtle hover:text-status-error disabled:opacity-30 disabled:cursor-not-allowed transition-colors justify-self-center"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-caption text-text-muted uppercase tracking-wider">
                    {data.projectType === "content" ? "Content Rules" : data.projectType === "ux" ? "UX Principles" : "World Rules"}
                  </label>
                  <button
                    onClick={addRule}
                    className="text-caption text-accent-primary hover:text-accent-primary-hover transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {data.rules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <input
                        type="text"
                        value={rule.title}
                        onChange={(e) => updateRule(rule.id, "title", e.target.value)}
                        placeholder={
                          data.projectType === "content"
                            ? `Rule ${index + 1}: e.g., "Always include a call to action"`
                            : data.projectType === "ux"
                            ? `Principle ${index + 1}: e.g., "Never block flows behind signup"`
                            : `Rule ${index + 1}: e.g., "Magic costs memory"`
                        }
                        className="input flex-1"
                      />
                      <button
                        onClick={() => removeRule(rule.id)}
                        disabled={data.rules.length === 1}
                        className="p-2 text-text-subtle hover:text-status-error disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className="text-caption text-text-subtle text-center">
                You can skip this and add more later in the Canon view
              </p>
            </motion.div>
          )}

          {/* Step 3: Structure */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-display text-text-primary mb-2">
                  Choose your starting structure
                </h2>
                <p className="text-body text-text-muted">
                  We'll create an initial skeleton - you can modify it freely
                </p>
              </div>

              <div className="grid gap-4">
                {(data.projectType === "ux" ? [
                  {
                    value: "quick" as const,
                    title: "Quick Start",
                    description: "1 phase, 1 flow, 1 screen - minimal setup to get mapping",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                  },
                  {
                    value: "ux_journey" as const,
                    title: "User Journey",
                    description: "Onboarding, Core Usage, Retention & Recovery phases",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    ),
                  },
                  {
                    value: "custom" as const,
                    title: "Empty Canvas",
                    description: "Start from scratch - add flows as you go",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    ),
                  },
                ] : [
                  {
                    value: "quick" as const,
                    title: "Quick Start",
                    description: "1 act, 1 sequence, 1 scene - minimal setup to get writing",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                  },
                  {
                    value: "three_act" as const,
                    title: "Three-Act Structure",
                    description: "Classic setup with Act I, II, III and template sequences",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    ),
                  },
                  {
                    value: "custom" as const,
                    title: "Empty Canvas",
                    description: "Start from scratch - add structure as you go",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    ),
                  },
                ]).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData((d) => ({ ...d, structureTemplate: option.value }))}
                    className={`
                      flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all
                      ${
                        data.structureTemplate === option.value
                          ? "bg-accent-primary-soft border-accent-primary"
                          : "bg-bg-surface border-border-subtle hover:border-border-strong"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${
                          data.structureTemplate === option.value
                            ? "bg-accent-primary/20 text-accent-primary"
                            : "bg-bg-elevated text-text-muted"
                        }
                      `}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="text-subtitle text-text-primary mb-1">{option.title}</h3>
                      <p className="text-body text-text-muted">{option.description}</p>
                    </div>
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex-shrink-0 ml-auto flex items-center justify-center
                        ${
                          data.structureTemplate === option.value
                            ? "bg-accent-primary border-accent-primary"
                            : "border-border-strong"
                        }
                      `}
                    >
                      {data.structureTemplate === option.value && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {data.structureTemplate !== "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-4"
                >
                  <label className="block text-caption text-text-muted mb-2 uppercase tracking-wider">
                    First {data.projectType === "content" ? "Post" : data.projectType === "ux" ? "Screen" : "Scene"} Title
                    <span className="text-text-subtle ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={data.firstSceneTitle}
                    onChange={(e) => setData((d) => ({ ...d, firstSceneTitle: e.target.value }))}
                    placeholder={data.projectType === "content" ? "Introduction post" : data.projectType === "ux" ? "Landing page" : "Opening scene"}
                    className="input"
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-12 pt-6 border-t border-border-subtle">
        <button
          onClick={currentStep === 0 ? onCancel : prevStep}
          className="btn btn-secondary"
        >
          {currentStep === 0 ? "Cancel" : "Back"}
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Project
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
