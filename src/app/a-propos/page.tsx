import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { PickupBadge } from "@/components/ui/PickupBadge";
import { CatMascot } from "@/components/mascot/CatMascot";

export const metadata = {
  title: "À propos",
  description: "L'histoire de Chat Caféiné, café et pâtisserie familiale à Chartres.",
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <Container size="default">
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <Badge variant="brown">Notre Histoire</Badge>
            <CatMascot pose="walk" size="sm" />
          </div>
          <Heading as="h1" size="display">
            Une histoire de famille et de passion à Chartres.
          </Heading>
          <Text variant="lead" className="font-story italic text-ink text-xl">
            « Maman de trois enfants, j&apos;ai toujours cuisiné pour les miens avec le plus grand soin. Chat Caféiné est né de cette même envie : partager des gâteaux sincères, sans artifices. »
          </Text>
          <div className="p-8 rounded-2xl bg-warm/40 border border-sand/50 space-y-4">
            <h3 className="font-serif text-2xl text-ink">Notre philosophie</h3>
            <Text variant="body">
              Tous nos gâteaux sont confectionnés à la main, dans notre atelier à Chartres. Nous utilisons exclusivement des ingrédients nobles : vrai beurre doux 82%, miel pur, œufs frais, vanille naturelle. Nous refusons catégoriquement la margarine, la pâte à sucre industrielle et les colorants superflus.
            </Text>
            <div className="pt-2">
              <PickupBadge variant="prominent" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
