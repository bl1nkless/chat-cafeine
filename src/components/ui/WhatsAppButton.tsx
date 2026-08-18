import React from "react";
import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

export interface WhatsAppButtonProps extends Omit<ButtonProps, "variant"> {
  message?: string;
  label?: string;
}

export function WhatsAppButton({
  href,
  message,
  label = "Commander sur WhatsApp",
  size = "default",
  className,
  children,
  ...props
}: WhatsAppButtonProps) {
  const url =
    href ||
    (message
      ? `https://wa.me/${siteConfig.contact.whatsappPhone}?text=${encodeURIComponent(message)}`
      : siteConfig.contact.whatsappUrl);

  return (
    <Button
      variant="whatsapp"
      size={size}
      href={url}
      className={cn("bg-ink text-cream hover:bg-black font-medium tracking-normal", className)}
      {...props}
    >
      <MessageCircle className="w-3.5 h-3.5 shrink-0 opacity-90 stroke-[2.2]" />
      <span>{children || label}</span>
    </Button>
  );
}
