"use client";

import { Component, type ReactNode } from "react";

interface State {
  failed: boolean;
}

/**
 * If anything in the 3D scene throws (e.g. an environment HDR fails to download, or the GPU
 * context is lost), render nothing — the gradient placeholder underneath stays visible and the
 * rest of the page keeps working.
 */
export class SceneErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[3d] Scene disabled after an error:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
