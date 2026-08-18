"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { siteConfig } from "@/content/site";
import { CatMascot } from "@/components/mascot/CatMascot";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isScrolled?: boolean;
}

export function MobileMenu({ isScrolled = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F3EE] pt-6 px-6 pb-8 overflow-y-auto animate-in fade-in duration-200">
      {/* Header row inside drawer */}
      <div className="flex items-center justify-between pb-6 border-b border-sand/40">
        <div className="flex items-center gap-2">
          <CatMascot pose="sit" size="sm" className="text-ink" />
          <span className="font-serif text-xl font-normal tracking-tight text-ink">
            Chat Caféiné
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 -mr-2 text-ink hover:text-brown focus:outline-none cursor-pointer flex items-center justify-center transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col gap-1 py-8 flex-1">
        {siteConfig.navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-lg font-serif py-3.5 border-b border-sand/20 transition-colors flex items-center justify-between",
                isActive
                  ? "text-ink font-semibold pl-2 border-l-2 border-l-brown"
                  : "text-ink-muted hover:text-ink font-normal"
              )}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 flex flex-col gap-4">
        <Link
          href={siteConfig.contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full bg-ink text-cream font-sans text-xs font-medium uppercase tracking-wider hover:bg-black transition-colors shadow-xs"
        >
          <MessageCircle className="w-4 h-4 opacity-90 stroke-[2.2]" />
          <span>Commander sur WhatsApp</span>
        </Link>

        <div className="text-center text-xs text-ink-muted font-light font-sans">
          <p className="font-medium text-ink">12 Rue des Changes, 28000 Chartres</p>
          <p className="mt-0.5">Retrait sur place · Pas de livraison</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 -mr-2 focus:outline-none cursor-pointer flex items-center justify-center transition-colors",
          isScrolled ? "text-ink hover:text-brown" : "text-white hover:text-cream"
        )}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && mounted && createPortal(drawerContent, document.body)}
    </div>
  );
}
