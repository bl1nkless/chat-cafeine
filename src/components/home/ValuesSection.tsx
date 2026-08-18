import React from "react";
import { Container } from "@/components/ui/Container";
import { CatMascot } from "@/components/mascot/CatMascot";

function BotanicalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 4 C10 10, 8 18, 16 28 C24 18, 22 10, 16 4 Z" />
      <path d="M16 10 L16 26" />
      <path d="M12 16 Q16 14 16 14" />
      <path d="M20 18 Q16 16 16 16" />
    </svg>
  );
}

function WhiskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="10" />
      <path d="M16 6 C12 10, 12 22, 16 26 C20 22, 20 10, 16 6 Z" />
      <path d="M6 16 C10 12, 22 12, 26 16 C22 20, 10 20, 6 16 Z" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

function PurityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 6 L19 12 L26 13 L21 18 L22 25 L16 22 L10 25 L11 18 L6 13 L13 12 Z" />
      <circle cx="16" cy="15" r="3" />
    </svg>
  );
}

function FamilyCareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 8 C14 5, 9 5, 8 9 C7 14, 16 23, 16 23 C16 23, 25 14, 24 9 C23 5, 18 5, 16 8 Z" />
      <path d="M11 26 L21 26" />
    </svg>
  );
}

const values = [
  {
    icon: BotanicalIcon,
    title: "PRODUITS NATURELS",
    description: "Ingrédients frais, nobles et de haute qualité sélectionnés avec rigueur.",
  },
  {
    icon: WhiskIcon,
    title: "FAIT MAIN",
    description: "Tous nos gâteaux sont confectionnés artisanalement, sans aucun produit semi-fini.",
  },
  {
    icon: PurityIcon,
    title: "COMPOSITION SAINE",
    description: "Pur beurre doux 82%. Aucune margarine, aucun conservateur ni additif artificiel.",
  },
  {
    icon: FamilyCareIcon,
    title: "COMME POUR LES SIENS",
    description: "Préparé avec la même bienveillance et générosité que pour notre propre famille.",
  },
];

export function ValuesSection() {
  return (
    <section className="py-14 sm:py-20 bg-[#F6F3EE] border-b border-sand/30 relative">
      <Container size="wide">
        <div className="space-y-10 sm:space-y-14">
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal uppercase tracking-widest">
              Nos Valeurs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 text-center">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="flex flex-col items-center space-y-3.5 px-2">
                  <div className="text-ink/80 flex items-center justify-center h-10 w-10">
                    <Icon className="w-8 h-8 stroke-[1.2]" />
                  </div>
                  <h3 className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-ink">
                    {v.title}
                  </h3>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed max-w-[220px] font-light">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Walking Cat Silhouette precisely matching the reference placement */}
          <div className="flex justify-end pr-6 sm:pr-16 pt-2">
            <CatMascot pose="walk" size="lg" className="opacity-95" />
          </div>
        </div>
      </Container>
    </section>
  );
}
