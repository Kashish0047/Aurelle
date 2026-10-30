"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site.config";
import { gsap } from "@/lib/gsap";

interface Props {
  value: number;
  suffix?: string;
  className?: string;
}

const format = new Intl.NumberFormat(siteConfig.locale);

/**
 * Number that counts up from 0 the first time it scrolls into view.
 * Server HTML contains the final value (SEO, no-JS, reduced motion); the count-up only
 * runs on the client and writes straight to the DOM — no React re-render per frame.
 */
export function CountUp({ value, suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.textContent = "0";
    const counter = { v: 0 };
    let tween: gsap.core.Tween | undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(counter, {
          v: value,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => void (el.textContent = format.format(Math.round(counter.v))),
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = format.format(value);
    };
  }, [value]);

  return (
    <span className={className}>
      <span ref={ref}>{format.format(value)}</span>
      {suffix}
    </span>
  );
}
