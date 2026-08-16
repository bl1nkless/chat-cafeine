# Chat Caféiné — Agent Rules & Guidelines

## 1. Project Overview
- **Brand**: Chat Caféiné (Family-owned modern artisan pâtisserie & café in Chartres, France).
- **Primary Goal**: Showcase handcrafted cakes and pastries and drive custom cake orders via WhatsApp.
- **Language**: French (fr-FR) for all user-facing interface, copy, labels, and product details.
- **Fulfillment Model**: Retrait au café à Chartres uniquement (Pickup in store only, no delivery).

## 2. Source of Truth & References
- **Detailed Specification**: [`docs/SPEC-001-chat-cafeine.md`](file:///Users/taras/Desktop/chat-cafeine/docs/SPEC-001-chat-cafeine.md)
- **Visual References**:
  - Main Website Concept: [`docs/references/main-reference.jpg`](file:///Users/taras/Desktop/chat-cafeine/docs/references/main-reference.jpg)
  - Product Card Breakdown: [`docs/references/product-reference.jpg`](file:///Users/taras/Desktop/chat-cafeine/docs/references/product-reference.jpg)

## 3. Technology Stack & Architecture
- **Framework**: Next.js (App Router), TypeScript, React.
- **Styling**: Tailored CSS tokens / Tailwind CSS adhering to brand palette.
- **Data & Content**: Static typed data model located in `src/content/products/` and `src/content/categories.ts`.
- **Backend / Database**: None for MVP (zero heavy backend services; direct WhatsApp pre-filled order message generator + SumUp deposit flow).

## 4. Visual & UI Guidelines
- **Palette**:
  - Background: Cream / Ivory (`#F6F3EE`, `#E8DED0`)
  - Text & Accents: Dark Charcoal / Espresso (`#1A1A1A`, `#8B6E4F`, `#C9B79C`)
- **Typography**:
  - Headings: Serif (`Playfair Display`)
  - Body & UI: Clean readable serif / sans-serif (`Lora`, `Montserrat`, `Inter`)
- **Brand Mascot**: The Black Cat (Le Chat Noir) — appears playfully across sections and interactions.
- **Product Visuals**: Real, appetizing photography and interactive exploded/layer cake composition diagrams (e.g. for Médovik, Napoléon).

## 5. Development Principles
- **Mobile First**: All layouts must be fluidly responsive across mobile, tablet, and desktop.
- **Type Safety**: Strictly type all product models, order options, and categories.
- **Performance**: High Lighthouse score, optimized images, minimal JS bundle.
- **Documentation Integrity**: Keep code and documentation aligned with SPEC-001.
