import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { PickupBadge } from "@/components/ui/PickupBadge";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata = {
  title: "Commande & Retrait",
  description: "Comment commander vos gâteaux et modalités de retrait au café Chat Caféiné à Chartres.",
};

export default function CommandeRetraitPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container size="default">
        <div className="space-y-6 max-w-3xl mb-12">
          <Badge variant="brown">Guide Pratique</Badge>
          <Heading as="h1" size="display">
            Commande & Retrait à Chartres
          </Heading>
          <Text variant="lead">
            Retrouvez toutes les étapes simples pour commander votre gâteau sur mesure et le récupérer à notre boutique.
          </Text>
        </div>

        <div className="space-y-8 max-w-3xl">
          {/* Important Notice */}
          <PickupBadge variant="prominent" />

          {/* Steps */}
          <div className="space-y-6 pt-4">
            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brown text-cream flex items-center justify-center font-serif text-lg font-bold shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-ink">Choisissez et personnalisez</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Consultez notre catalogue et choisissez le nombre de parts adapté (4, 6, 8, 10 ou 12 personnes) ainsi que vos options éventuelles.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brown text-cream flex items-center justify-center font-serif text-lg font-bold shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-ink">Envoyez votre message WhatsApp</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Un simple clic sur le bouton WhatsApp génère votre demande pré-remplie avec tous les détails. Nous confirmons la faisabilité pour la date souhaitée.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brown text-cream flex items-center justify-center font-serif text-lg font-bold shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-ink">Règlement de l&apos;acompte (SumUp)</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Vous recevez un lien de paiement direct et sécurisé SumUp pour régler l&apos;acompte de validation.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brown text-cream flex items-center justify-center font-serif text-lg font-bold shrink-0">
                4
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-ink">Retrait au café</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Votre gâteau vous attend au café, frais du jour, prêt à être dégusté !
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center">
            <WhatsAppButton size="lg" />
          </div>
        </div>
      </Container>
    </div>
  );
}
