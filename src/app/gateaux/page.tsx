"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CatMascot } from "@/components/mascot/CatMascot";
import { catalogCategories, catalogProducts, CatalogProduct } from "@/content/catalog";

export default function GateauxCatalogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isManualScroll, setIsManualScroll] = useState<boolean>(false);

  // ALWAYS return all grouped products, we no longer filter out everything else
  const groupedProducts = useMemo(() => {
    const groups: { categoryId: string; label: string; products: CatalogProduct[] }[] = [];
    catalogCategories.forEach((cat) => {
      if (cat.id === "all") return;
      const products = catalogProducts.filter((p) => p.category === cat.id);
      if (products.length > 0) {
        groups.push({ categoryId: cat.id, label: cat.label, products });
      }
    });
    return groups;
  }, []);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (isManualScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting section that is well within view
        const visibleSections = entries.filter(entry => entry.isIntersecting);
        if (visibleSections.length > 0) {
          // Sort by intersection ratio or just take the first one
          const mostVisible = visibleSections.reduce((prev, curr) => 
            (curr.intersectionRatio > prev.intersectionRatio ? curr : prev)
          );
          setActiveCategory(mostVisible.target.id);
        } else if (window.scrollY < 100) {
          // If we scroll to the very top, set to "all"
          setActiveCategory("all");
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px", // adjust margins to trigger when section reaches top part of screen
        threshold: 0
      }
    );

    groupedProducts.forEach(group => {
      const el = document.getElementById(group.categoryId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [groupedProducts, isManualScroll]);

  // Click handler for category chips
  const handleScrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsManualScroll(true); // Disable observer temporarily to avoid jitter
    
    if (categoryId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(categoryId);
      if (el) {
        // Offset for the sticky header + some breathing room
        const yOffset = -80; 
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }

    // Re-enable observer after smooth scroll completes
    setTimeout(() => {
      setIsManualScroll(false);
    }, 800);
  };

  return (
    <div className="pt-2 sm:pt-6 pb-16 bg-[#F6F3EE] min-h-screen">
      <Container size="default">
        <div className="space-y-6 sm:space-y-10">
          
          {/* CATEGORY CHIPS (Sticky Navigation) */}
          <div className="sticky top-0 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-4 bg-[#F6F3EE]/95 backdrop-blur-md border-b sm:border-b-0 border-sand/40 sm:py-2 transition-all">
            <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto items-center gap-2 pb-2 sm:pb-0 scrollbar-hide">
              {catalogCategories.map((c) => {
                const isActive = activeCategory === c.id;
                // Only show categories that actually have products (except "all")
                if (c.id !== "all" && !groupedProducts.find(g => g.categoryId === c.id)) {
                  return null;
                }
                return (
                  <button
                    key={c.id}
                    onClick={() => handleScrollToCategory(c.id)}
                    className={`whitespace-nowrap px-4 py-1.5 text-[13px] font-sans font-medium rounded-full transition-colors cursor-pointer select-none border ${
                      isActive
                        ? "bg-ink text-[#F6F3EE] border-ink"
                        : "bg-[#FDFBF7] text-ink-muted border-sand/40 hover:border-sand hover:text-ink"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DENSE PRODUCT GRID SECTIONS */}
          <div className="space-y-16 sm:space-y-20 pt-4">
            {groupedProducts.map((group, groupIdx) => (
              <div 
                key={group.categoryId} 
                id={group.categoryId} 
                className="space-y-5 sm:space-y-7 scroll-mt-24"
              >
                
                {/* Section Heading (Left Aligned) */}
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-3xl sm:text-[38px] text-ink font-normal uppercase tracking-wide leading-none">
                    {group.label}
                  </h2>
                  {/* Show cat only on the first section */}
                  {groupIdx === 0 && (
                    <CatMascot pose="walk" className="w-12 h-12 text-ink opacity-90" />
                  )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-[18px]">
                  {group.products.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/gateaux/${product.slug}`}
                      className="group flex flex-col space-y-3 outline-none"
                    >
                      {/* Photo - Object fit cover, slightly taller aspect ratio */}
                      <div className="relative w-full aspect-[4/5] rounded-[12px] overflow-hidden bg-warm/30">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Info - No extra background, direct on page */}
                      <div className="space-y-0.5 px-0.5">
                        <h3 className="font-serif text-[19px] text-ink font-normal leading-tight group-hover:text-brown transition-colors">
                          {product.name}
                        </h3>
                        <p className="font-sans text-[13.5px] text-ink-muted leading-tight">
                          dès {product.priceFrom} € <span className="px-1 text-[10px] opacity-60">·</span> {product.portions}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      </Container>
    </div>
  );
}
