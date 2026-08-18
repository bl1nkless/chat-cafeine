import React from "react";
import Link from "next/link";
import { MapPin, Clock, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PickupBadge } from "@/components/ui/PickupBadge";
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

export const metadata = {
  title: "Contact & Horaires",
  description: "Venez nous rendre visite au café Chat Caféiné à Chartres ou contactez-nous par WhatsApp.",
};

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container size="default">
        <div className="space-y-6 max-w-3xl mb-12">
          <Badge variant="brown">Nous Trouver</Badge>
          <Heading as="h1" size="display">
            Contact & Horaires
          </Heading>
          <Text variant="lead">
            Nous vous accueillons au cœur de Chartres pour déguster un café d&apos;exception ou récupérer vos commandes de gâteaux.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Address & Hours */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-4">
              <div className="flex items-center gap-2 text-ink">
                <MapPin className="w-5 h-5 text-brown" />
                <h2 className="font-serif text-xl font-medium">Adresse du Café</h2>
              </div>
              <div className="text-sm text-ink-muted space-y-1">
                <p className="font-medium text-ink">{siteConfig.address.street}</p>
                <p>{siteConfig.address.postalCode} {siteConfig.address.city}</p>
                <p>France</p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  href={siteConfig.address.googleMapsUrl}
                  target="_blank"
                >
                  Voir sur Google Maps
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-4">
              <div className="flex items-center gap-2 text-ink">
                <Clock className="w-5 h-5 text-brown" />
                <h2 className="font-serif text-xl font-medium">Horaires</h2>
              </div>
              <ul className="space-y-2 text-xs font-sans text-ink-muted">
                {siteConfig.hours.map((h, i) => (
                  <li key={i} className="flex justify-between border-b border-sand/20 pb-1">
                    <span>{h.days}</span>
                    <span className="font-medium text-ink">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-6">
              <h2 className="font-serif text-xl text-ink font-medium">Commander & Nous Écrire</h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Pour toute commande de gâteau ou question sur nos ingrédients et allergènes, contactez directement la cheffe via WhatsApp.
              </p>

              <div className="space-y-3">
                <Link
                  href={siteConfig.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-warm/50 border border-sand/50 text-ink hover:bg-warm transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-ink" />
                  <div>
                    <span className="text-xs font-semibold block text-ink">WhatsApp Direct</span>
                    <span className="text-[11px] text-ink-muted">Réponse rapide de la cheffe</span>
                  </div>
                </Link>

                <Link
                  href={siteConfig.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-warm/40 border border-sand/40 text-ink hover:bg-warm/60 transition-colors"
                >
                  <InstagramIcon className="w-5 h-5 text-brown" />
                  <div>
                    <span className="text-xs font-semibold block text-ink">Instagram</span>
                    <span className="text-[11px] text-ink-muted">@chatcafeine</span>
                  </div>
                </Link>
              </div>

              <PickupBadge variant="prominent" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
