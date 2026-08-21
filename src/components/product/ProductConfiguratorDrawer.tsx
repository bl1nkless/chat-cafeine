"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Check, Calendar, MessageSquare, ShieldCheck, MessageCircle } from "lucide-react";
import { siteConfig } from "@/content/site";
import type { CatalogProduct } from "@/content/catalog";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// A simple utility to track events, respecting the constraint to not send PII or message content.
const trackAnalyticsEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window !== "undefined") {
    if (window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...params });
    } else {
      console.log(`[Analytics] Event: ${eventName}`, params);
    }
  }
};

export interface ProductConfiguratorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: CatalogProduct;
  selectedPortion: number;
  setSelectedPortion: (portion: number) => void;
  selectedOptions: Record<string, string>;
  handleOptionChange: (groupId: string, optionId: string) => void;
  removedIngredients: string[];
  handleToggleRemove: (id: string) => void;
  requestedDate: string;
  setRequestedDate: (date: string) => void;
  customerNote: string;
  setCustomerNote: (note: string) => void;
  totalPrice: number;
  whatsappMessage: string;
}

export function ProductConfiguratorDrawer({
  isOpen,
  onClose,
  product,
  selectedPortion,
  setSelectedPortion,
  selectedOptions,
  handleOptionChange,
  removedIngredients,
  handleToggleRemove,
  requestedDate,
  setRequestedDate,
  customerNote,
  setCustomerNote,
  totalPrice,
  whatsappMessage,
}: ProductConfiguratorDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Track Analytics when modal opens
  useEffect(() => {
    if (isOpen) {
      trackAnalyticsEvent("product_configurator_open", { product_id: product.slug });
    }
  }, [isOpen, product.slug]);

  // Handle Focus Trap, Escape Key, and Body Scroll
  useEffect(() => {
    if (isOpen) {
      // Save the element that triggered the modal to return focus later
      triggerElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      
      // Delay slightly to ensure elements are rendered before focusing
      setTimeout(() => {
        const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }
        
        if (e.key === "Tab") {
          if (!drawerRef.current) return;
          const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ));
          if (focusable.length === 0) return;
          
          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown);
        
        // Return focus to trigger element when closing
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fruitGroup = product.optionGroups?.find((g) => g.id === "fruits");
  const decorationGroup = product.optionGroups?.find((g) => g.id === "decoration");

  const cleanPhone = (siteConfig.contact.whatsappPhone || "33600000000").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const handleWhatsAppClick = () => {
    trackAnalyticsEvent("whatsapp_order_click", { 
      product_id: product.slug, 
      total_price: totalPrice 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-12">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 hidden md:block"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative z-50 w-full md:max-w-[1000px] h-[100dvh] md:h-auto md:max-h-[85vh] bg-[#F6F3EE] md:rounded-[20px] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in md:zoom-in-95 slide-in-from-bottom-full md:slide-in-from-bottom-0 duration-300"
      >
        
        {/* Close Button (Absolute on Desktop, Fixed to top on Mobile) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-sand/40 flex items-center justify-center text-ink transition-colors cursor-pointer shadow-sm"
          aria-label="Fermer le configurateur"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Fixed Image (Hidden on small mobile, or shown small) */}
        <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-warm/30 relative flex-col items-center justify-center p-8 border-r border-sand/40" aria-hidden="true">
          <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 0vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="mt-6 text-center space-y-1">
            <h2 id="drawer-title-desktop" className="font-serif text-2xl text-ink font-normal uppercase tracking-wide">
              {product.name}
            </h2>
            <p className="font-serif italic text-sm text-ink-muted leading-snug">
              {product.subtitle}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Scrolling Form */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {/* Mobile Header (Only visible on small screens) */}
          <div className="md:hidden px-6 py-5 border-b border-sand/40 bg-white shrink-0 pr-16">
            <h2 id="drawer-title" className="font-serif text-xl text-ink font-normal uppercase tracking-wide">
              {product.name}
            </h2>
            <p className="text-xs text-ink-muted font-sans font-light mt-1">Personnalisation de la commande</p>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8 space-y-10">
            
            {/* TAILLE */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-sans font-semibold uppercase tracking-widest text-ink">
                1. Choisissez la taille
              </h3>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Taille de la portion">
                {product.portionOptions.map((opt) => {
                  const isSelected = selectedPortion === opt.value;
                  return (
                    <button
                      key={opt.value}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedPortion(opt.value)}
                      className={`p-4 rounded-xl text-center transition-all cursor-pointer select-none border flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-ink text-cream border-ink shadow-sm"
                          : "bg-white text-ink hover:bg-warm/30 border-sand/40 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1"
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wider font-sans font-medium">
                        {opt.label}
                      </span>
                      <span className={`font-serif text-lg font-normal ${isSelected ? "text-cream" : "text-ink"}`}>
                        {opt.price} €
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FRUITS */}
            {fruitGroup && (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[13px] font-sans font-semibold uppercase tracking-widest text-ink">
                    2. {fruitGroup.label}
                  </h3>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider">Optionnel</span>
                </div>
                <div className="space-y-2.5" role="radiogroup" aria-label={fruitGroup.label}>
                  {fruitGroup.options.map((opt) => {
                    const isSelected = selectedOptions["fruits"] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleOptionChange("fruits", opt.id)}
                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer select-none border text-left ${
                          isSelected
                            ? "bg-ink text-cream border-ink shadow-sm"
                            : "bg-white text-ink hover:bg-warm/30 border-sand/40 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-cream bg-cream" : "border-ink/30 bg-white"
                            }`}
                            aria-hidden="true"
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-ink" />}
                          </span>
                          <span className="text-[13px] font-sans font-medium">{opt.label}</span>
                        </div>
                        <span className={`text-[13px] font-sans font-medium tabular-nums ${isSelected ? "text-cream" : "text-ink-muted"}`}>
                          {opt.priceDelta === 0 ? "Inclus" : `+${opt.priceDelta} €`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FINITION */}
            {decorationGroup && (
              <div className="space-y-4">
                <h3 className="text-[13px] font-sans font-semibold uppercase tracking-widest text-ink">
                  3. {decorationGroup.label}
                </h3>
                <div className="space-y-2.5" role="radiogroup" aria-label={decorationGroup.label}>
                  {decorationGroup.options.map((opt) => {
                    const isSelected = selectedOptions["decoration"] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleOptionChange("decoration", opt.id)}
                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer select-none border text-left ${
                          isSelected
                            ? "bg-ink text-cream border-ink shadow-sm"
                            : "bg-white text-ink hover:bg-warm/30 border-sand/40 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-cream bg-cream" : "border-ink/30 bg-white"
                            }`}
                            aria-hidden="true"
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-ink" />}
                          </span>
                          <span className="text-[13px] font-sans font-medium">{opt.label}</span>
                        </div>
                        <span className={`text-[13px] font-sans font-medium tabular-nums ${isSelected ? "text-cream" : "text-ink-muted"}`}>
                          {opt.priceDelta === 0 ? "Inclus" : `+${opt.priceDelta} €`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REMOVABLES */}
            {product.removableIngredients && product.removableIngredients.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[13px] font-sans font-semibold uppercase tracking-widest text-ink">
                    4. À retirer
                  </h3>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider">Optionnel</span>
                </div>
                <div className="space-y-2" role="group" aria-label="Ingrédients à retirer">
                  {product.removableIngredients.map((item) => {
                    const isChecked = removedIngredients.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => handleToggleRemove(item.id)}
                        className={`w-full p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer select-none border text-left ${
                          isChecked
                            ? "bg-brown/10 border-brown text-ink font-medium"
                            : "bg-white text-ink hover:bg-warm/30 border-sand/40 font-normal focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? "bg-ink border-ink text-cream" : "border-ink/30 bg-white"
                            }`}
                            aria-hidden="true"
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </span>
                          <span className="text-[13px] font-sans">Retirer : {item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-start gap-2 text-[11px] text-ink-muted font-sans font-light pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brown shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    La recette de base ({product.fixedIngredients.slice(0, 3).join(", ")}) est garantie 100% naturelle et ne peut être altérée.
                  </span>
                </div>
              </div>
            )}

            {/* DATE ET NOTE */}
            <div className="space-y-6 pt-4 border-t border-sand/40">
              <div className="space-y-2">
                <label htmlFor="order-date" className="text-[13px] font-sans font-semibold uppercase tracking-widest text-ink flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brown" aria-hidden="true" />
                  <span>Date de retrait</span>
                </label>
                <input
                  id="order-date"
                  type="date"
                  min={tomorrowStr}
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-sand/40 text-[13px] font-sans text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1 cursor-pointer shadow-sm transition-colors"
                />
                <p className="text-[11px] text-ink-muted font-light">Minimum 24h à 48h à l’avance</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="order-note" className="text-[13px] font-sans font-semibold uppercase tracking-widest text-ink flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brown" aria-hidden="true" />
                  <span>Note (facultatif)</span>
                </label>
                <textarea
                  id="order-note"
                  rows={2}
                  placeholder="Anniversaire, personnalisation..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-sand/40 text-[13px] font-sans text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1 shadow-sm transition-colors resize-none"
                />
              </div>
            </div>

          </div>

          {/* Bottom Sticky Footer Area */}
          <div className="p-6 bg-[#F6F3EE] border-t border-sand/40 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div aria-live="polite" aria-atomic="true">
                <p className="text-[11px] uppercase tracking-wider text-ink-muted mb-0.5">Prix estimé</p>
                <p className="font-serif text-2xl text-ink font-normal leading-none">{totalPrice} €</p>
              </div>

              <a
                href={whatsappUrl}
                onClick={handleWhatsAppClick}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ink text-cream hover:bg-black text-[13px] uppercase tracking-wider font-medium transition-all shadow-md shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Commander</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
