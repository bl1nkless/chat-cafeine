import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "default" | "lg";
}

export function Section({
  children,
  className,
  spacing = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        spacing === "sm" && "py-8 sm:py-12",
        spacing === "default" && "py-16 sm:py-24",
        spacing === "lg" && "py-20 sm:py-32",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
