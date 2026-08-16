import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PickupBadge } from "@/components/ui/PickupBadge";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CatMascot } from "@/components/mascot/CatMascot";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Foundation Section */}
      <Section spacing="lg" className="relative overflow-hidden pt-12 pb-20 border-b border-sand/30">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="brown" size="default">Pâtisserie Artisanale</Badge>
                <PickupBadge variant="pill" />
              </div>

              <Heading as="h1" size="display">
                Des gâteaux faits maison pour les moments qui comptent.
              </Heading>

              <Text variant="lead">
                Une pâtisserie familiale et chaleureuse à Chartres. Médovik, Napoléon, Cheesecakes d&apos;exception préparés à la commande avec des ingrédients 100% naturels.
              </Text>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button size="lg" href="/gateaux">
                  Découvrir nos gâteaux
                </Button>
                <WhatsAppButton size="lg" />
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-ink-muted font-sans border-t border-sand/30">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brown" />
                  100% Fait main
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brown" />
                  Pur beurre 82%
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brown" />
                  Sans additifs
                </span>
              </div>
            </div>

            {/* Right Brand Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-warm/60 border border-sand/60 p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-brown font-semibold">
                    Signature Pâtisserie
                  </span>
                  <CatMascot pose="peek" size="sm" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-3xl text-ink">Médovik Traditionnel</h3>
                  <p className="font-serif italic text-sm text-ink-muted">
                    Fines couches au miel sauvage et crème légère onctueuse
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cream/80 border border-sand/40 space-y-2 text-xs">
                  <div className="flex justify-between text-ink font-medium">
                    <span>Format conseillé</span>
                    <span>6 à 10 parts</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Délai de fabrication</span>
                    <span>48 heures</span>
                  </div>
                  <div className="flex justify-between text-ink font-semibold text-sm pt-2 border-t border-sand/30">
                    <span>Prix</span>
                    <span>À partir de 38 €</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <PickupBadge variant="prominent" />
                </div>

                <Button variant="outline" fullWidth href="/gateaux">
                  Consulter la fiche détaillée
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* M1 Visual System Showcase & Mascot Posings */}
      <Section spacing="default" className="bg-warm/30 border-b border-sand/30">
        <Container size="default">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="sand">Système Visuel M1</Badge>
            <Heading as="h2" size="h2">
              Identité de Marque & Directives Graphiques
            </Heading>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Palette crème & espresso, typographie éditoriale contrastée et intégration discrète de notre mascotte.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Color Palette Card */}
            <div className="p-6 rounded-xl bg-cream border border-sand/50 space-y-4">
              <h3 className="font-serif text-lg text-ink font-medium">Palette Chromatique</h3>
              <div className="grid grid-cols-5 gap-2 pt-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-[#F6F3EE] border border-sand/60 shadow-2xs" />
                  <span className="text-[10px] text-ink-muted">#F6F3EE</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-[#E8DED0] border border-sand/60 shadow-2xs" />
                  <span className="text-[10px] text-ink-muted">#E8DED0</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-[#C9B79C] shadow-2xs" />
                  <span className="text-[10px] text-ink-muted">#C9B79C</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-[#8B6E4F] shadow-2xs" />
                  <span className="text-[10px] text-ink-muted">#8B6E4F</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] shadow-2xs" />
                  <span className="text-[10px] text-ink-muted">#1A1A1A</span>
                </div>
              </div>
              <p className="text-xs text-ink-muted pt-2 leading-relaxed">
                Tons crème, ivoire et café chaud créant une atmosphère artisanale et chaleureuse.
              </p>
            </div>

            {/* Typography Card */}
            <div className="p-6 rounded-xl bg-cream border border-sand/50 space-y-4">
              <h3 className="font-serif text-lg text-ink font-medium">Typographie Bilingue</h3>
              <div className="space-y-2 text-left">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Titre Principal</span>
                  <p className="font-serif text-xl text-ink">Playfair Display Serif</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Récit & Citations</span>
                  <p className="font-story italic text-sm text-ink-muted">« Lora text pour les récits »</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Interface & Chiffres</span>
                  <p className="font-sans text-xs text-ink">Montserrat · Navigation & Boutons</p>
                </div>
              </div>
            </div>

            {/* Cat Mascot Anchors Card */}
            <div className="p-6 rounded-xl bg-cream border border-sand/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-ink font-medium">Mascotte Chat Noir</h3>
                <CatMascot pose="walk" size="sm" />
              </div>
              <div className="flex items-center justify-around py-2 border-y border-sand/30">
                <div className="text-center">
                  <CatMascot pose="sit" size="sm" className="mx-auto" />
                  <span className="text-[10px] text-ink-muted mt-1 block">Assis</span>
                </div>
                <div className="text-center">
                  <CatMascot pose="walk" size="sm" className="mx-auto" />
                  <span className="text-[10px] text-ink-muted mt-1 block">Marche</span>
                </div>
                <div className="text-center">
                  <CatMascot pose="peek" size="sm" className="mx-auto" />
                  <span className="text-[10px] text-ink-muted mt-1 block">Curieux</span>
                </div>
                <div className="text-center">
                  <CatMascot pose="sleep" size="sm" className="mx-auto" />
                  <span className="text-[10px] text-ink-muted mt-1 block">Endormi</span>
                </div>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Apparaît ponctuellement pour souligner la personnalité du café sans gêner l&apos;ergonomie.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4-Step Order Process Flow Preview */}
      <Section spacing="default">
        <Container size="wide">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-sans font-semibold uppercase tracking-widest text-brown">
              Comment ça marche
            </span>
            <Heading as="h2" size="h2">
              Commander votre gâteau en 4 étapes
            </Heading>
            <Text variant="lead" className="max-w-xl mx-auto">
              Un processus direct, artisanal et sans intermédiaire superflu.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-3 relative">
              <span className="text-3xl font-serif text-brown/40 font-bold block">01</span>
              <h3 className="font-serif text-xl text-ink">Choisissez</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Parcourez notre catalogue et personnalisez vos portions (de 4 à 10 parts) et options.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-3 relative">
              <span className="text-3xl font-serif text-brown/40 font-bold block">02</span>
              <h3 className="font-serif text-xl text-ink">Échangez sur WhatsApp</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Envoyez votre demande pré-remplie et convenez ensemble de la date et des souhaits particuliers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-3 relative">
              <span className="text-3xl font-serif text-brown/40 font-bold block">03</span>
              <h3 className="font-serif text-xl text-ink">Validez par acompte</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Réglez l&apos;acompte en toute sécurité via le lien de paiement SumUp transmis par la cheffe.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-warm/30 border border-sand/40 space-y-3 relative">
              <span className="text-3xl font-serif text-brown/40 font-bold block">04</span>
              <h3 className="font-serif text-xl text-ink">Retrait au café</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Venez récupérer votre gâteau tout frais préparé au 12 Rue des Changes à Chartres.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
