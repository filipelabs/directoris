"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InlineAddFormProps {
  placeholder: string;
  onSubmit: (title: string) => Promise<void>;
  onCancel: () => void;
  isVisible: boolean;
  indentLevel?: number;
}

export function InlineAddForm({
  placeholder,
  onSubmit,
  onCancel,
  isVisible,
  indentLevel = 0,
}: InlineAddFormProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue("");
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setValue("");
      onCancel();
    }
  };

  const paddingLeft = 16 + indentLevel * 16;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden"
        >
          <div
            className="flex items-center gap-2 py-1.5 pr-4"
            style={{ paddingLeft }}
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!value.trim()) {
                  onCancel();
                }
              }}
              placeholder={placeholder}
              disabled={isSubmitting}
              className="flex-1 bg-bg-elevated border border-accent-primary rounded px-2 py-1 text-caption text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isSubmitting}
              className="text-micro text-accent-primary hover:text-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "..." : "Add"}
            </button>
            <button
              onClick={() => {
                setValue("");
                onCancel();
              }}
              className="text-micro text-text-subtle hover:text-text-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AddButtonProps {
  label: string;
  onClick: () => void;
  indentLevel?: number;
}

export function AddButton({ label, onClick, indentLevel = 0 }: AddButtonProps) {
  const paddingLeft = 16 + indentLevel * 16;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-1.5 py-1.5 pr-4 text-micro text-text-subtle hover:text-accent-primary transition-colors group"
      style={{ paddingLeft }}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
