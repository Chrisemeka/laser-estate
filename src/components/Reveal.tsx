"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/**
 * Subtle scroll-triggered fade-up. Deliberately quiet — long duration, small
 * distance, smooth deceleration curve. Only fires once when it enters view.
 */
export function Reveal({ children, delay = 0, y = 24, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Page-load fade-up. For above-the-fold content (hero) where whileInView
 * would trigger instantly anyway — this version doesn't wait for scroll.
 */
export function Enter({ children, delay = 0, y = 20, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
