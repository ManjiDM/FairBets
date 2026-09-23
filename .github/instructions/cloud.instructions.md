---
applyTo: "src/lib/**,supabase/**"
---

# Cloud and Supabase instructions

Cloud storage is **optional backup, restore, and sync**. The app must stay fully usable
without it.

## Rules

- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser-safe. A service-role
  key never appears in `.env.local`, in browser code, in examples, or in any committed
  file.
- Row-level security is mandatory on every table, so a signed-in user can only reach
  their own ledger.
- Validation in `src/lib/cloudStore.ts` stays strict. Reject unexpected row shapes rather
  than coercing them; corrupted cloud data must never overwrite a good local ledger
  silently.
- A cloud data-shape change is a three-part change landed together:
  1. `supabase/schema.sql` — the authoritative schema
  2. a new file in `supabase/migrations/` — never edit an applied migration in place
  3. the row parsers in `src/lib/cloudStore.ts`
- Auth is email magic-link. Any new deployment URL must be added to Supabase's redirect
  allow list; document it in `README.md`.
- Handle the unconfigured case gracefully: missing environment variables mean cloud
  features are unavailable, not that the app breaks.
- Never log tokens, session objects, or ledger contents.

## Verify

```bash
pnpm lint
pnpm build
```

Plus a manual check that the app still starts and works with no Supabase environment
variables set.
