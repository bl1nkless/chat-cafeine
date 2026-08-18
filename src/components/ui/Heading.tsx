import React from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: HeadingLevel;
  size?: "h1" | "h2" | "h3" | "h4" | "display";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  display: "font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight text-ink leading-[1.15] break-words",
  h1: "font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-ink leading-tight break-words",
  h2: "font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight text-ink leading-tight break-words",
  h3: "font-serif text-lg sm:text-xl md:text-2xl font-normal text-ink",
  h4: "font-serif text-base sm:text-lg font-normal text-ink",
};

export function Heading({
  children,
  as: Component = "h2",
  size,
  className,
  ...props
}: HeadingProps) {
  const chosenSize = size || Component;

  return (
    <Component
      className={cn(sizeClasses[chosenSize], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
