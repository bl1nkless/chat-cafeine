"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { CatMascot } from "@/components/mascot/CatMascot";

const categories = [
  { id: "all", label: "Tous les desserts" },
  { id: "gateaux", label: "Gâteaux" },
  { id: "cheesecakes", label: "Cheesecakes" },
  { id: "patisseries", label: "Pâtisseries" },
  { id: "viennoiseries", label: "Viennoiseries" },
  { id: "confiseries", label: "Confiseries" },
];

const catalogItems = [
  {
    name: "Napoléon",
    category: "gateaux",
    image: "/images/home/product-napoleon.jpg",
    slug: "napoleon",
  },
  {
    name: "Gâteau Signature",
    category: "gateaux",
    image: "/images/home/product-kyiv.jpg",
    slug: "gateau-signature",
  },
  {
    name: "Cheesecakes",
    category: "cheesecakes",
    image: "/images/home/product-cheesecake.jpg",
    slug: "cheesecakes",
  },
  {
    name: "Roulés Cannelle",
    category: "viennoiseries",
    image: "/images/home/product-cinnabon.jpg",
    slug: "roules-cannelle",
  },
  {
    name: "Tartelettes aux Fruits",
    category: "patisseries",
    image: "/images/home/product-tartelette.jpg",
    slug: "tartelettes",
  },
];

export function CatalogPreviewSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? catalogItems
      : catalogItems.filter((item) => item.category === activeCategory);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F6F3EE] border-b border-sand/30">
      <Container size="wide">
        <div className="space-y-8 sm:space-y-10">
          {/* Header row with Title, Ornament & Top-Right Walking Cat */}
          <div className="relative text-center space-y-2">
            <div className="relative flex items-center justify-center">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-normal uppercase tracking-widest">
                Gâteaux sur Commande
              </h2>
              {/* Walking cat on top right matching reference placement */}
              <div className="absolute right-2 sm:right-6 -top-3 hidden sm:block">
                <CatMascot pose="walk" size="default" className="opacity-95" />
              </div>
            </div>
            <OrnamentDivider className="w-20" />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-7 overflow-x-auto pb-2 scrollbar-none text-xs font-sans tracking-wide">
            {categories.map((c) => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`whitespace-nowrap pb-1 transition-colors cursor-pointer select-none relative ${
                    isActive
                      ? "text-ink font-semibold border-b border-ink"
                      : "text-ink-muted hover:text-ink font-light"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* 5 Product Cards matching exact card tint #EBE3D5 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {(filteredItems.length > 0 ? filteredItems : catalogItems).map((item, idx) => (
              <Link
                key={idx}
                href={`/gateaux/${item.slug}`}
                className="group flex flex-col rounded-2xl bg-[#EBE3D5] hover:bg-[#E4DAC8] border border-[#DFD5C4] p-3 text-center transition-all duration-300 shadow-2xs hover:shadow-xs"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-warm/40 border border-sand/30">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-3 pb-1">
                  <h3 className="font-serif text-xs sm:text-sm text-ink font-normal group-hover:text-brown transition-colors">
                    {item.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
