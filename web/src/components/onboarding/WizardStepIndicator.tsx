"use client";

import { motion } from "framer-motion";

interface WizardStepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function WizardStepIndicator({ steps, currentStep }: WizardStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          {/* Step dot */}
          <motion.div
            className={`
              relative flex items-center justify-center
              ${index <= currentStep ? "text-accent-primary" : "text-text-subtle"}
            `}
            initial={false}
          >
            {/* Background ring */}
            <motion.div
              className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center
                text-micro font-semibold
                ${
                  index < currentStep
                    ? "bg-accent-primary border-accent-primary text-white"
                    : index === currentStep
                    ? "bg-accent-primary-soft border-accent-primary text-accent-primary"
                    : "bg-bg-elevated border-border-subtle text-text-subtle"
                }
              `}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Step label */}
            <span
              className={`
                absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                text-micro font-medium
                ${index === currentStep ? "text-text-primary" : "text-text-subtle"}
              `}
            >
              {step}
            </span>
          </motion.div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="w-12 h-0.5 mx-2 bg-border-subtle overflow-hidden">
              <motion.div
                className="h-full bg-accent-primary"
                initial={{ width: "0%" }}
                animate={{ width: index < currentStep ? "100%" : "0%" }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
