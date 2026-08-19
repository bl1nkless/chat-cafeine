import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { CatMascot } from "@/components/mascot/CatMascot";

export const metadata = {
  title: "Menu du Café",
  description: "Pâtisseries maison, cafés de spécialité et boissons fraîches au café Chat Caféiné à Chartres.",
};

const dailyPastries = [
  {
    name: "Napoléon",
    price: "5,50 €",
    image: "/images/home/product-napoleon.jpg",
    slug: "napoleon",
  },
  {
    name: "Médovik",
    price: "5,50 €",
    image: "/images/home/product-medovik.jpg",
    slug: "medovik",
  },
  {
    name: "Cheesecake Framboise",
    price: "5,20 €",
    image: "/images/home/product-cheesecake.jpg",
    slug: "cheesecakes",
  },
  {
    name: "Cinnabon Cannelle",
    price: "4,20 €",
    image: "/images/home/product-cinnabon.jpg",
    slug: "roules-cannelle",
  },
];

const coffeeList = [
  { name: "Espresso", price: "2,20 €" },
  { name: "Double Espresso", price: "3,20 €" },
  { name: "Allongé / Americano", price: "2,50 €" },
  { name: "Cappuccino", price: "4,20 €" },
  { name: "Flat White", price: "4,50 €" },
  { name: "Latte Pâtissier (sirop vanille maison)", price: "4,80 €" },
];

const beverageList = [
  { name: "Iced Latte / Café Glacé", price: "4,80 €" },
  { name: "Limonade Artisanale au Citron", price: "3,90 €" },
  { name: "Jus de Fruits Pressés du Jour", price: "4,20 €" },
  { name: "Chocolat Chaud Maison (chocolat noir 70%)", price: "4,50 €" },
  { name: "Thés & Infusions Bio de Sélection", price: "3,80 €" },
];

export default function MenuPage() {
  return (
    <div className="bg-[#F6F3EE] min-h-screen">
      {/* SECTION 1 — VISUAL HERO (45-55vh) */}
      <section className="relative w-full h-[48vh] min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] flex items-center justify-center overflow-hidden bg-ink pt-16">
        <Image
          src="/images/home/hero-cafe-counter.jpg"
          alt="Comptoir du café Chat Caféiné à Chartres"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/40" />

        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto space-y-3 pb-6">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal uppercase tracking-widest leading-tight">
            Menu du Café
          </h1>
          <p className="font-sans text-xs sm:text-sm text-cream/90 font-light tracking-wide">
            Pâtisseries maison · café · boissons
          </p>
          <p className="text-[11px] font-sans text-cream/70 uppercase tracking-[0.2em] font-light pt-1">
            Sur place · À emporter
          </p>
        </div>
      </section>

      {/* SECTION 2 — AUJOURD'HUI AU CAFÉ (Intentional 28px Overlap Transition) */}
      <section className="-mt-7 relative z-20 rounded-t-[32px] sm:rounded-t-[40px] bg-[#F6F3EE] pt-12 sm:pt-16 pb-14 sm:pb-20 border-b border-sand/30">
        <Container size="wide">
          <div className="space-y-10 sm:space-y-12">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal uppercase tracking-widest">
                Aujourd’hui au Café
              </h2>
              <OrnamentDivider className="w-20" />
            </div>

            {/* 4 Food Items Grid (Large Photo Dominant, Name + Price only) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {dailyPastries.map((item) => (
                <div key={item.name} className="group flex flex-col space-y-3">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xs border border-sand/40 bg-warm/30">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-baseline justify-between px-1">
                    <span className="font-serif text-base sm:text-lg text-ink font-normal">
                      {item.name}
                    </span>
                    <span className="font-sans text-xs sm:text-sm font-medium text-ink tabular-nums">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 3 — CAFÉS (Two-Column: Left List, Right Vertical Coffee Photo) */}
      <section className="py-14 sm:py-20 border-b border-sand/30">
        <Container size="wide">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center max-w-5xl mx-auto">
            {/* Left Menu List */}
            <div className="md:col-span-7 space-y-6">
              <div className="border-b border-ink/20 pb-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal uppercase tracking-widest">
                  Cafés
                </h2>
              </div>

              <div className="divide-y divide-sand/40">
                {coffeeList.map((item) => (
                  <div key={item.name} className="py-3 flex items-baseline justify-between gap-4">
                    <span className="font-serif text-sm sm:text-base text-ink font-normal">
                      {item.name}
                    </span>
                    <span className="font-sans text-xs sm:text-sm font-medium text-ink tabular-nums shrink-0">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Vertical Coffee Photo */}
            <div className="md:col-span-5">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xs border border-sand/40 bg-warm/30">
                <Image
                  src="/images/home/menu-coffee-vertical.jpg"
                  alt="Cappuccino artisanal et ambiance café"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 4 — BOISSONS (Reversed Two-Column: Left Photo, Right List) */}
      <section className="py-14 sm:py-20 border-b border-sand/30">
        <Container size="wide">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center max-w-5xl mx-auto">
            {/* Left Vertical Beverage Photo */}
            <div className="md:col-span-5 order-2 md:order-1">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xs border border-sand/40 bg-warm/30">
                <Image
                  src="/images/home/menu-beverage-vertical.jpg"
                  alt="Limonade artisanale fraîche et boissons maison"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Right Menu List */}
            <div className="md:col-span-7 space-y-6 order-1 md:order-2">
              <div className="border-b border-ink/20 pb-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal uppercase tracking-widest">
                  Boissons
                </h2>
              </div>

              <div className="divide-y divide-sand/40">
                {beverageList.map((item) => (
                  <div key={item.name} className="py-3 flex items-baseline justify-between gap-4">
                    <span className="font-serif text-sm sm:text-base text-ink font-normal">
                      {item.name}
                    </span>
                    <span className="font-sans text-xs sm:text-sm font-medium text-ink tabular-nums shrink-0">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 5 — SEASONAL / HANDMADE NOTE WITH PROMINENT CAT MASCOT */}
      <section className="py-16 sm:py-24">
        <Container size="wide">
          <div className="max-w-3xl mx-auto rounded-3xl bg-[#EBE3D5] border border-[#DFD5C4] p-8 sm:p-12 text-center space-y-6 shadow-xs">
            <div className="flex justify-center">
              <CatMascot pose="walk" size="xl" className="opacity-95" />
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-xl sm:text-2xl text-ink font-normal uppercase tracking-widest">
                Fait Maison
              </h3>
              <p className="font-serif italic text-sm sm:text-base text-ink/90 leading-relaxed max-w-lg mx-auto">
                Nos pâtisseries changent selon les jours et les saisons. <br />
                Le catalogue des gâteaux sur commande reste disponible à l’avance.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/gateaux"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium text-ink hover:text-brown transition-colors group"
              >
                <span>Voir les gâteaux sur commande</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
