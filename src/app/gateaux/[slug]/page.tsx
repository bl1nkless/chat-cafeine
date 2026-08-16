import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { PickupBadge } from "@/components/ui/PickupBadge";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CatMascot } from "@/components/mascot/CatMascot";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const productName = slug === "medovik" ? "Médovik" : slug.toUpperCase();

  return (
    <div className="py-12 sm:py-16">
      <Container size="default">
        <div className="mb-8">
          <Link
            href="/gateaux"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au catalogue</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Visual Placeholder */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-warm/50 border border-sand/60 p-8 flex flex-col items-center justify-center min-h-[320px] text-center space-y-4">
              <CatMascot pose="peek" size="lg" />
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-brown font-semibold">
                  Vue Décomposée & Ingrédients
                </span>
                <p className="font-serif text-2xl text-ink">{productName}</p>
              </div>
              <p className="text-xs text-ink-muted max-w-sm">
                La composition interactive détaillée des couches de ce gâteau sera activée dans le jalon M3.
              </p>
            </div>

            <PickupBadge variant="prominent" />
          </div>

          {/* Right Product Configurator Stub */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <Badge variant="brown">Fait main sur commande</Badge>
              <Heading as="h1" size="h1">{productName}</Heading>
              <Text variant="lead">
                Gâteau d&apos;exception préparé avec du miel pur, de fines couches croustillantes et une crème onctueuse.
              </Text>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Prix estimé</span>
                <span className="font-serif text-2xl font-semibold text-ink">À partir de 38 €</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-sand/30">
                <span className="text-xs font-semibold text-ink">Portions disponibles</span>
                <div className="flex gap-2">
                  {["4 parts", "6 parts", "8 parts", "10 parts"].map((p, i) => (
                    <span
                      key={p}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        i === 1
                          ? "bg-ink text-cream"
                          : "bg-cream border border-sand/50 text-ink"
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <WhatsAppButton
                  fullWidth
                  size="lg"
                  message={`Bonjour 👋, je souhaite commander un gâteau ${productName} (6 parts) pour retrait au café à Chartres.`}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
