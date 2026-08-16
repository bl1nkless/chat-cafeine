# Chat Caféiné 🐱☕

Site vitrine et catalogue de commande pour **Chat Caféiné**, pâtisserie familiale et artisanale à Chartres, France.

## 📁 Structure du projet

```text
chat-cafeine/
├── docs/
│   ├── SPEC-001-chat-cafeine.md       # Spécification détaillée du projet
│   └── references/
│       ├── main-reference.jpg         # Maquette visuelle principale & identité
│       └── product-reference.jpg      # Schéma détaillé de fiche produit (composition / couches)
│
├── .agents/
│   └── rules/
│       └── project.md                 # Règles et directives pour les agents IA
│
├── src/                               # Code source de l'application (Next.js)
├── public/                            # Assets statiques (images, polices, mascottes)
├── package.json
└── README.md
```

## 🎯 Concept & Fonctionnalités

- **Catalogue Visuel & Gourmand** : Présentation soignée des gâteaux (Médovik, Napoléon, Cheesecakes...) avec décomposition visuelle des ingrédients et couches.
- **Commande WhatsApp Directe** : Sélection des portions, options et génération automatique du message WhatsApp pré-rempli.
- **Retrait au Café** : Retrait exclusif à Chartres (pas de livraison).
- **Mascotte Chat Noir** : Animations et micro-interactions discrètes et chaleureuses.

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Design System** : Palette crème/espresso (`#F6F3EE`, `#1A1A1A`, `#8B6E4F`), typographie Playfair Display & Lora
- **Spécifications** : Voir [`docs/SPEC-001-chat-cafeine.md`](docs/SPEC-001-chat-cafeine.md)
