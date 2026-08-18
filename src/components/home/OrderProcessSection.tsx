import React from "react";
import Image from "next/image";
import { MessageCircle, Calendar, CreditCard, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CatMascot } from "@/components/mascot/CatMascot";

const steps = [
  {
    icon: MessageCircle,
    title: "Écrivez-nous sur WhatsApp",
    description: "Envoyez-nous votre choix de gâteau, vos portions et la date de retrait souhaitée.",
  },
  {
    icon: Calendar,
    title: "Validation des détails",
    description: "Nous convenons ensemble de la faisabilité, de l'horaire et de vos souhaits particuliers.",
  },
  {
    icon: CreditCard,
    title: "Lien de paiement SumUp",
    description: "Vous recevez un lien sécurisé pour régler l'acompte de réservation de votre commande.",
  },
  {
    icon: CheckCircle2,
    title: "Retrait au café à Chartres",
    description: "Après validation de l'acompte, votre gâteau frais du jour vous attend au 12 Rue des Changes.",
  },
];

export function OrderProcessSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F6F3EE]">
      <Container size="wide">
        <div className="space-y-12 sm:space-y-16">
          {/* 4 Steps Section */}
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-normal uppercase tracking-widest">
                Comment Commander
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 text-center">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="flex flex-col items-center space-y-2.5 px-2">
                    <div className="w-10 h-10 rounded-full border border-sand/70 bg-warm/20 flex items-center justify-center text-brown shadow-2xs">
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <h3 className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-ink">
                      {s.title}
                    </h3>
                    <p className="font-sans text-xs text-ink-muted leading-relaxed font-light max-w-[200px]">
                      {s.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Walking Cat Centered */}
            <div className="flex justify-center pt-2">
              <CatMascot pose="walk" size="lg" className="opacity-95" />
            </div>
          </div>

          {/* Philosophy / Quote Card with Resting Cat Photo */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#EBE3D5] border border-[#DFD5C4] p-6 sm:p-8 lg:p-10 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Quote text */}
              <div className="md:col-span-7 space-y-3 text-left">
                <span className="font-serif text-3xl sm:text-4xl text-brown/60 leading-none select-none block">
                  “
                </span>
                <blockquote className="font-serif italic text-sm sm:text-base lg:text-lg text-ink leading-relaxed font-normal">
                  Je ne réalise pas de gâteaux en pâte à sucre ni de décors industriels. Mon style est maison, naturel, élégant. Sans ornements artificiels ni colorants chimiques.
                </blockquote>
                <div className="flex justify-end pr-2">
                  <span className="font-serif text-3xl sm:text-4xl text-brown/60 leading-none select-none">
                    ”
                  </span>
                </div>
              </div>

              {/* Resting Cat Photo Cutout */}
              <div className="md:col-span-5 w-full rounded-xl overflow-hidden shadow-2xs border border-sand/40 bg-warm/20">
                <Image
                  src="/images/home/quote-cat-resting.jpg"
                  alt="Le chat noir paisible de Chat Caféiné"
                  width={600}
                  height={450}
                  loading="eager"
                  className="w-full h-auto object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
