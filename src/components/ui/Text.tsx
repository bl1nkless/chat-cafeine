import React from "react";
import { cn } from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  variant?: "body" | "lead" | "story" | "small" | "muted";
  as?: "p" | "span" | "div";
  className?: string;
}

const variantClasses: Record<string, string> = {
  body: "text-base text-ink-muted leading-relaxed font-sans",
  lead: "text-lg sm:text-xl text-ink leading-relaxed font-sans",
  story: "font-serif italic text-base sm:text-lg text-ink-muted leading-relaxed",
  small: "text-xs sm:text-sm text-ink-muted leading-normal font-sans",
  muted: "text-sm text-ink-muted/80 font-sans",
};

export function Text({
  children,
  variant = "body",
  as: Component = "p",
  className,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
