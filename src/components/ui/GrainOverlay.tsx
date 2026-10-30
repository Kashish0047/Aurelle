/** Animated film grain across the whole page. Pure CSS (see `.grain` in globals.css). */
export function GrainOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <div className="grain" />
    </div>
  );
}
