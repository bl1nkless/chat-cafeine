export type ProductCategory =
  | "gateaux"
  | "cheesecakes"
  | "patisseries"
  | "viennoiseries"
  | "confiseries";

export type ProductBadge = "Populaire" | "Saisonnier" | "Sur commande";

export interface Ingredient {
  name: string;
  isMain?: boolean;
}

export interface CakeLayer {
  id: string;
  label: string;
  description?: string;
  image?: string;
}

export interface ProductOptionChoice {
  id: string;
  label: string;
  priceDelta?: number;
}

export interface ProductOption {
  id: string;
  label: string;
  type: "single" | "multiple";
  choices: ProductOptionChoice[];
}

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  priceFrom?: number;
  portions: number[];
  leadTime: {
    minHours: number;
    maxHours?: number;
  };
  images: {
    card: string;
    hero: string;
    cut?: string;
    gallery?: string[];
  };
  ingredients: Ingredient[];
  allergens: string[];
  layers?: CakeLayer[];
  options?: ProductOption[];
  badges?: ProductBadge[];
  featured?: boolean;
  seasonal?: boolean;
  compositionAnimation?: boolean;
}

export interface CategoryInfo {
  id: ProductCategory | "tous";
  label: string;
  description?: string;
}
