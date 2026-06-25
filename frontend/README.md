# Nova Frontend (Next.js 15)

Production-ready frontend foundation for Nova sustainable commerce.

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- React Hook Form + Zod
- Framer Motion
- Axios
- PWA-ready manifest
- ESLint + Prettier

## Commands

```bash
npm install
npm run dev --workspace frontend
npm run build --workspace frontend
npm run lint --workspace frontend
```

## Architecture

- `src/app`: route groups (`(public)`, `(auth)`, `(customer)`, `(seller)`, `(admin)`) and API route handlers
- `src/components`: reusable UI, commerce, dashboard, forms, and layout components
- `src/lib`: query client, axios client, utility functions
- `src/store`: Zustand stores (auth and UI)
- `src/schemas`: Zod validation schemas
- `src/hooks`: typed hooks and data hooks

## Notes

- Route protection is handled by `middleware.ts` with role-aware checks.
- Metadata and SEO defaults are in `src/app/layout.tsx`.
- PWA manifest is in `public/manifest.json`.
- Service worker registration is handled by `src/components/providers/PwaRegister.tsx` and `public/sw.js`.
