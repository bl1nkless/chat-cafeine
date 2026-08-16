# Chat Caféiné Project Rules

The source of truth for this project is:

@docs/SPEC-001-chat-cafeine.md

## Product

Chat Caféiné is a family-owned café and pâtisserie in Chartres, France.

The primary business goal of the website is:
product discovery -> product page -> WhatsApp order request.

Do not add e-commerce checkout, authentication, CMS, database,
delivery functionality, or a separate backend unless explicitly requested.

## Design

The supplied reference images in docs/references are the primary
visual direction.

Do not replace this visual direction with generic SaaS,
generic bakery, luxury fashion, or Shopify-like styling.

The intended character is:

- warm
- family-owned
- handmade
- elegant
- editorial
- appetising
- cream / ivory / black / warm brown
- photography-first

Use generous whitespace and large product photography.

Avoid excessive cards, shadows, gradients, glassmorphism
and generic AI-generated dashboard aesthetics.

## Engineering

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Motion only where animation adds value
- Rive for the final animated cat mascot

Prefer Server Components unless interactivity requires a Client Component.

Do not introduce dependencies without a clear reason.

Keep product data typed and local to the repository.

## Workflow

Never implement a large milestone before producing an implementation plan.

Work milestone by milestone according to the SPEC.

Before considering a milestone complete:

1. run lint
2. run typecheck
3. run build
4. visually inspect relevant pages in browser
5. check mobile layout
6. summarize files changed

Do not silently modify the approved architecture.
