/**
 * One easing language for the whole site, so GSAP timelines and Framer Motion feel identical.
 * "expo-out" style: fast start, long silky settle.
 */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** GSAP equivalent of the in-out curve above (CSS uses --ease-out-expo / --ease-in-out-soft). */
export const GSAP_EASE_IN_OUT = "power3.inOut";

/**
 * Intro handshake: when the preloader curtain is gone, Preloader sets `data-intro="done"` on
 * <html> and dispatches this event (smooth scrolling resumes on it). The hero's own entrance
 * is timed in CSS, so it never waits for JavaScript.
 */
export const INTRO_DONE_EVENT = "site:intro-done";
export const INTRO_SESSION_KEY = "site:intro-seen";
