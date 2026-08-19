"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
  isOverlay?: boolean;
}

export function Navigation({ className, isOverlay = false }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("hidden md:flex items-center gap-5 lg:gap-8", className)}>
      {siteConfig.navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-[11px] lg:text-xs font-sans font-medium tracking-widest uppercase py-1 relative select-none transition-colors duration-200",
              isOverlay
                ? isActive
                  ? "text-white"
                  : "text-cream/80 hover:text-white"
                : isActive
                ? "text-ink"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {item.label}
            {isActive && (
              <span
                className={cn(
                  "absolute -bottom-1 left-0 right-0 h-0.5 rounded-full transition-colors duration-200",
                  isOverlay ? "bg-white" : "bg-ink"
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
