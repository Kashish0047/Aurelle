"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useHasFinePointer } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface Props {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees */
  max?: number;
}

/**
 * Subtle 3D tilt toward the pointer, with springy return. Desktop only; inert on touch
 * and with reduced motion.
 */
export function TiltCard({ children, className, max = 6 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();
  const active = finePointer && !reducedMotion;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 150, damping: 18, mass: 0.5 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        className={className}
        style={active ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        onPointerMove={active ? onMove : undefined}
        onPointerLeave={active ? reset : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
}
