"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useHasFinePointer } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface Props {
  children: ReactNode;
  /** 0–1: how far the element follows the pointer from its centre. */
  strength?: number;
  className?: string;
}

/**
 * Magnetic hover: the child drifts toward the pointer while hovered and springs
 * back on leave. Desktop-only; inert on touch devices and with reduced motion.
 */
export function Magnetic({ children, strength = 0.3, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 180, damping: 14, mass: 0.35 };
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);
  const active = finePointer && !reducedMotion;

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className ?? "inline-flex"}
      style={active ? { x: springX, y: springY } : undefined}
      onPointerMove={active ? onMove : undefined}
      onPointerLeave={active ? reset : undefined}
    >
      {children}
    </motion.span>
  );
}
