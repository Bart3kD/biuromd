# Runed Integration Guide

[Runed](https://runed.dev) provides reactive utilities for Svelte 5. **Goal:** Spot opportunities in code, then research details if needed.

**Source of truth:** https://github.com/svecosystem/runed/tree/main/sites/docs/src/content/utilities

## All Available Utilities (34 total)

### Reactivity & State

`Debounced` `Throttled` `Previous` `StateHistory` `watch` `watchOnce`

### DOM Elements

`ActiveElement` `ElementRect` `ElementSize` `IsFocusWithin` `IsInViewport` `TextareaAutosize`

### Document & Browser

`IsDocumentVisible` `IsIdle` `IsMounted` `PressedKeys` `ScrollState` `AnimationFrames`

### Events & Interactions

`useEventListener` `onClickOutside` `onCleanup`

### Observers

`useIntersectionObserver` `useMutationObserver` `useResizeObserver`

### Data & Async

`Resource` `PersistedState` `useGeolocation` `useSearchParams`

### Utilities

`Context` `FiniteStateMachine` `boolAttr` `extract` `useDebounce` `useThrottle` `useInterval`

---

## Essential: The `watch` Utility

**This is critical for Svelte 5** - provides explicit dependency tracking that `$effect` lacks.

```ts
import { watch } from "runed";

// Basic: watch specific dependency
let count = $state(0);
watch(
  () => count,
  (curr, prev) => {
    console.log(`count is ${curr}, was ${prev}`);
  },
);

// Watch multiple sources
let age = $state(20);
let name = $state("bob");
watch([() => age, () => name], ([age, name], [prevAge, prevName]) => {
  // Only runs when age OR name changes
});

// Deep watch an object
let user = $state({ name: "bob", age: 20 });
watch(
  () => $state.snapshot(user),
  () => {
    console.log(`${user.name} is ${user.age} years old`);
  },
);

// Lazy mode: skip initial run
watch(sources, callback, { lazy: true });

// Run only once
import { watchOnce } from "runed";
watchOnce(
  () => count,
  (curr) => {
    console.log("This runs only once when count changes");
  },
);

// Pre-effect timing (like $effect.pre)
watch.pre(sources, callback);
```

**When to use `watch` vs `$effect`:**

- Use `$effect` when you want automatic dependency detection
- Use `watch` when you need **explicit control** over which values trigger re-runs

**Important:** `watch` requires getter functions, not direct values:

```typescript
// ✅ Correct: pass a getter function
watch(() => count, callback);

// ❌ Wrong: passing value directly won't work
watch(count, callback);
```

---

## Pattern Recognition: When to Suggest Runed

| **See this code pattern**                             | **Suggest**                                 | **Docs**                                                                    |
| ----------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `setTimeout`/`clearTimeout` in `$effect`              | `Debounced`                                 | [debounced](https://runed.dev/docs/utilities/debounced)                     |
| `setInterval`/`clearInterval` in `$effect`            | `useInterval`                               | [use-interval](https://runed.dev/docs/utilities/use-interval)               |
| `new ResizeObserver()` boilerplate                    | `ElementSize` or `useResizeObserver`        | [element-size](https://runed.dev/docs/utilities/element-size)               |
| `new IntersectionObserver()` boilerplate              | `IsInViewport` or `useIntersectionObserver` | [is-in-viewport](https://runed.dev/docs/utilities/is-in-viewport)           |
| `addEventListener`/`removeEventListener` in `$effect` | `useEventListener`                          | [use-event-listener](https://runed.dev/docs/utilities/use-event-listener)   |
| Scroll position tracking                              | `ScrollState`                               | [scroll-state](https://runed.dev/docs/utilities/scroll-state)               |
| localStorage sync in `$effect`                        | `PersistedState`                            | [persisted-state](https://runed.dev/docs/utilities/persisted-state)         |
| Tracking previous value manually                      | `Previous`                                  | [previous](https://runed.dev/docs/utilities/previous)                       |
| Click outside detection                               | `onClickOutside`                            | [on-click-outside](https://runed.dev/docs/utilities/on-click-outside)       |
| `$effect` with `untrack()` for specific deps          | `watch`                                     | [watch](https://runed.dev/docs/utilities/watch)                             |
| Document visibility changes                           | `IsDocumentVisible`                         | [is-document-visible](https://runed.dev/docs/utilities/is-document-visible) |
| Idle/inactive user detection                          | `IsIdle`                                    | [is-idle](https://runed.dev/docs/utilities/is-idle)                         |
| Keyboard shortcuts/pressed keys                       | `PressedKeys`                               | [pressed-keys](https://runed.dev/docs/utilities/pressed-keys)               |
| Async data fetching with loading state                | `Resource`                                  | [resource](https://runed.dev/docs/utilities/resource)                       |
| Undo/redo history                                     | `StateHistory`                              | [state-history](https://runed.dev/docs/utilities/state-history)             |

---

## Essential Examples

### Debouncing

```svelte
<script>
  import { Debounced } from "runed";

  let search = $state("");
  const debounced = new Debounced(() => search, 300);

  $effect(() => {
    if (debounced.current) {
      fetchResults(debounced.current);
    }
  });
</script>

<input bind:value={search} />
```

### Element Size

```svelte
<script>
  import { ElementSize } from "runed";

  let elementRef = $state<HTMLElement>();
  const size = new ElementSize(() => elementRef);
</script>

<div bind:this={elementRef}>
  {size.width} x {size.height}
</div>
```

### Click Outside

```svelte
<script>
  import { onClickOutside } from "runed";

  let menuRef = $state<HTMLElement>();
  let isOpen = $state(false);

  onClickOutside(
    () => menuRef,
    () => {
      isOpen = false;
    },
  );
</script>
```

### Persisted State

```svelte
<script>
  import { PersistedState } from "runed";

  const theme = new PersistedState("theme", "light");
  // theme.current syncs with localStorage
</script>

<button
  onclick={() => (theme.current = theme.current === "light" ? "dark" : "light")}
>
  Toggle: {theme.current}
</button>
```

### Previous Value

```svelte
<script>
  import { Previous } from "runed";

  let count = $state(0);
  const prev = new Previous(() => count);
</script>

<p>Current: {count}, Previous: {prev.current}</p>
```

### Scroll State

```svelte
<script>
  import { ScrollState } from "runed";

  let containerRef = $state<HTMLElement>();
  const scroll = new ScrollState(() => containerRef);
  // scroll.x, scroll.y, scroll.progress.x, scroll.progress.y
</script>
```

---

## Project-Specific Notes

- **Already using**: `TextareaAutosize` - check existing usage
- **Prefer**: `createErasablePersistedState` over `PersistedState` (has schema validation)
- **Install**: `bun add runed`

## Resources

- **Docs**: https://runed.dev/docs
- **GitHub source** (best for LLMs): https://github.com/svecosystem/runed/tree/main/sites/docs/src/content/utilities
- Individual utility: `https://runed.dev/docs/utilities/[utility-name]`
