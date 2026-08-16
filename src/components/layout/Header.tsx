import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { CatMascot } from "@/components/mascot/CatMascot";
import { siteConfig } from "@/content/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-cream/90 backdrop-blur-md border-b border-sand/40 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none shrink-0"
            aria-label="Chat Caféiné — Accueil"
          >
            <CatMascot
              pose="sit"
              size="sm"
              className="text-ink transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-ink leading-tight">
                Chat Caféiné
              </span>
              <span className="text-[10px] font-sans tracking-widest text-ink-muted uppercase -mt-0.5">
                Chartres
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <Navigation />

          {/* Right Action & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-sans font-medium hover:bg-[#1EBE5D] transition-colors shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </Link>

            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
