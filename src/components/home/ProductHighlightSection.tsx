import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { CatMascot } from "@/components/mascot/CatMascot";

export function ProductHighlightSection() {
  const whatsappUrl = `https://wa.me/33600000000?text=${encodeURIComponent(
    "Bonjour 👋, je souhaite commander un gâteau Napoléon pour retrait au café à Chartres."
  )}`;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F6F3EE] border-b border-sand/30">
      <Container size="wide">
        <div className="space-y-10 sm:space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-normal uppercase tracking-widest">
              Napoléon
            </h2>
            <OrnamentDivider className="w-20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-4xl mx-auto">
            {/* Left Large Product Photo */}
            <div className="lg:col-span-6">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-xs border border-sand/40 bg-warm/30">
                <Image
                  src="/images/home/product-napoleon.jpg"
                  alt="Tranche de gâteau Napoléon artisanal pur beurre"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Right Details & Composition */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <p className="font-serif text-base sm:text-lg text-ink font-normal leading-relaxed italic">
                Classique Napoléon au feuilletage maison croustillant et crème diplomate onctueuse.
              </p>

              {/* Composition List */}
              <div className="space-y-2">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink">
                  Composition
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm font-sans text-ink-muted font-light leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-brown font-bold select-none">•</span>
                    <span>Feuillets croustillants pur beurre (mille-feuille)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brown font-bold select-none">•</span>
                    <span>Crème légère à la vanille naturelle de Madagascar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brown font-bold select-none">•</span>
                    <span>Véritable beurre doux français 82%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brown font-bold select-none">•</span>
                    <span>Sans margarine ni additifs industriels</span>
                  </li>
                </ul>
              </div>

              {/* Minimum Order */}
              <div className="space-y-1 pt-1">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink">
                  Commande Minimale
                </h3>
                <p className="font-sans text-xs sm:text-sm text-ink-muted font-light">
                  À partir de 4 à 6 portions
                </p>
              </div>

              {/* CTA + Sitting Cat Mascot Lockup */}
              <div className="pt-2 flex items-center gap-4">
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-cream font-sans text-xs font-medium tracking-wide shadow-xs hover:bg-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 opacity-90 stroke-[2.2]" />
                  <span>Commander sur WhatsApp</span>
                </Link>

                <CatMascot pose="sit" size="default" className="opacity-95" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
