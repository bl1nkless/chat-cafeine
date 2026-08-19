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
    <div className="py-6 sm:py-10 bg-[#F6F3EE] min-h-screen font-sans text-ink">
      {/* Target container ~1100-1180px */}
      <div className="mx-auto w-full max-w-[1140px] px-4 md:px-8 space-y-16 sm:space-y-24">
        
        {/* SECTION 1 — PRODUCT HERO */}
        <section className="flex flex-col lg:flex-row gap-10 lg:gap-14 xl:gap-16 items-start">
          {/* LEFT: Image (56-60%) */}
          <div className="w-full lg:w-[58%] shrink-0 relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-[16px] overflow-hidden bg-warm/30 border border-sand/40 shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          {/* RIGHT: Product Information (40-44%) */}
          <div className="w-full lg:w-[42%] flex flex-col pt-2 sm:pt-6">
            <Link
              href="/gateaux"
              className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] uppercase tracking-widest text-ink-muted hover:text-ink transition-colors group mb-6 sm:mb-8"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Retour au catalogue</span>
            </Link>

            <h1 className="font-serif text-[32px] leading-[1.1] sm:text-4xl md:text-5xl text-ink font-normal uppercase tracking-wide mb-4 sm:mb-6">
              {product.name}
            </h1>

            <p className="font-serif text-base sm:text-lg text-ink-muted leading-relaxed mb-6 sm:mb-8">
              {product.subtitle}
            </p>

            <div className="space-y-1 mb-6 sm:mb-8">
              <p className="font-serif text-xl sm:text-2xl text-ink font-medium">
                À partir de {product.priceFrom} €
              </p>
              <p className="font-sans text-[11px] sm:text-[13px] text-ink-muted uppercase tracking-wider">
                Dès {product.portionOptions[0]?.value || 6} personnes • Préparation 48h
              </p>
            </div>

            <div className="mb-6" ref={primaryCtaRef}>
              <Button
                variant="primary"
                onClick={() => setIsDrawerOpen(true)}
                className="w-full bg-ink text-cream hover:bg-black font-medium text-[15px] py-4 rounded-none uppercase tracking-widest transition-colors shadow-xs"
              >
                Personnaliser & commander
              </Button>
            </div>

            <div className="text-[13px] text-ink-muted leading-relaxed">
              <p>Retrait au café à Chartres</p>
              <p>Pas de livraison</p>
            </div>
          </div>
        </section>

        {/* SECTION 2 — COMPOSITION */}
        <section className="space-y-10 sm:space-y-14 overflow-hidden">
          <h2 className="text-center font-serif text-2xl sm:text-3xl uppercase tracking-widest text-ink">
            Ce qu&apos;il y a à l&apos;intérieur
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center max-w-4xl mx-auto">
            {/* LEFT: Animated exploded cake illustration */}
            <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-none group perspective-[1000px]">
              {/* If we have layered images in the future, we could map over them here. 
                  For now we apply a smooth floating/scale hover effect to the static image to simulate 3D life. */}
              <div className="w-full h-full relative transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2">
                <Image
                  src={product.explodedImage || "/images/products/medovik-exploded.jpg"}
                  alt={`Composition de ${product.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            </div>

            {/* RIGHT: ingredient/component descriptions with staggered fade-in */}
            <div className="space-y-0 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-sand/40">
              {(product.ingredientCards || []).map((card, idx) => (
                <div 
                  key={card.title} 
                  className="py-5 pl-6 relative before:absolute before:left-[-3px] before:top-8 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brown/60 last:border-0 hover:before:bg-brown transition-all duration-300 group/item hover:translate-x-1"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <h3 className="font-serif text-[15px] uppercase tracking-widest text-ink mb-2 group-hover/item:text-brown transition-colors">
                    {card.title}
                  </h3>
                  <p className="font-sans text-[14px] text-ink-muted font-light leading-relaxed">
                    {card.items.join(" • ")}
                  </p>
                </div>
              ))}
              
              {/* Fallback */}
              {(!product.ingredientCards || product.ingredientCards.length === 0) && (
                <div className="py-5 pl-6 relative before:absolute before:left-[-3px] before:top-8 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brown/60">
                  <h3 className="font-serif text-[15px] uppercase tracking-widest text-ink mb-2">
                    Composition
                  </h3>
                  <p className="font-sans text-[14px] text-ink-muted font-light leading-relaxed">
                    {product.explodedLayers?.map(l => l.label).join(" • ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3 — PRODUCT FACTS */}
        <section className="py-8 border-y border-sand/40">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4 max-w-4xl mx-auto text-center md:text-left">
            <div className="flex flex-col items-center gap-2 w-[140px]">
              <Users className="w-6 h-6 text-brown stroke-[1.5]" />
              <span className="font-sans text-[13px] text-ink uppercase tracking-wider">Dès {product.portionOptions[0]?.value || 6} pers.</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[140px]">
              <Clock className="w-6 h-6 text-brown stroke-[1.5]" />
              <span className="font-sans text-[13px] text-ink uppercase tracking-wider">48h de préparation</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[140px]">
              <Leaf className="w-6 h-6 text-brown stroke-[1.5]" />
              <span className="font-sans text-[13px] text-ink uppercase tracking-wider">Ingrédients naturels</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[140px]">
              <HeartHandshake className="w-6 h-6 text-brown stroke-[1.5]" />
              <span className="font-sans text-[13px] text-ink uppercase tracking-wider">Fait main</span>
            </div>
          </div>
        </section>

        {/* SECTION 4 — INGREDIENTS / ALLERGENS */}
        <section className="max-w-3xl mx-auto space-y-8 text-center sm:text-left flex flex-col sm:flex-row sm:space-y-0 sm:gap-12 lg:gap-24">
          <div className="flex-1">
            <h3 className="font-serif text-[15px] uppercase tracking-widest text-ink mb-3">
              Ingrédients
            </h3>
            <p className="font-sans text-[14px] text-ink-muted font-light leading-relaxed">
              {product.fixedIngredients?.join(" • ") || "Farine de blé, beurre AOP, œufs frais, sucre, lait entier, vanille Bourbon."}
            </p>
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-[15px] uppercase tracking-widest text-ink mb-3">
              Allergènes
            </h3>
            <p className="font-sans text-[14px] text-ink-muted font-light leading-relaxed">
              {product.allergens?.join(" • ") || "Gluten (blé) • Lait / Beurre • Œufs"}
            </p>
          </div>
        </section>

        {/* SECTION 5 — DESCRIPTION */}
        <section className="max-w-2xl mx-auto pb-10 text-center">
          <p className="font-serif italic text-base sm:text-[17px] text-ink leading-relaxed">
            {product.description || "Un équilibre parfait entre croustillant et douceur fondante, confectionné artisanalement avec soin pour accompagner vos moments précieux."}
          </p>
        </section>

      </div>

      {/* VIEWPORT-FIXED STICKY ORDER DOCK */}
      {showStickyDock && !isDrawerOpen && (
        <>
          <div className={`fixed right-6 bottom-6 z-40 hidden sm:block transition-all duration-300 pointer-events-auto ${isFooterVisible ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <div className="bg-[#F6F3EE] border border-sand/40 shadow-xl rounded-full pl-6 pr-2 py-1.5 flex items-center justify-between gap-6 h-[56px] min-w-[340px]">
              <div className="font-serif text-[15px] text-ink whitespace-nowrap">
                {product.name} · {isConfigured ? `${totalPrice} € estimé` : `dès ${product.priceFrom} €`}
              </div>
              <Button
                variant="primary"
                onClick={() => setIsDrawerOpen(true)}
                className="bg-ink text-cream hover:bg-black text-[13px] font-medium px-5 py-2.5 rounded-full uppercase tracking-wider transition-colors shrink-0"
              >
                {isConfigured ? "Modifier" : "Commander"}
              </Button>
            </div>
          </div>

          <div className={`fixed inset-x-0 bottom-0 z-40 bg-[#F6F3EE]/95 backdrop-blur-md border-t border-sand/50 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lg sm:hidden flex items-center justify-between transition-all duration-300 pointer-events-auto ${isFooterVisible ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <div className="font-serif text-[16px] text-ink">
              Dès {product.priceFrom} €
            </div>
            <Button
              variant="primary"
              onClick={() => setIsDrawerOpen(true)}
              className="bg-ink text-cream hover:bg-black text-[13px] font-medium px-6 py-2.5 rounded-none uppercase tracking-wider"
            >
              Commander
            </Button>
          </div>
        </>
      )}

      {/* PROGRESSIVE DISCLOSURE CONFIGURATOR DRAWER */}
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
