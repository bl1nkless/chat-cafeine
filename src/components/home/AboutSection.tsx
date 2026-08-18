import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";

export function AboutSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F6F3EE] border-b border-sand/30">
      <Container size="wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Narrative */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal uppercase tracking-widest">
                À Propos
              </h2>
              <div className="flex justify-start">
                <OrnamentDivider className="mx-0 w-20" />
              </div>
            </div>

            <div className="space-y-4 text-ink-muted text-sm sm:text-base leading-relaxed font-sans font-light">
              <p>
                Maman de trois enfants, j&apos;ai toujours cuisiné pour ma famille avec amour et la plus grande attention. Mes enfants ont grandi, mais le plaisir de régaler mes proches avec des pâtisseries sincères et naturelles est resté intact. C&apos;est de cette passion qu&apos;est née <strong className="font-medium text-ink">Chat Caféiné</strong>.
              </p>
              <p>
                Ici, chaque gâteau est confectionné artisanalement à la main, sans aucun compromis sur la qualité : vrai beurre doux 82%, œufs frais, vanille Bourbon et fruits de saison. Je prépare chaque commande pour mes clients exactement comme je le ferais pour ma propre famille.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/a-propos"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-ink/40 text-ink font-sans text-xs font-medium uppercase tracking-wider hover:bg-warm/60 hover:border-ink transition-all duration-200"
              >
                En savoir plus
              </Link>
            </div>
          </div>

          {/* Right Photographic Mosaic (3 photos) matching reference proportions */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-3 sm:gap-4 items-stretch">
              {/* Left Tall Photo: Pâtissière frosting cake */}
              <div className="col-span-7 relative min-h-[320px] sm:min-h-[380px] rounded-2xl overflow-hidden shadow-xs border border-sand/40 bg-warm/20">
                <Image
                  src="/images/home/about-patissiere-cake.jpg"
                  alt="La cheffe de Chat Caféiné décorant un gâteau fait maison"
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Right Two Photos: Storefront & Cat Portrait */}
              <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
                <div className="relative h-[155px] sm:h-[185px] rounded-2xl overflow-hidden shadow-xs border border-sand/40 bg-warm/20">
                  <Image
                    src="/images/home/about-cafe-storefront.jpg"
                    alt="Boutique et café Chat Caféiné à Chartres"
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="relative h-[155px] sm:h-[185px] rounded-2xl overflow-hidden shadow-xs border border-sand/40 bg-warm/20">
                  <Image
                    src="/images/home/about-cat-portrait.jpg"
                    alt="Le chat noir de Chat Caféiné aux yeux d'or"
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
