"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered instead of the children when the subtree throws. */
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  failed: boolean;
}

/**
 * Isolates the 3D subtree.
 *
 * WebGL can fail for reasons the application cannot control — a lost context,
 * a blocklisted driver, a browser with WebGL disabled. When that happens the
 * canvas is dropped and the static content takes over, rather than the whole
 * page going blank.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error);
    if (process.env.NODE_ENV === "development") {
      console.error("3D experience failed:", error, info.componentStack);
    }
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
