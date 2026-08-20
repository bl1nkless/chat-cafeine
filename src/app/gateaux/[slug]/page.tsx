"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Users, Leaf, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductConfiguratorDrawer } from "@/components/product/ProductConfiguratorDrawer";
import { catalogProducts } from "@/content/catalog";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "medovik";

  const product =
    catalogProducts.find((p) => p.slug === slug) ||
    catalogProducts.find((p) => p.slug === "medovik")!;

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const defaultPortion = product.portionOptions[0]?.value || 6;
  const [selectedPortion, setSelectedPortion] = useState<number>(defaultPortion);

  const defaultOptions: Record<string, string> = {};
  product.optionGroups?.forEach((grp) => {
    if (grp.options.length > 0) {
      defaultOptions[grp.id] = grp.options[0].id;
    }
  });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultOptions);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [requestedDate, setRequestedDate] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");

  const isConfigured = useMemo(() => {
    const isPortionChanged = selectedPortion !== defaultPortion;
    const isFruitChanged = selectedOptions["fruits"] && selectedOptions["fruits"] !== "none";
    const isDecorChanged = selectedOptions["decoration"] && selectedOptions["decoration"] !== (product.optionGroups?.find(g => g.id === "decoration")?.options[0]?.id || "natural");
    const isRemoved = removedIngredients.length > 0;
    const isDateSet = requestedDate !== "";
    const isNoteSet = customerNote !== "";
    return isPortionChanged || isFruitChanged || isDecorChanged || isRemoved || isDateSet || isNoteSet;
  }, [selectedPortion, defaultPortion, selectedOptions, removedIngredients, requestedDate, customerNote, product]);

  const handleOptionChange = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const handleToggleRemove = (ingredientId: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId]
    );
  };

  const { totalPrice } = useMemo(() => {
    const matchedPortion = product.portionOptions.find((p) => p.value === selectedPortion);
    const base = matchedPortion ? matchedPortion.price : product.priceFrom;
    let delta = 0;
    product.optionGroups?.forEach((grp) => {
      const selectedId = selectedOptions[grp.id];
      const opt = grp.options.find((o) => o.id === selectedId);
      if (opt) delta += opt.priceDelta;
    });
    return { totalPrice: base + delta };
  }, [product, selectedPortion, selectedOptions]);

  const whatsappMessage = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Bonjour 👋`);
    lines.push(``);
    lines.push(`Je souhaite commander un ${product.name}.`);
    lines.push(``);
    lines.push(`• Nombre de personnes : ${selectedPortion} personnes`);
    product.optionGroups?.forEach((grp) => {
      const selectedId = selectedOptions[grp.id];
      const opt = grp.options.find((o) => o.id === selectedId);
      if (opt) lines.push(`• ${grp.label} : ${opt.label}`);
    });
    if (removedIngredients.length > 0) {
      const removedLabels = removedIngredients.map((id) => product.removableIngredients?.find((r) => r.id === id)?.label).filter(Boolean);
      lines.push(`• À retirer : ${removedLabels.join(", ")}`);
    }
    if (requestedDate) lines.push(`• Date de retrait souhaitée : ${requestedDate}`);
    if (customerNote.trim()) lines.push(`• Note / message : ${customerNote.trim()}`);
    lines.push(``);
    lines.push(`Prix estimé : ${totalPrice} €`);
    lines.push(``);
    lines.push(`Retrait au café à Chartres (12 Rue des Changes).`);
    lines.push(`Merci !`);
    return lines.join("\n");
  }, [product, selectedPortion, selectedOptions, removedIngredients, requestedDate, customerNote, totalPrice]);

  const primaryCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyDock, setShowStickyDock] = useState<boolean>(false);
  const [isFooterVisible, setIsFooterVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!primaryCtaRef.current) return;
    const observer = new IntersectionObserver(([entry]) => { setShowStickyDock(!entry.isIntersecting); }, { threshold: 0 });
    observer.observe(primaryCtaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleFooterPosition = () => {
      const footerElement = document.querySelector("footer");
      if (!footerElement) return;
      const footerTop = footerElement.getBoundingClientRect().top;
      if (footerTop < window.innerHeight) setIsFooterVisible(true);
      else setIsFooterVisible(false);
    };
    window.addEventListener("scroll", handleFooterPosition, { passive: true });
    handleFooterPosition();
    return () => window.removeEventListener("scroll", handleFooterPosition);
  }, []);

  return (
    <div className="bg-[#F6F3EE] min-h-screen pt-24 sm:pt-32 pb-24 selection:bg-brown selection:text-cream-light font-sans relative">
      <div className="w-full max-w-[1160px] mx-auto px-5 sm:px-6 md:px-8">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)] gap-8 lg:gap-[56px] items-start">
          
          {/* MOBILE BACK LINK */}
          <div className="block lg:hidden mb-4">
            <Link
              href="/gateaux"
              className="inline-flex items-center gap-2 font-sans text-[13px] uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au catalogue</span>
            </Link>
          </div>

          {/* LEFT: IMAGE */}
          <div className="w-full h-[400px] lg:h-[560px] relative rounded-[16px] overflow-hidden">
            <Image
              src={product.image || "/images/home/product-medovik.jpg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
          </div>

          {/* RIGHT: INFO COLUMN */}
          <div className="flex flex-col">
            
            {/* DESKTOP BACK LINK */}
            <div className="hidden lg:block">
              <Link
                href="/gateaux"
                className="inline-flex items-center gap-2 font-sans text-[13px] uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour au catalogue</span>
              </Link>
            </div>

            <h1 className="font-serif text-[36px] sm:text-[40px] lg:text-[48px] leading-[1.05] text-ink font-normal uppercase tracking-wide mt-4 lg:mt-7">
              {product.name}
            </h1>

            <p className="max-w-[360px] font-sans text-[15px] sm:text-[16px] text-ink-muted leading-[1.6] line-clamp-3 mt-4 lg:mt-6">
              {product.subtitle}
            </p>

            <p className="font-serif text-[30px] sm:text-[34px] text-ink font-medium mt-6 lg:mt-8">
              À partir de {product.priceFrom} €
            </p>

            <p className="font-sans text-[13px] sm:text-[14px] text-ink-muted uppercase tracking-wider mt-1">
              Dès {product.portionOptions[0]?.value || 6} personnes · préparation 48h
            </p>

            <div ref={primaryCtaRef} className="mt-6 lg:mt-7 w-full">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-full h-[54px] bg-[#1A1A1A] text-[#F6F3EE] hover:bg-black font-sans text-[13px] font-medium uppercase tracking-wider transition-colors flex items-center justify-center cursor-pointer"
              >
                Personnaliser & commander
              </button>
            </div>

            <div className="mt-[14px] text-[12px] sm:text-[13px] font-sans text-ink-muted leading-snug">
              Retrait au café à Chartres<br />
              Pas de livraison
            </div>
          </div>
        </section>

        {/* COMPOSITION SECTION */}
        <section className="mt-[80px]">
          <h2 className="font-serif text-[34px] sm:text-[38px] uppercase tracking-widest text-ink mb-10 text-left">
            Ce qu&apos;il y a à l&apos;intérieur
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 lg:gap-[64px] items-start">
            <div className="relative w-full aspect-square lg:aspect-[4/3]">
              <Image
                src={product.explodedImage || "/images/products/medovik-exploded.jpg"}
                alt={`Composition de ${product.name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain"
              />
            </div>

            <div className="flex flex-col space-y-6">
              {(product.ingredientCards || []).map((card, idx) => (
                <React.Fragment key={card.title}>
                  <div>
                    <h3 className="font-sans text-[12px] uppercase tracking-widest text-ink mb-2">
                      {card.title}
                    </h3>
                    <p className="font-serif text-[15px] sm:text-[17px] text-ink-muted leading-relaxed">
                      {card.items.join(" • ")}
                    </p>
                  </div>
                  {idx < (product.ingredientCards || []).length - 1 && (
                    <hr className="border-t border-sand/40" />
                  )}
                </React.Fragment>
              ))}
              
              {/* Fallback */}
              {(!product.ingredientCards || product.ingredientCards.length === 0) && (
                <div>
                  <h3 className="font-sans text-[12px] uppercase tracking-widest text-ink mb-2">
                    Composition
                  </h3>
                  <p className="font-serif text-[15px] sm:text-[17px] text-ink-muted leading-relaxed">
                    {product.explodedLayers?.map(l => l.label).join(" • ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* INGREDIENTS + ALLERGENS SECTION */}
        <section className="mt-[72px] border-t border-sand/40 pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h3 className="font-sans text-[12px] uppercase tracking-widest text-ink mb-3">
                Ingrédients
              </h3>
              <p className="font-serif text-[14px] sm:text-[15px] text-ink-muted leading-relaxed">
                {product.fixedIngredients?.join(" • ") || "Farine de blé, beurre AOP, œufs frais, sucre, lait entier, vanille Bourbon."}
              </p>
            </div>
            <div>
              <h3 className="font-sans text-[12px] uppercase tracking-widest text-ink mb-3">
                Allergènes
              </h3>
              <p className="font-serif text-[14px] sm:text-[15px] text-ink-muted leading-relaxed">
                {product.allergens?.join(" • ") || "Gluten (blé) • Lait / Beurre • Œufs"}
              </p>
            </div>
          </div>
        </section>

        {/* DESCRIPTION SECTION */}
        <section className="mt-[72px] pb-10">
          <p className="max-w-[680px] font-serif text-[16px] sm:text-[17px] text-ink leading-[1.6] line-clamp-4">
            {product.description || "Un équilibre parfait entre croustillant et douceur fondante, confectionné artisanalement avec soin pour accompagner vos moments précieux."}
          </p>
        </section>

      </div>

      {/* FLOATING ORDER CTA */}
      {showStickyDock && !isDrawerOpen && (
        <div className={`fixed right-4 left-4 sm:left-auto sm:right-6 bottom-6 z-40 transition-all duration-300 pointer-events-auto ${isFooterVisible ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full sm:w-[340px] h-[56px] rounded-full bg-[#1A1A1A] text-[#F6F3EE] hover:bg-black font-sans text-[12px] sm:text-[13px] font-medium uppercase tracking-wider flex items-center justify-between px-5 sm:px-6 shadow-xl cursor-pointer"
          >
            <span className="truncate mr-4">{product.name} · dès {product.priceFrom} €</span>
            <span className="shrink-0">Personnaliser →</span>
          </button>
        </div>
      )}

      {/* CONFIGURATOR DRAWER */}
      <ProductConfiguratorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={product}
        selectedPortion={selectedPortion}
        setSelectedPortion={setSelectedPortion}
        selectedOptions={selectedOptions}
        handleOptionChange={handleOptionChange}
        removedIngredients={removedIngredients}
        handleToggleRemove={handleToggleRemove}
        requestedDate={requestedDate}
        setRequestedDate={setRequestedDate}
        customerNote={customerNote}
        setCustomerNote={setCustomerNote}
        totalPrice={totalPrice}
        whatsappMessage={whatsappMessage}
      />
    </div>
  );
}
