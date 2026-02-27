# CLAUDE.md

Guidance for Ai Agents working with this repository.

## AI Models

**OpenAI Limitation**: Cannot use `z.tuple()` - use `z.array()` or `z.object()` instead.

## ALWAYS DO THIS

1. Run `bun check` after edits and fix all type errors
2. For complex changes: write plan in `claude-plans/` folder first
3. Only run `bun check` locally - never start servers

## Design System

**UI Library**: shadcn/svelte - always use these components, never custom elements.

- Install: `bun x shadcn-svelte@latest add [component-name]`
- Components in: `frontend/src/lib/components/ui/`

**CSS Variables** (in `frontend/src/app.css`):

- Colors: `--color-primary-100`, `--surface-n1` to `n5`, `--color-status-{green,red,blue,yellow}`
- Spacing: `--space-{xs,sm,md,lg,xl}` (8/12/16/24/32px)
- Radius: `--corner-radius-{xs,sm,md,lg}` (4/8/12/16px)
- Fonts: `--font-display`, `--font-body-family`, `--font-mono`

❌ Never hardcode colors. ✅ Use CSS variables.

**Font Sizes** (accessibility):

- ❌ Never use hardcoded `px` for font-size (e.g., `font-size: 14px`)
- ✅ Always use `rem` units (e.g., `font-size: 0.875rem`)
- This allows text to scale with browser font size settings (Large/Very Large)
- Conversion: 10px→0.625rem, 11px→0.6875rem, 12px→0.75rem, 13px→0.8125rem, 14px→0.875rem, 16px→1rem

## Repo

- **Frontend**: Svelte 5 + Vite on port `5173`

```bash
bun install          # Install deps
bun run dev          # Start server
bun check            # Typecheck
```

## Svelte 5

- Use `$derived.by` for complex computations
- `$bindable` props have fallback values if caller doesn't pass them

---

# Coding Guidelines

## Core Principles

### Parse, Don't Validate

Transform input into domain types at boundaries. Use branded types. Fail fast, then work with guaranteed-valid types.

```typescript
type CommitSHA = string & { readonly __brand: "CommitSHA" };
function parseCommitSHA(input: string): CommitSHA | null {
  return /^[a-f0-9]{40}$/.test(input) ? (input as CommitSHA) : null;
}
```

### State Modeling (Avoid MIRO)

Use discriminated unions for state machines:

```typescript
type DataState =
  | { type: "not-asked" }
  | { type: "loading" }
  | { type: "success"; data: number[] }
  | { type: "failure"; error: string };
```

### Parnas' Subset Criteria

For modules A using B:

- A is simpler because it uses B
- B is not more complex by not using A
- Useful subset exists with B but not A
- No useful subset with A but not B

**Key insight**: If A cannot exist without B, but B can exist independently, B should be the lower layer.

### Design Principles Summary

1. **Special types, not primitives** - `UserId` not `string`
2. **Enums over booleans** - `status: TodoStatus` not `isDone: boolean`
3. **Methods on right class** - `Item.setDescription()` not `List.updateItem()`
4. **Don't expose mutables** - Return `readonly` or copies
5. **Entities need own types** - `class TodoList` not raw arrays
6. **No unused code for future** - YAGNI
7. **Lambdas over fixed methods** - `filter(predicate)` not `filterByX()`
8. **Avoid primitive domain concepts** - `Priority` enum not `number`
9. **Bake security into representation** - `viewFor(user)` enforces privacy
10. **Don't delegate security checks** - One secure method, not caller choice

## Implementation Rules

### Use ts-pattern (not switch)

```typescript
import { match } from "ts-pattern";
const result = match({ platform, arch })
  .with({ platform: "linux", arch: "x64" }, () => linuxX64)
  .otherwise(() => null);
```

### Exhaustive Svelte union rendering

When rendering discriminated unions in Svelte templates, check explicit `type` branches (including `type === "loading"` when applicable) and use `assertIsNever(...)` in the final `{:else}` branch.

### Internal Functions Take Objects, Not IDs

```typescript
// ❌ BAD: constructor(workspaceId: WorkspaceId)
// ✅ GOOD: constructor(workspace: Workspace)
```

Use IDs only at API boundaries, storage keys, serialization.

### Type Safety

- **NEVER cast to fix type errors** - fix the root cause
- **No `as any`** - if unavoidable, add dated comment with removal plan
- **No dynamic imports** - always import at file top
- **No re-exports for compatibility** - update importers directly

### NO DEPRECATION

Never deprecate - always remove and update all callers. No transition periods, no `@deprecated` comments. We control frontend+backend, make clean breaks.

### No Re-exports When Moving Code

When moving a symbol from one file to another, **never** add a re-export in the old file. Update all importers directly to point to the new location.

## Code Organization

### Section Headers

```typescript
// #######################################
// H1 - Major Section
// #######################################

// ##############################
// H2 - Subsection
// ##############################

// ####################
// H3 - Sub-subsection
// ####################
```

Type `ch1`, `ch2`, `ch3` in VSCode to generate.

### Refactoring

- **Embedded Design**: Make concepts explicit in code - one line per concept
- **Dead Code**: Delete unused functions immediately (recursively check callers)
- **Deduplication**: Merge duplicate files, keep better version
- **Abstraction**: Express code at appropriate level - "How would I explain this?"

## Reference Articles

Local copies available in `docs/articles/`. Original sources:

- **Parse, Don't Validate**: `parse-dont-validate.md` | [Original](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
- **Type Safety Back and Forth**: `type-safety-back-and-forth.md` | [Original](https://www.parsonsmatt.org/2017/10/11/type_safety_back_and_forth.html)
- **State of Emergency (MIRO)**: `state-of-emergency-miro.md` | [Original](https://note89.github.io/state-of-emergency/)
- **Boolean Blindness**: `boolean-blindness.md` | [Original](https://runtimeverification.com/blog/code-smell-boolean-blindness)
- **11 Aspects of Good Code**: `11-aspects-of-good-code.md` | [Original](https://www.pathsensitive.com/2023/07/the-11-aspects-of-good-code.html)
- **Should You Split That File?**: `should-you-split-that-file.md` | [Original](https://pathsensitive.com/2023/12/should-you-split-that-file.html)
- **7 Mistakes That Make Fragile Code**: `7-mistakes-fragile-code.md`
- **Linguistic Antipatterns**: `linguistic-antipatterns.md`

---

# Architecture

This is a browser-only Svelte 5 SPA that parses M-Bank Bank (Polish) EUR account PDF statements and displays transactions with EUR→PLN conversion via the NBP exchange rate API.

**Data flow:**
1. User drops/selects a PDF → `parsePdfBrowser(ArrayBuffer)` extracts text via `pdfjs-dist`
2. Text items are grouped into rows by y-coordinate, then parsed into `Transaction[]` and `Summary` using x-coordinate column ranges (defined as `COL` constants)
3. After parsing, `fetchEurRates(start, end)` fetches historical EUR/PLN rates from `https://api.nbp.pl`
4. `rateBeforeDate()` finds the applicable rate for each transaction; PLN amounts are displayed alongside EUR

**Key files:**
- `src/App.svelte` — all UI state and logic (drag & drop, file parsing, rate fetching, table render)
- `src/lib/parse-pdf-browser.ts` — browser PDF parser; exports `parsePdfBrowser`, `Transaction`, `Summary`, `BankStatement`
- `src/lib/nbp.ts` — NBP API client; exports `fetchEurRates`, `rateBeforeDate`, `NbpRate`
- `src/lib/parse-pdf.ts` — Node.js-only parser using `pdf.js-extract` (not used at runtime, kept for reference)
- `src/app.css` — Tailwind v4 `@theme {}` block with dark shadcn-style CSS variables

## Key Conventions

- **pdfjs-dist worker**: imported with Vite's `?url` suffix — `import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`
- **Y-coordinate flip**: pdfjs-dist uses bottom-up coordinates; the parser flips them with `y = viewport.height - transform[5]` so rows sort top-to-bottom
- **Column detection**: transaction fields are identified by x-coordinate ranges in the `COL` constant; adjust these if the PDF layout changes
