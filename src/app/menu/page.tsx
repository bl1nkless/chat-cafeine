import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "Menu du Café",
  description: "Boissons chaudes, cafés de spécialité et douceurs du jour au café Chat Caféiné à Chartres.",
};

export default function MenuPage() {
  return (
    <div className="py-12">
      <Container size="default">
        <div className="space-y-6 max-w-3xl">
          <Badge variant="brown">Sur Place & À Emporter</Badge>
          <Heading as="h1" size="display">
            Menu du Café
          </Heading>
          <Text variant="lead">
            Cafés de spécialité, thés fins et douceurs du jour servies avec soin au comptoir.
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-4">
              <h3 className="font-serif text-xl text-ink">Cafés & Boissons Chaudes</h3>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Espresso / Double</span>
                  <span className="font-medium text-ink">2.20 € / 3.20 €</span>
                </li>
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Cappuccino</span>
                  <span className="font-medium text-ink">4.20 €</span>
                </li>
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Flat White</span>
                  <span className="font-medium text-ink">4.50 €</span>
                </li>
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Latte Pâtissier</span>
                  <span className="font-medium text-ink">4.80 €</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-4">
              <h3 className="font-serif text-xl text-ink">Pâtisseries à la Part</h3>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Part de Médovik du jour</span>
                  <span className="font-medium text-ink">5.50 €</span>
                </li>
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Part de Napoléon</span>
                  <span className="font-medium text-ink">5.50 €</span>
                </li>
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Cheesecake Vanille</span>
                  <span className="font-medium text-ink">5.20 €</span>
                </li>
                <li className="flex justify-between border-b border-sand/20 pb-1">
                  <span>Cinnabon Cannelle</span>
                  <span className="font-medium text-ink">4.20 €</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
