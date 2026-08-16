"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("hidden md:flex items-center gap-6 lg:gap-8", className)}>
      {siteConfig.navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-xs lg:text-sm font-sans tracking-wide uppercase transition-colors duration-200 py-1 relative",
              isActive
                ? "text-ink font-semibold"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {item.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
