"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

interface Props {
  children: ReactNode;
  className?: string;
  /** Seconds to wait after entering the viewport (use for simple staggers). */
  delay?: number;
  as?: "div" | "li" | "p";
}

/**
 * Generic fade-up on first scroll into view (Framer Motion).
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user">.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  );
}
