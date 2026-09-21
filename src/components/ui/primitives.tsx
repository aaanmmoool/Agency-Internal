"use client";

import type { ReactNode } from "react";

/** Joins class names, dropping falsy values. */
export const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(" ");

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "ghost" | "quiet";
  type?: "button" | "submit";
  className?: string;
  "aria-label"?: string;
}

/**
 * The only button in the system. Renders an anchor when given `href` so links
 * stay links — keyboard and screen-reader behaviour comes free.
 */
export function Button({
  children,
  onClick,
  href,
  variant = "primary",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.8rem] font-medium tracking-label uppercase transition-colors duration-300 disabled:opacity-40";

  const variants = {
    primary: "bg-ink text-void hover:bg-white",
    ghost: "border border-edge-strong text-ink hover:border-ink-muted hover:bg-raised",
    quiet: "text-ink-muted hover:text-ink",
  } as const;

  const classes = cx(base, variants[variant], className);

  if (href) {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}

/** Small uppercase caption used above every panel heading. */
export function Eyebrow({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <p
      className={cx("text-[0.66rem] font-medium tracking-label uppercase", className)}
      style={color ? { color } : undefined}
    >
      {children}
    </p>
  );
}

/** A labelled block of prose, used throughout the case studies. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Eyebrow className="text-ink-faint">{label}</Eyebrow>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}

/** Technology / skill chip. */
export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="rounded-full border border-edge px-2.5 py-1 text-[0.68rem] tracking-wide text-ink-muted"
      style={color ? { borderColor: `${color}40`, color } : undefined}
    >
      {children}
    </span>
  );
}

/** The shared frosted surface every mission panel sits on. */
export function Panel({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cx(
        "animate-panel-in rounded-2xl border border-edge bg-surface/85 p-6 backdrop-blur-xl sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
