import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ValuesSection } from "@/components/home/ValuesSection";
import { CatalogPreviewSection } from "@/components/home/CatalogPreviewSection";
import { ProductHighlightSection } from "@/components/home/ProductHighlightSection";
import { OrderProcessSection } from "@/components/home/OrderProcessSection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-[#F6F3EE]">
      {/* 1. Immersive Full-Bleed Hero */}
      <HeroSection />

      {/* 2. À Propos (Family Backstory & 3-Photo Mosaic) */}
      <AboutSection />

      {/* 3. Nos Valeurs (4 Pillars with Line Art & Walking Cat) */}
      <ValuesSection />

      {/* 4. Gâteaux sur Commande (Category Filter & 5 Product Showcase) */}
      <CatalogPreviewSection />

      {/* 5. Napoléon Feature (Slice Photo, Composition Bullets, WhatsApp CTA, Sitting Cat) */}
      <ProductHighlightSection />

      {/* 6. Comment Commander & Philosophy Quote Card */}
      <OrderProcessSection />
    </div>
  );
}
