import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PickupBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "inline" | "prominent" | "pill";
  className?: string;
}

export function PickupBadge({
  variant = "inline",
  className,
  ...props
}: PickupBadgeProps) {
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm/80 border border-sand/50 text-[11px] sm:text-xs text-ink font-sans tracking-wide max-w-full truncate",
          className
        )}
        {...props}
      >
        <MapPin className="w-3.5 h-3.5 text-brown shrink-0" />
        <span className="truncate">Retrait à Chartres · Pas de livraison</span>
      </div>
    );
  }

  if (variant === "prominent") {
    return (
      <div
        className={cn(
          "p-4 rounded-xl bg-warm/40 border border-sand/50 text-sm text-ink font-sans flex items-start gap-3",
          className
        )}
        {...props}
      >
        <MapPin className="w-4 h-4 text-brown shrink-0 mt-0.5" />
        <div>
          <strong className="font-medium text-ink block">Retrait au café à Chartres uniquement</strong>
          <span className="text-ink-muted text-xs">
            Tous nos gâteaux sont faits main et à récupérer sur place au 12 Rue des Changes. Pas de livraison.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-ink-muted font-sans",
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-brown inline-block shrink-0" />
      <span>Sur commande · Retrait au café à Chartres</span>
    </div>
  );
}
