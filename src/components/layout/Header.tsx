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
  const hasVisualHero = pathname === "/" || pathname === "/menu";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useDarkTheme = hasVisualHero && !scrolled;

  return (
    <header
      className={cn(
        "w-full transition-all duration-300 z-40",
        hasVisualHero
          ? "absolute top-0 left-0 right-0"
          : "sticky top-0 bg-[#F6F3EE]/95 backdrop-blur-md border-b border-sand/40",
        scrolled && hasVisualHero
          ? "fixed bg-[#F6F3EE]/95 backdrop-blur-md border-b border-sand/40 py-3 shadow-xs"
          : "",
        useDarkTheme
          ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4 sm:py-6"
          : "py-3.5 sm:py-4"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none shrink-0"
            aria-label="Chat Caféiné — Accueil"
          >
            <CatMascot
              pose="sit"
              size="sm"
              className={cn(
                "transition-transform duration-300 group-hover:-translate-y-0.5",
                useDarkTheme ? "text-white" : "text-ink"
              )}
            />
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-serif text-xl sm:text-2xl font-normal tracking-tight leading-none",
                  useDarkTheme ? "text-white" : "text-ink"
                )}
              >
                Chat Caféiné
              </span>
              <span
                className={cn(
                  "text-[9px] font-sans tracking-[0.2em] uppercase mt-0.5 font-light",
                  useDarkTheme ? "text-cream/80" : "text-ink-muted"
                )}
              >
                Chartres
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <Navigation isScrolled={!useDarkTheme} />

          {/* Right Action: WhatsApp CTA Pill */}
          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-sans font-medium transition-all duration-200 shadow-xs",
                useDarkTheme
                  ? "bg-cream text-ink hover:bg-white hover:scale-105"
                  : "bg-ink text-cream hover:bg-black"
              )}
            >
              <MessageCircle className="w-3.5 h-3.5 opacity-90 stroke-[2.2]" />
              <span>WhatsApp</span>
            </Link>

            <MobileMenu isScrolled={!useDarkTheme} />
          </div>
        </div>
      </div>
    </header>
  );
}
