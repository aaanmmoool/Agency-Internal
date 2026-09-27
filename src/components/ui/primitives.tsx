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
