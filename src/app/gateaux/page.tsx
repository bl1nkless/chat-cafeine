"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { CatMascot } from "@/components/mascot/CatMascot";
import { catalogCategories, catalogProducts } from "@/content/catalog";

export default function GateauxCatalogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts =
    activeCategory === "all"
      ? catalogProducts
      : catalogProducts.filter((item) => item.category === activeCategory);

  return (
    <div className="py-10 sm:py-14 lg:py-16 bg-[#F6F3EE] min-h-screen">
      <Container size="wide">
        <div className="space-y-8 sm:space-y-10">
          {/* Header Row with Centered Title, Ornament & Walking Cat Mascot */}
          <div className="relative text-center space-y-2">
            <div className="relative flex items-center justify-center">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-normal uppercase tracking-widest">
                Gâteaux sur Commande
              </h1>
              {/* Walking cat on top right matching reference */}
              <div className="absolute right-2 sm:right-6 -top-3 hidden sm:block">
                <CatMascot pose="walk" size="default" className="opacity-95" />
              </div>
            </div>
            <OrnamentDivider className="w-20" />
          </div>

          {/* Minimalist Text-First Category Filter Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-7 overflow-x-auto pb-2 scrollbar-none text-xs font-sans tracking-wide">
            {catalogCategories.map((c) => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`whitespace-nowrap pb-1 transition-colors cursor-pointer select-none relative ${
                    isActive
                      ? "text-ink font-semibold border-b-2 border-ink"
                      : "text-ink-muted hover:text-ink font-light"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Photography-First Editorial Product Grid (4 items per row on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/gateaux/${product.slug}`}
                className="group flex flex-col rounded-2xl bg-[#EBE3D5] hover:bg-[#E4DAC8] border border-[#DFD5C4] p-3.5 text-left transition-all duration-300 shadow-2xs hover:shadow-xs"
              >
                {/* Large Product Photograph (70–80% visual weight) */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-warm/40 border border-sand/30">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Editorial Details */}
                <div className="pt-3.5 pb-1 flex flex-col flex-1 justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h2 className="font-serif text-lg text-ink font-normal group-hover:text-brown transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-xs text-ink-muted font-sans font-light leading-relaxed line-clamp-2">
                      {product.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-sand/40 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-ink-muted font-sans font-light">
                        {product.portions}
                      </span>
                      <span className="font-serif text-sm font-medium text-ink">
                        À partir de {product.priceFrom} €
                      </span>
                    </div>

                    <span className="text-xs font-sans text-brown font-medium group-hover:text-ink transition-colors flex items-center gap-1">
                      <span>Voir</span>
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Calm Editorial Pickup Info Notice */}
          <div className="mt-12 p-5 sm:p-6 rounded-2xl bg-warm/30 border border-sand/40 text-center max-w-2xl mx-auto space-y-1.5">
            <p className="font-serif italic text-sm sm:text-base text-ink">
              « Chaque gâteau est confectionné artisanalement à la main, sur commande préalable. »
            </p>
            <p className="text-xs text-ink-muted font-sans font-light">
              Retrait au café à Chartres uniquement (12 Rue des Changes) · Pas de livraison.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
