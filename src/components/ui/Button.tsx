import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
export type ButtonSize = "sm" | "default" | "lg";

export interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-cream hover:bg-black/90 active:bg-black shadow-xs transition-colors duration-200",
  secondary:
    "bg-warm text-ink hover:bg-warm-dark active:bg-sand transition-colors duration-200",
  outline:
    "border border-ink/20 text-ink bg-transparent hover:border-ink/50 hover:bg-warm/30 active:bg-warm/50 transition-colors duration-200",
  ghost:
    "text-ink hover:bg-warm/40 active:bg-warm/60 transition-colors duration-200",
  whatsapp:
    "bg-ink text-cream hover:bg-black active:bg-black/90 border border-ink shadow-xs transition-colors duration-200 font-medium",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-full gap-1.5",
  default: "px-5 py-2.5 text-sm rounded-full gap-2",
  lg: "px-7 py-3.5 text-base rounded-full gap-2.5",
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  className,
  fullWidth = false,
  href,
  target,
  rel,
  type = "button",
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const combinedClassName = cn(
    "inline-flex items-center justify-center font-sans tracking-wide transition-all cursor-pointer select-none text-center",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  if (href) {
    const isExternal =
      href.startsWith("http") || href.startsWith("https") || href.startsWith("wa.me");

    return (
      <Link
        href={href}
        className={combinedClassName}
        target={target || (isExternal ? "_blank" : undefined)}
        rel={rel || (isExternal ? "noopener noreferrer" : undefined)}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClassName}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...props}
    >
      {children}
    </button>
  );
}
