import React from "react";
import Link from "next/link";
import { MapPin, Clock, MessageCircle, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CatMascot } from "@/components/mascot/CatMascot";
import { siteConfig } from "@/content/site";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-warm/50 border-t border-sand/40 pt-16 pb-12 transition-colors">
      <Container size="wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-sand/40">
          {/* Brand & Concept */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <CatMascot pose="sit" size="sm" className="text-ink" />
              <span className="font-serif text-2xl text-ink">Chat Caféiné</span>
            </div>
            <p className="font-serif italic text-sm text-ink-muted leading-relaxed">
              « Fait maison avec amour, comme pour ma propre famille. »
            </p>
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              Pâtisserie artisanale et café de spécialité. Ingrédients 100% naturels, pur beurre 82%, sans compromis.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-ink">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm font-sans text-ink-muted">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-ink transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brown" />
              <span>Horaires d&apos;ouverture</span>
            </h3>
            <ul className="space-y-2 text-xs font-sans text-ink-muted">
              {siteConfig.hours.map((h, i) => (
                <li key={i} className="flex justify-between border-b border-sand/20 pb-1">
                  <span>{h.days}</span>
                  <span className="font-medium text-ink">{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Orders */}
          <div className="space-y-4">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brown" />
              <span>Retrait & Contact</span>
            </h3>

            <div className="text-xs font-sans text-ink-muted space-y-1.5">
              <p className="font-medium text-ink">{siteConfig.address.street}</p>
              <p>{siteConfig.address.postalCode} {siteConfig.address.city}, France</p>
              <div className="p-2.5 rounded-lg bg-sand/20 border border-sand/40 text-[11px] text-ink font-medium mt-2">
                ⚠️ Retrait au café uniquement · Pas de livraison
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Link
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-sans font-medium hover:bg-[#1EBE5D] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </Link>

              <Link
                href={siteConfig.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-sand/60 text-ink hover:bg-warm transition-colors"
                aria-label="Instagram de Chat Caféiné"
              >
                <InstagramIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Sleeping Cat */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted font-sans">
          <div className="flex items-center gap-3">
            <CatMascot pose="sleep" size="sm" className="text-ink/70" />
            <span>
              © {new Date().getFullYear()} Chat Caféiné · Chartres, France. Tous droits réservés.
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span>Fait avec</span>
            <Heart className="w-3 h-3 text-brown fill-current inline" />
            <span>à Chartres</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
