import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "sand" | "brown" | "dark" | "outline";
  size?: "sm" | "default";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-warm text-ink border border-sand/40",
  sand: "bg-sand/30 text-ink border border-sand/60",
  brown: "bg-brown text-cream",
  dark: "bg-ink text-cream",
  outline: "border border-ink/30 text-ink bg-transparent",
};

const sizeClasses: Record<string, string> = {
  sm: "text-[11px] px-2.5 py-0.5 font-medium tracking-wide",
  default: "text-xs px-3 py-1 font-medium tracking-wider uppercase",
};

export function Badge({
  children,
  variant = "default",
  size = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-sans transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
