"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
  isScrolled?: boolean;
}

export function Navigation({ className, isScrolled = false }: NavigationProps) {
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
              "text-[11px] lg:text-xs font-sans tracking-widest uppercase transition-all duration-200 py-1 relative select-none",
              isScrolled
                ? isActive
                  ? "text-ink font-semibold"
                  : "text-ink-muted hover:text-ink font-normal"
                : isActive
                ? "text-white font-semibold"
                : "text-cream/80 hover:text-white font-light"
            )}
          >
            {item.label}
            {isActive && (
              <span
                className={cn(
                  "absolute -bottom-1 left-0 right-0 h-0.5 rounded-full",
                  isScrolled ? "bg-ink" : "bg-cream"
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
