"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { CatMascot } from "@/components/mascot/CatMascot";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Route variant resolution:
  // Pages with full-bleed photographic hero (Home / and Menu /menu) use "overlay" when at top of page.
  // Standalone cream pages (like /gateaux, /a-propos, /contact, etc.) always use "light".
  const hasVisualHero = pathname === "/" || pathname === "/menu";
  const isOverlay = hasVisualHero && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      // Scrolled state for background styling on hero pages
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        // Geometry is strictly constant across all routes
        "w-full z-40 py-4 sm:py-5 transition-colors duration-200 ease-in-out",
        hasVisualHero ? "absolute top-0 left-0 right-0" : "relative",
        isOverlay
          ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent"
          : "bg-[#F6F3EE]/95 border-b border-sand/40",
        scrolled && hasVisualHero ? "fixed bg-[#F6F3EE]/95 backdrop-blur-md border-b border-sand/40 shadow-xs" : ""
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo - Fixed geometry, color transitions only */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none shrink-0"
            aria-label="Chat Caféiné — Accueil"
          >
            <CatMascot
              pose="sit"
              size="sm"
              className={cn(
                "transition-colors duration-200 shrink-0",
                isOverlay ? "text-white" : "text-ink"
              )}
            />
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-serif text-xl sm:text-2xl font-normal tracking-tight leading-none transition-colors duration-200",
                  isOverlay ? "text-white" : "text-ink"
                )}
              >
                Chat Caféiné
              </span>
              <span
                className={cn(
                  "text-[9px] font-sans tracking-[0.2em] uppercase mt-0.5 font-light transition-colors duration-200",
                  isOverlay ? "text-cream/80" : "text-ink-muted"
                )}
              >
                Chartres
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <Navigation isOverlay={isOverlay} />

          {/* Right Action: WhatsApp CTA Pill - Fixed geometry (px-5 py-2), color transitions only */}
          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-sans font-medium shadow-xs transition-colors duration-200",
                isOverlay
                  ? "bg-cream text-ink hover:bg-white"
                  : "bg-ink text-cream hover:bg-black"
              )}
            >
              <MessageCircle className="w-3.5 h-3.5 opacity-90 stroke-[2.2] shrink-0" />
              <span>WhatsApp</span>
            </Link>

            <MobileMenu isOverlay={isOverlay} />
          </div>
        </div>
      </div>
    </header>
  );
}
