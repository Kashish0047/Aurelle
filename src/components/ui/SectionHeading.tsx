"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
}

const fade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } };
const rise: Variants = {
  hidden: { y: "105%" },
  visible: { y: "0%", transition: { duration: 1.1, ease: EASE_OUT } },
};
const lift: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay: 0.2 } },
};

/**
 * Eyebrow + large serif title + optional intro.
 * The title rises out of a mask when the heading first enters the viewport; eyebrow and intro
 * fade with it. The in-view trigger sits on the wrapper (not the masked title), because the
 * hidden title is clipped by its mask and would never register as visible itself.
 */
export function SectionHeading({ id, eyebrow, title, intro, className }: Props) {
  return (
    <motion.div
      className={cn("max-w-2xl", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      <motion.p className="eyebrow" variants={fade}>
        {eyebrow}
      </motion.p>
      <h2 id={id} className="mt-4 text-headline">
        <span className="mask-line">
          <motion.span className="block" variants={rise}>
            {title}
          </motion.span>
        </span>
      </h2>
      {intro && (
        <motion.p className="mt-6 max-w-lg text-lead text-muted" variants={lift}>
          {intro}
        </motion.p>
      )}
    </motion.div>
  );
}
