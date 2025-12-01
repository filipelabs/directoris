"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { NewProjectWizard } from "@/components/onboarding";

interface WizardData {
  projectType: "story" | "content" | "ux" | null;
  projectName: string;
  logline: string;
  characters: { id: string; name: string; role: string }[];
  rules: { id: string; title: string; description: string }[];
  structureTemplate: "quick" | "three_act" | "custom" | "ux_journey";
  firstSceneTitle: string;
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: WizardData) => Promise<void>;
}

export function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: NewProjectModalProps) {
  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleComplete = async (data: WizardData) => {
    await onCreateProject(data);
    onClose();
  };

  // Don't render on server
  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="
                relative w-full max-w-3xl max-h-[90vh]
                bg-bg-surface border border-border-subtle rounded-xl
                shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]
                overflow-hidden pointer-events-auto
              "
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="
                  absolute top-4 right-4 z-10
                  w-8 h-8 flex items-center justify-center
                  rounded-lg bg-bg-elevated/50 border border-border-subtle
                  text-text-subtle hover:text-text-primary hover:bg-bg-hover
                  transition-colors
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Wizard Content */}
              <div className="p-8 overflow-y-auto max-h-[90vh]">
                <NewProjectWizard
                  onComplete={handleComplete}
                  onCancel={onClose}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
