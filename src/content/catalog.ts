export interface CatalogProduct {
  slug: string;
  name: string;
  category: "gateaux" | "cheesecakes" | "patisseries" | "viennoiseries" | "confiseries";
  subtitle: string;
  priceFrom: number;
  portions: string;
  image: string;
  badge?: "Populaire" | "Saisonnier";
}

export const catalogCategories = [
  { id: "all", label: "Tous les desserts" },
  { id: "gateaux", label: "Gâteaux" },
  { id: "cheesecakes", label: "Cheesecakes" },
  { id: "patisseries", label: "Pâtisseries" },
  { id: "viennoiseries", label: "Viennoiseries" },
  { id: "confiseries", label: "Confiseries" },
] as const;

export const catalogProducts: CatalogProduct[] = [
  {
    slug: "medovik",
    name: "Médovik",
    category: "gateaux",
    subtitle: "Gâteau au miel traditionnel & crème légère à la vanille",
    priceFrom: 38,
    portions: "6 à 10 parts",
    image: "/images/home/product-medovik.jpg",
  },
  {
    slug: "napoleon",
    name: "Napoléon",
    category: "gateaux",
    subtitle: "Feuilletage maison pur beurre & crème diplomate onctueuse",
    priceFrom: 42,
    portions: "6 à 10 parts",
    image: "/images/home/product-napoleon.jpg",
  },
  {
    slug: "gateau-signature",
    name: "Gâteau Signature",
    category: "gateaux",
    subtitle: "Meringue noisette, ganache chocolat & éclats torréfiés",
    priceFrom: 44,
    portions: "6 à 10 parts",
    image: "/images/home/product-kyiv.jpg",
  },
  {
    slug: "cheesecake-fruits-rouges",
    name: "Cheesecake Framboise",
    category: "cheesecakes",
    subtitle: "Sablé croustillant au beurre & coulis de fruits rouges frais",
    priceFrom: 36,
    portions: "6 à 8 parts",
    image: "/images/home/product-cheesecake.jpg",
  },
  {
    slug: "roules-cannelle",
    name: "Roulés Cannelle",
    category: "viennoiseries",
    subtitle: "Brioche roulée ultra-moelleuse & glaçage vanille Bourbon",
    priceFrom: 24,
    portions: "Boîte de 6 pièces",
    image: "/images/home/product-cinnabon.jpg",
  },
  {
    slug: "tartelettes-fruits",
    name: "Tartelettes aux Fruits",
    category: "patisseries",
    subtitle: "Pâte sablée pur beurre, crème pâtissière & baies fraîches",
    priceFrom: 28,
    portions: "Boîte de 4 pièces",
    image: "/images/home/product-tartelette.jpg",
  },
  {
    slug: "pavlova-fruits-rouges",
    name: "Pavlova Fruits Rouges",
    category: "patisseries",
    subtitle: "Meringue française craquante, crème fouettée & fruits de saison",
    priceFrom: 35,
    portions: "6 à 8 parts",
    image: "/images/home/about-patissiere-cake.jpg",
  },
  {
    slug: "confiseries-maison",
    name: "Coffret Douceurs & Biscuits",
    category: "confiseries",
    subtitle: "Sélection de biscuits artisanaux pur beurre & douceurs maison",
    priceFrom: 18,
    portions: "1 coffret dégustation",
    image: "/images/home/product-cinnabon.jpg",
  },
];
