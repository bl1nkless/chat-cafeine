import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chatcafeine.fr"),
  title: {
    template: "%s | Chat Caféiné — Pâtisserie à Chartres",
    default: "Chat Caféiné | Pâtisserie artisanale & Café à Chartres",
  },
  description:
    "Pâtisserie artisanale et café de spécialité à Chartres. Gâteaux faits maison sur commande : Médovik, Napoléon, Cheesecakes. Retrait au café uniquement.",
  keywords: [
    "pâtisserie Chartres",
    "gâteaux sur commande Chartres",
    "médovik Chartres",
    "napoléon pâtisserie",
    "café Chartres",
    "fait maison",
  ],
  authors: [{ name: "Chat Caféiné" }],
  openGraph: {
    title: "Chat Caféiné | Pâtisserie artisanale & Café à Chartres",
    description:
      "Des gâteaux faits maison pour les moments qui comptent. Retrait au café à Chartres uniquement.",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F3EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-ink antialiased selection:bg-brown selection:text-cream-light">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
