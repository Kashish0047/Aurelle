"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { contentConfig } from "@/config/content.config";
import { useSiteContent } from "@/lib/content/context";
import { INTRO_DONE_EVENT, INTRO_SESSION_KEY } from "@/lib/motion";

/** Lift the curtain now and let the hero start revealing immediately. */
function skipIntro(curtain: HTMLElement | null) {
  curtain?.classList.add("is-skipping");
  document.documentElement.classList.add("intro-skipped");
}

/**
 * Intro curtain (~1.5s), shown once per browser session.
 *
 * The animation itself is pure CSS (see "Intro" in globals.css): it is server-rendered and
 * starts on the very first paint, so it never waits for JavaScript — and if JS fails entirely,
 * the curtain still lifts. An inline <head> script (layout.tsx) hides it before paint when it was
 * already seen this session or the visitor prefers reduced motion.
 *
 * This component only adds behaviour: skip (button, click, Escape), a scroll lock while the
 * curtain is down, and the "intro done" signal (data-intro + event) once the curtain is gone.
 */
export function Preloader() {
  const { site: siteConfig } = useSiteContent();
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const { ui, preloader } = contentConfig;

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;

    const release = () => {
      html.dataset.intro = "done";
      html.style.overflow = "";
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        /* private mode: the intro simply plays again next visit */
      }
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      setGone(true);
    };

    // Already done (skipped by the head script, or hydrated after the curtain lifted):
    // release on the next microtask so state isn't set synchronously inside the effect.
    const releaseSoon = () => void Promise.resolve().then(release);

    if (!el || html.dataset.intro === "done") {
      releaseSoon();
      return;
    }

    // The curtain's CSS animation may already be over if the page hydrated slowly.
    const curtain = el.getAnimations().find((a) => (a as CSSAnimation).animationName === "pl-curtain");
    if (!curtain || curtain.playState === "finished") {
      releaseSoon();
      return;
    }

    html.style.overflow = "hidden";
    let cancelled = false;
    curtain.finished.then(() => !cancelled && release()).catch(() => !cancelled && release());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipIntro(el);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      html.style.overflow = "";
    };
  }, []);

  const skip = () => skipIntro(root.current);

  if (gone) return null;

  const chars = Array.from(siteConfig.name);

  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[100] flex items-center justify-center bg-ink text-bg"
      onClick={skip}
    >
      <div className="pl-inner flex flex-col items-center gap-5" aria-hidden>
        <p className="flex overflow-hidden pb-[0.1em] font-serif text-[clamp(3.5rem,14vw,9rem)] leading-none tracking-tight">
          {chars.map((char, i) => (
            <span key={i} className="pl-char inline-block" style={{ "--i": i } as CSSProperties}>
              {char === " " ? " " : char}
            </span>
          ))}
        </p>
        <span className="pl-line block h-px w-40 origin-left bg-bg/40" />
        <p className="pl-caption text-[0.7rem] uppercase tracking-[0.3em] text-bg/70">{preloader.caption}</p>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.2em] text-bg/70 transition-colors hover:text-bg"
      >
        {ui.skipIntro}
      </button>
    </div>
  );
}
