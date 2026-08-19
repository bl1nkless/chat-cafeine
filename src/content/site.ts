export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Chat Caféiné",
  url: "https://chatcafeine.fr",
  tagline: "Pâtisserie artisanale & café de spécialité à Chartres",
  shortDescription:
    "Des gâteaux faits maison pour les moments qui comptent. Retrait au café à Chartres uniquement.",
  address: {
    street: "12 Rue des Changes",
    city: "Chartres",
    postalCode: "28000",
    country: "France",
    full: "12 Rue des Changes, 28000 Chartres",
    googleMapsUrl: "https://maps.google.com/?q=Chartres+France",
  },
  contact: {
    phone: "+33 6 00 00 00 00",
    whatsappPhone: "33600000000", // International format without + or spaces for wa.me
    whatsappUrl: "https://wa.me/33600000000",
    email: "bonjour@chatcafeine.fr",
    instagram: "https://instagram.com/chatcafeine",
  },
  hours: [
    { days: "Mardi – Vendredi", hours: "08:30 – 18:30" },
    { days: "Samedi", hours: "09:00 – 19:00" },
    { days: "Dimanche – Lundi", hours: "Fermé" },
  ],
  pickupNotice: "Retrait au café à Chartres uniquement. Pas de livraison.",
  navigation: [
    { label: "À propos", href: "/a-propos" },
    { label: "Menu", href: "/menu" },
    { label: "Gâteaux sur commande", href: "/gateaux" },
    { label: "Commande & retrait", href: "/commande-retrait" },
    { label: "Contact", href: "/contact" },
  ] as NavItem[],
};
