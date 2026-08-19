export interface ExplodedLayer {
  label: string;
  sublabel?: string;
  isFruitLayer?: boolean;
}

export interface IngredientCard {
  title: string;
  image: string;
  items: string[];
}

export interface ProductFact {
  label: string;
  value: string;
}

export interface ProductPortionOption {
  value: number;
  label: string;
  price: number;
}

// ==========================================
// PHASE 8: PHOTOGRAPHY INTEGRATION
//
// Placeholder folder structures have been created in:
// `public/images/products/{slug}/`
//
// Once you have the final photography, save them as:
// - card.webp
// - hero.webp
// - cut.webp
// - detail-01.webp
// - detail-02.webp
//
// Then, update the `image` and `explodedImage` properties below
// to point to the new `.webp` paths.
//
// For now, we are keeping the `.jpg` placeholders so the app
// does not crash with empty file errors.
// ==========================================

export interface CustomisationOption {
  id: string;
  label: string;
  priceDelta: number;
  available?: boolean;
  layerEffect?: string;
}

export interface CustomisationGroup {
  id: "fruits" | "decoration" | "options";
  label: string;
  type: "single" | "multiple";
  required?: boolean;
  options: CustomisationOption[];
}

export interface RemovableIngredient {
  id: string;
  label: string;
}

export interface CatalogProduct {
  slug: string;
  name: string;
  category: "gateaux" | "cheesecakes" | "patisseries" | "viennoiseries" | "confiseries";
  subtitle: string;
  priceFrom: number;
  portions: string;
  image: string;
  explodedImage?: string;
  explodedLayers?: ExplodedLayer[];
  ingredientCards?: IngredientCard[];
  facts?: ProductFact[];
  description?: string;
  optionalAdditionsText?: string;
  seasonalFruitsText?: string;
  fixedIngredients: string[];
  allergens?: string[];
  portionOptions: ProductPortionOption[];
  optionGroups?: CustomisationGroup[];
  removableIngredients?: RemovableIngredient[];
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
    subtitle: "Classique gâteau au miel de forêt caramélisé & crème légère à la vanille Bourbon",
    priceFrom: 38,
    portions: "6 à 12 parts",
    image: "/images/home/product-medovik.jpg",
    explodedImage: "/images/products/medovik-exploded.jpg",
    explodedLayers: [
      { label: "BISCUIT AU MIEL DORÉ" },
      { label: "CRÈME DIPLOMATE (+ FRUITS AU CHOIX)", isFruitLayer: true },
      { label: "BISCUIT AU MIEL DORÉ" },
      { label: "CRÈME DIPLOMATE (+ FRUITS AU CHOIX)", isFruitLayer: true },
      { label: "BISCUIT AU MIEL DORÉ" },
      { label: "CRÈME DIPLOMATE (+ FRUITS AU CHOIX)", isFruitLayer: true },
      { label: "BASE DE BISCUIT FONDANT" },
    ],
    ingredientCards: [
      {
        title: "MÉDOVYI KORZH (BISCUITS AU MIEL)",
        image: "/images/products/ingredient-honey-pot.jpg",
        items: [
          "Miel pur de fleurs de forêt",
          "Beurre doux français 82%",
          "Farine de blé française T55",
          "Œufs frais de poules plein air",
          "Sucre de canne blond",
        ],
      },
      {
        title: "SMÉTANNYI KREM (CRÈME ONCTUEUSE)",
        image: "/images/products/ingredient-vanilla-cream.jpg",
        items: [
          "Crème fraîche onctueuse 25%",
          "Gousses de vanille Bourbon",
          "Sucre de canne tamisé",
          "Crème fleurette légère",
        ],
      },
    ],
    facts: [
      { label: "COMMANDE MINIMALE", value: "à partir de 6 parts" },
      { label: "DÉLAI DE FABRICATION", value: "à partir de 24 heures" },
      { label: "100% NATUREL", value: "ingrédients nobles" },
    ],
    description:
      "Toutes les couches de biscuit au miel sont cuites artisanalement une à une, puis garnies d’une crème onctueuse et veloutée. Le gâteau infuse pendant 24 heures pour offrir une texture fondante incomparable qui fond en bouche.",
    optionalAdditionsText: "Possibilité d'ajouter des fruits selon votre envie",
    seasonalFruitsText:
      "Nous utilisons des fruits frais de saison. Vous pouvez choisir d’ajouter des fruits frais ou de savourer le Médovik dans sa plus pure tradition.",
    fixedIngredients: [
      "Biscuits au miel de forêt caramélisé",
      "Crème onctueuse à la vanille Bourbon",
      "Pur beurre doux français 82%",
      "Farine de blé T55",
      "Œufs frais fermiers",
    ],
    allergens: ["Gluten (blé)", "Lait / Beurre", "Œufs", "Miel"],
    portionOptions: [
      { value: 6, label: "6 personnes", price: 38 },
      { value: 8, label: "8 personnes", price: 44 },
      { value: 10, label: "10 personnes", price: 50 },
      { value: 12, label: "12 personnes", price: 56 },
    ],
    optionGroups: [
      {
        id: "fruits",
        label: "Fruits & Garniture fraîche",
        type: "single",
        required: true,
        options: [
          {
            id: "none",
            label: "Sans fruits (recette traditionnelle)",
            priceDelta: 0,
            layerEffect: "Crème onctueuse traditionnelle",
          },
          {
            id: "raspberry",
            label: "Framboises fraîches",
            priceDelta: 4,
            layerEffect: "Crème onctueuse + Framboises fraîches",
          },
          {
            id: "strawberry",
            label: "Fraises fraîches",
            priceDelta: 4,
            layerEffect: "Crème onctueuse + Fraises fraîches",
          },
          {
            id: "blueberry",
            label: "Myrtilles fraîches",
            priceDelta: 4,
            layerEffect: "Crème onctueuse + Myrtilles fraîches",
          },
          {
            id: "berries",
            label: "Fruits rouges de saison",
            priceDelta: 5,
            layerEffect: "Crème onctueuse + Fruits rouges de saison",
          },
        ],
      },
      {
        id: "decoration",
        label: "Finition & Décoration",
        type: "single",
        required: true,
        options: [
          {
            id: "natural",
            label: "Naturelle (miettes dorées & touche de miel)",
            priceDelta: 0,
          },
          {
            id: "fresh_fruits",
            label: "Couronne de fruits frais de saison",
            priceDelta: 3,
          },
          {
            id: "minimal",
            label: "Épurée / Très simple",
            priceDelta: 0,
          },
        ],
      },
    ],
    removableIngredients: [
      {
        id: "nuts",
        label: "Éclats de noisettes / fruits à coque en décor",
      },
    ],
  },
  {
    slug: "napoleon",
    name: "Napoléon",
    category: "gateaux",
    subtitle: "Classique Napoléon au feuilletage maison croustillant et crème diplomate onctueuse",
    priceFrom: 42,
    portions: "6 à 12 parts",
    image: "/images/home/product-napoleon.jpg",
    explodedImage: "/images/products/napoleon-exploded.jpg",
    explodedLayers: [
      { label: "FEUILLETAGE CROUSTILLANT" },
      { label: "CRÈME DIPLOMATE (+ FRUITS SUR DEMANDE)", isFruitLayer: true },
      { label: "FEUILLETAGE PUR BEURRE" },
      { label: "CRÈME DIPLOMATE (+ FRUITS SUR DEMANDE)", isFruitLayer: true },
      { label: "BASE FEUILLETÉE DORÉE" },
    ],
    ingredientCards: [
      {
        title: "FEUILLETAGE PUR BEURRE",
        image: "/images/products/ingredient-butter-wheat.jpg",
        items: [
          "Farine de blé française T55",
          "Beurre Charentes-Poitou AOP 82%",
          "Eau pure & sel de Guérande",
          "Caramélisation naturelle au four",
        ],
      },
      {
        title: "CRÈME DIPLOMATE VANILLE",
        image: "/images/products/ingredient-vanilla-cream.jpg",
        items: [
          "Lait entier frais fermier",
          "Gousses de vanille Bourbon de Madagascar",
          "Jaunes d'œufs frais de plein air",
          "Crème fleurette légère 35%",
        ],
      },
    ],
    facts: [
      { label: "COMMANDE MINIMALE", value: "à partir de 6 parts" },
      { label: "DÉLAI DE CONFECTION", value: "à partir de 24 heures" },
      { label: "100% NATUREL", value: "ingrédients nobles" },
    ],
    description:
      "Un feuilletage maison croustillant pur beurre marié à une crème diplomate veloutée et parfumée à la vanille Bourbon de Madagascar. Un équilibre parfait entre croustillant et douceur fondante.",
    optionalAdditionsText: "Possibilité d'ajouter des fruits selon votre envie",
    seasonalFruitsText:
      "Nous utilisons des fruits frais de saison. Vous pouvez choisir d’ajouter des fruits ou de savourer le Napoléon dans sa recette traditionnelle.",
    fixedIngredients: [
      "Feuilletage maison pur beurre 82%",
      "Crème diplomate vanille Bourbon de Madagascar",
      "Farine de blé française T55",
      "Sel de Guérande",
      "Jaunes d'œufs frais",
    ],
    allergens: ["Gluten (blé)", "Lait / Beurre", "Œufs"],
    portionOptions: [
      { value: 6, label: "6 personnes", price: 42 },
      { value: 8, label: "8 personnes", price: 48 },
      { value: 10, label: "10 personnes", price: 54 },
      { value: 12, label: "12 personnes", price: 60 },
    ],
    optionGroups: [
      {
        id: "fruits",
        label: "Fruits & Garniture fraîche",
        type: "single",
        required: true,
        options: [
          {
            id: "none",
            label: "Sans fruits (recette classique)",
            priceDelta: 0,
            layerEffect: "Crème diplomate vanille",
          },
          {
            id: "raspberry",
            label: "Framboises fraîches",
            priceDelta: 4,
            layerEffect: "Crème diplomate + Framboises fraîches",
          },
          {
            id: "strawberry",
            label: "Fraises fraîches",
            priceDelta: 4,
            layerEffect: "Crème diplomate + Fraises fraîches",
          },
          {
            id: "blueberry",
            label: "Myrtilles fraîches",
            priceDelta: 4,
            layerEffect: "Crème diplomate + Myrtilles fraîches",
          },
          {
            id: "berries",
            label: "Fruits rouges de saison",
            priceDelta: 5,
            layerEffect: "Crème diplomate + Fruits rouges de saison",
          },
        ],
      },
      {
        id: "decoration",
        label: "Finition & Décoration",
        type: "single",
        required: true,
        options: [
          {
            id: "traditional",
            label: "Traditionnelle (sucre glace & miettes feuilletées)",
            priceDelta: 0,
          },
          {
            id: "fresh_fruits",
            label: "Garniture fruits frais de saison",
            priceDelta: 3,
          },
          {
            id: "minimal",
            label: "Épurée",
            priceDelta: 0,
          },
        ],
      },
    ],
    removableIngredients: [
      {
        id: "icing",
        label: "Sucre glace de finition",
      },
    ],
  },
  {
    slug: "gateau-signature",
    name: "Gâteau Signature",
    category: "gateaux",
    subtitle: "Meringue noisette, ganache chocolat & éclats torréfiés",
    priceFrom: 44,
    portions: "6 à 10 parts",
    image: "/images/home/product-kyiv.jpg",
    fixedIngredients: ["Meringue noisette", "Ganache chocolat noir", "Beurre AOP"],
    portionOptions: [
      { value: 6, label: "6 personnes", price: 44 },
      { value: 8, label: "8 personnes", price: 52 },
      { value: 10, label: "10 personnes", price: 60 },
    ],
  },
  {
    slug: "cheesecake-fruits-rouges",
    name: "Cheesecake Framboise",
    category: "cheesecakes",
    subtitle: "Sablé croustillant au beurre & coulis de fruits rouges frais",
    priceFrom: 36,
    portions: "6 à 8 parts",
    image: "/images/home/product-cheesecake.jpg",
    fixedIngredients: ["Sablé croustillant pur beurre", "Fromage frais", "Coulis framboise"],
    portionOptions: [
      { value: 6, label: "6 personnes", price: 36 },
      { value: 8, label: "8 personnes", price: 44 },
    ],
  },
  {
    slug: "roules-cannelle",
    name: "Roulés Cannelle",
    category: "viennoiseries",
    subtitle: "Brioche roulée ultra-moelleuse & glaçage vanille Bourbon",
    priceFrom: 24,
    portions: "Boîte de 6 pièces",
    image: "/images/home/product-cinnabon.jpg",
    fixedIngredients: ["Brioche maison", "Cannelle de Ceylan", "Glaçage vanille"],
    portionOptions: [
      { value: 6, label: "Boîte de 6", price: 24 },
      { value: 12, label: "Boîte de 12", price: 44 },
    ],
  },
  {
    slug: "tartelettes-fruits",
    name: "Tartelettes aux Fruits",
    category: "patisseries",
    subtitle: "Pâte sablée pur beurre, crème pâtissière & baies fraîches",
    priceFrom: 28,
    portions: "Boîte de 4 pièces",
    image: "/images/home/product-tartelette.jpg",
    fixedIngredients: ["Pâte sablée pur beurre", "Crème pâtissière", "Baies fraîches"],
    portionOptions: [
      { value: 4, label: "Boîte de 4", price: 28 },
      { value: 8, label: "Boîte de 8", price: 52 },
    ],
  },
  {
    slug: "pavlova-fruits-rouges",
    name: "Pavlova Fruits Rouges",
    category: "patisseries",
    subtitle: "Meringue française craquante, crème fouettée & fruits de saison",
    priceFrom: 35,
    portions: "6 à 8 parts",
    image: "/images/home/about-patissiere-cake.jpg",
    fixedIngredients: ["Meringue française craquante", "Crème fouettée", "Fruits de saison"],
    portionOptions: [
      { value: 6, label: "6 personnes", price: 35 },
      { value: 8, label: "8 personnes", price: 42 },
    ],
  },
  {
    slug: "confiseries-maison",
    name: "Coffret Douceurs & Biscuits",
    category: "confiseries",
    subtitle: "Sélection de biscuits artisanaux pur beurre & douceurs maison",
    priceFrom: 18,
    portions: "1 coffret dégustation",
    image: "/images/home/product-cinnabon.jpg",
    fixedIngredients: ["Beurre français 82%", "Farine T55", "Chocolat noir"],
    portionOptions: [
      { value: 1, label: "1 coffret dégustation", price: 18 },
      { value: 2, label: "2 coffrets cadeaux", price: 34 },
    ],
  },
];
