import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-ink min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center pt-20">
      {/* Background Photography with High Priority */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/home/hero-cafe-counter.jpg"
          alt="Chat Caféiné — Pâtisserie artisanale et café à Chartres"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[center_30%]"
        />
        {/* Editorial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 sm:from-black/80 sm:via-black/40 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 sm:hidden" />
      </div>

      {/* Hero Content matching exact reference composition */}
      <Container size="wide" className="relative z-10 py-16 sm:py-24 lg:py-28">
        <div className="max-w-2xl text-left space-y-6 sm:space-y-8">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-white font-normal leading-[1.18] tracking-tight">
            Des gâteaux faits maison <br />
            et du bon café — <br />
            <span className="italic font-light text-warm">comme pour les siens.</span>
          </h1>

          <div className="pt-2">
            <Link
              href="/gateaux"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#F6F3EE] text-ink font-sans text-sm font-medium tracking-wide shadow-md hover:bg-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Découvrir nos gâteaux
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
