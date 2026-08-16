"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { siteConfig } from "@/content/site";
import { CatMascot } from "@/components/mascot/CatMascot";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when menu is open
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

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 text-ink hover:text-brown focus:outline-none cursor-pointer"
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-cream pt-20 px-6 pb-8 animate-in fade-in duration-200">
          <div className="flex justify-end absolute top-5 right-5">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-ink hover:text-brown focus:outline-none cursor-pointer"
              aria-label="Fermer le menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-8">
            <CatMascot pose="sit" size="sm" className="text-ink" />
            <span className="font-serif text-xl font-medium tracking-tight text-ink">
              Chat Caféiné
            </span>
          </div>

          <nav className="flex flex-col gap-4 flex-1">
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
                    "text-xl font-serif py-2 border-b border-sand/30 transition-colors",
                    isActive
                      ? "text-ink font-semibold pl-2 border-l-2 border-l-brown"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 flex flex-col gap-4">
            <Link
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-[#25D366] text-white font-sans text-sm font-medium hover:bg-[#1EBE5D] transition-colors"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Commander sur WhatsApp</span>
            </Link>

            <div className="text-center text-xs text-ink-muted/80">
              <p>12 Rue des Changes, 28000 Chartres</p>
              <p className="mt-1">Retrait sur place · Pas de livraison</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
