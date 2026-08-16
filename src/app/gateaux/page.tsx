import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PickupBadge } from "@/components/ui/PickupBadge";

export const metadata = {
  title: "Gâteaux sur commande",
  description: "Catalogue de nos gâteaux et pâtisseries artisanales sur commande à Chartres.",
};

const sampleCakes = [
  {
    slug: "medovik",
    name: "Médovik",
    subtitle: "Gâteau au miel et crème légère",
    priceFrom: 38,
    portions: "6 à 10 parts",
    badge: "Populaire" as const,
  },
  {
    slug: "napoleon",
    name: "Napoléon",
    subtitle: "Feuilletage maison croustillant & crème diplomate",
    priceFrom: 42,
    portions: "6 à 10 parts",
    badge: "Populaire" as const,
  },
  {
    slug: "cheesecake-vanille",
    name: "Cheesecake Vanille de Madagascar",
    subtitle: "Texture fondante et sablé croustillant",
    priceFrom: 36,
    portions: "6 à 8 parts",
    badge: "Saisonnier" as const,
  },
];

export default function GateauxCatalogPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container size="wide">
        <div className="space-y-4 max-w-3xl mb-12">
          <div className="flex items-center gap-3">
            <Badge variant="brown">Catalogue</Badge>
            <PickupBadge variant="inline" />
          </div>
          <Heading as="h1" size="display">
            Gâteaux sur commande
          </Heading>
          <Text variant="lead">
            Chaque création est confectionnée à la commande pour vous garantir une fraîcheur et une texture incomparables.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleCakes.map((cake) => (
            <div
              key={cake.slug}
              className="rounded-2xl bg-warm/30 border border-sand/50 p-6 flex flex-col justify-between space-y-6 hover:border-sand transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="sand">{cake.badge}</Badge>
                  <span className="text-xs text-ink-muted">{cake.portions}</span>
                </div>
                <h3 className="font-serif text-2xl text-ink">{cake.name}</h3>
                <p className="text-xs text-ink-muted leading-relaxed font-sans">
                  {cake.subtitle}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-sand/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Prix indicatif</span>
                  <span className="font-serif text-lg font-medium text-ink">
                    À partir de {cake.priceFrom} €
                  </span>
                </div>
                <Button fullWidth href={`/gateaux/${cake.slug}`}>
                  Voir la composition
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
