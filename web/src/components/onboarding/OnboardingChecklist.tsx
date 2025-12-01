"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  action?: () => void;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onDismiss?: () => void;
}

export function OnboardingChecklist({ items, onDismiss }: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const allCompleted = completedCount === totalCount;

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              {/* Background ring */}
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="3"
              />
              {/* Progress ring */}
              <motion.circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke={allCompleted ? "var(--status-success)" : "var(--accent-primary)"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={88}
                initial={{ strokeDashoffset: 88 }}
                animate={{
                  strokeDashoffset: 88 - (88 * completedCount) / totalCount,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            {/* Checkmark when complete */}
            {allCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-status-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>

          <div className="text-left">
            <h3 className="text-caption font-semibold text-text-primary">
              {allCompleted ? "Project ready" : "Project setup"}
            </h3>
            <p className="text-micro text-text-muted">
              {allCompleted
                ? "Agents are online"
                : `${completedCount} of ${totalCount} complete`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="text-caption text-text-subtle hover:text-text-primary transition-colors"
            >
              Dismiss
            </button>
          )}
          <motion.svg
            className="w-5 h-5 text-text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      {/* Checklist items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={item.action}
                  disabled={item.completed || !item.action}
                  className={`
                    w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all
                    ${item.completed
                      ? "text-text-subtle"
                      : item.action
                      ? "text-text-primary hover:bg-bg-hover cursor-pointer"
                      : "text-text-muted cursor-default"
                    }
                  `}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Checkbox */}
                  <div
                    className={`
                      w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                      border transition-all
                      ${item.completed
                        ? "bg-status-success border-status-success"
                        : "border-border-strong"
                      }
                    `}
                  >
                    {item.completed && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-body flex-1
                      ${item.completed ? "line-through" : ""}
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Action arrow */}
                  {!item.completed && item.action && (
                    <svg
                      className="w-4 h-4 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
