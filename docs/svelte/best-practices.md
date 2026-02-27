# Svelte 5 Best Practices

This document outlines best practices for Svelte 5, focusing on runes, reactivity, and modern patterns.

## Core Runes

### `$state` - Reactive State

**Use for:** Component-local reactive state

```svelte
<script>
  let count = $state(0);
  let user = $state({ name: "Alice", age: 30 });
</script>
```

**Best Practices:**

- ✅ Use `$state` for all component-local reactive variables
- ✅ Initialize with a value (primitives or objects)
- ❌ Don't use `let` for reactive state - use `$state` instead
- ❌ Don't mutate state outside of event handlers or effects

### `$derived` - Computed Values

**Use for:** Values that depend on other reactive state

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

**Best Practices:**

- ✅ Use `$derived` for simple computations
- ✅ Use `$derived.by()` for complex computations with multiple statements
- ❌ Don't use `$state` for computed values - use `$derived` instead
- ❌ Don't perform side effects in `$derived` - use `$effect` instead

**Example with `$derived.by()`:**

```svelte
<script>
  let numbers = $state([1, 2, 3, 4, 5]);
  let stats = $derived.by(() => {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    return { sum, avg, count: numbers.length };
  });
</script>
```

### `$effect` - Side Effects

**Use for:** Side effects that should run when dependencies change

```svelte
<script>
  let count = $state(0);

  $effect(() => {
    console.log(`Count changed to ${count}`);
    // Cleanup function (optional)
    return () => {
      console.log("Cleaning up");
    };
  });
</script>
```

**Best Practices:**

- ✅ Use for DOM manipulation, subscriptions, logging
- ✅ Return cleanup function for subscriptions and listeners
- ✅ Dependencies are automatically tracked
- ❌ Don't use for computed values - use `$derived` instead
- ❌ Don't create infinite loops by modifying dependencies

### `$props` - Component Props

**Use for:** Declaring component props with TypeScript support

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
    onUpdate?: (value: number) => void;
  }

  let { title, count = 0, onUpdate }: Props = $props();
</script>
```

**Best Practices:**

- ✅ Use TypeScript interface for type safety
- ✅ Provide default values in destructuring
- ✅ Use `$bindable()` for two-way binding
- ❌ Don't use `export let` - use `$props()` instead

**Two-way binding with `$bindable()`:**

```svelte
<script lang="ts">
  let { value = $bindable(0) } = $props();
</script>

<input type="number" bind:value />
```

### `$inspect` - Debug Reactive State

**Use for:** Debugging reactive state changes

```svelte
<script>
  let count = $state(0);
  $inspect(count); // Logs when count changes
  $inspect({ count, doubled: count * 2 }); // Log multiple values
</script>
```

## Event Handlers

### Modern Event Handling

Svelte 5 simplifies event handling - no need for `on:` directive for native events:

```svelte
<!-- ✅ Svelte 5 style -->
<button onclick={() => count++}>Increment</button>

<!-- ❌ Old Svelte style (still works but not idiomatic) -->
<button on:click={() => count++}>Increment</button>
```

**Custom events:**

```svelte
<script lang="ts">
  interface Props {
    onsubmit?: (data: FormData) => void;
  }

  let { onsubmit } = $props();

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    onsubmit?.(formData);
  }
</script>

<form onsubmit={handleSubmit}>
  <!-- form fields -->
</form>
```

## Snippets - Reusable Markup

**Use for:** Reusable template fragments within a component

```svelte
<script>
  let items = $state(["Apple", "Banana", "Cherry"]);
</script>

{#snippet listItem(item, index)}
  <li class="item-{index}">{item}</li>
{/snippet}

<ul>
  {#each items as item, i}
    {@render listItem(item, i)}
  {/each}
</ul>
```

**Decision: Snippet vs Component**

| Use Snippet                                   | Use Component                             |
| --------------------------------------------- | ----------------------------------------- |
| Same markup 2-3 times _within this component_ | Needed across multiple components         |
| Simple template, <10 lines                    | Complex logic, >10 lines                  |
| No internal state needed                      | Has its own state                         |
| Just markup transformation                    | Has lifecycle, effects, or event handlers |

**Best Practices:**

- ✅ Use for repeated markup patterns within a component
- ✅ Pass parameters for dynamic content
- ❌ Don't overuse - create components for truly reusable logic

## Stores (Still Relevant)

Svelte stores still work in Svelte 5 and are useful for global state:

```typescript
// store.ts
import { writable } from "svelte/store";
export const userStore = writable({ name: "", loggedIn: false });
```

```svelte
<!-- Option 1: Use store directly with auto-subscription -->
<script>
  import { userStore } from "./store";
</script>

<p>Welcome, {$userStore.name}!</p>
```

```svelte
<!-- Option 2: Convert store to local state (for mutations) -->
<script>
  import { userStore } from "./store";
  let user = $state($userStore);
</script>

<p>Welcome, {user.name}!</p>
```

**When to use:**

- ✅ Global state shared across components
- ✅ State that persists across component unmounts
- ✅ Integration with existing store-based libraries
- ❌ Local component state (use `$state` instead)

## Common Patterns

### Loading States

```svelte
<script lang="ts">
  type LoadingState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: string };

  let state = $state<LoadingState<User>>({ status: "idle" });

  async function loadUser() {
    state = { status: "loading" };
    try {
      const data = await fetchUser();
      state = { status: "success", data };
    } catch (error) {
      state = { status: "error", error: String(error) };
    }
  }
</script>

{#if state.status === "loading"}
  <p>Loading...</p>
{:else if state.status === "success"}
  <p>Hello, {state.data.name}!</p>
{:else if state.status === "error"}
  <p>Error: {state.error}</p>
{/if}
```

### Form Handling

```svelte
<script lang="ts">
  let formData = $state({
    email: "",
    password: "",
  });

  let errors = $derived.by(() => {
    const errs: string[] = [];
    if (!formData.email.includes("@")) errs.push("Invalid email");
    if (formData.password.length < 8) errs.push("Password too short");
    return errs;
  });

  let isValid = $derived(errors.length === 0);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (isValid) {
      // Submit form
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <input type="email" bind:value={formData.email} />
  <input type="password" bind:value={formData.password} />

  {#if errors.length > 0}
    <ul>
      {#each errors as error}
        <li>{error}</li>
      {/each}
    </ul>
  {/if}

  <button disabled={!isValid}>Submit</button>
</form>
```

## Migration from Svelte 4

### Key Changes

1. **Reactive declarations** (`$:`) → `$derived` or `$effect`

   ```svelte
   <!-- ❌ Svelte 4 -->
   <script>
   let count = 0;
   $: doubled = count * 2;
   </script>

   <!-- ✅ Svelte 5 -->
   <script>
   let count = $state(0);
   let doubled = $derived(count * 2);
   </script>
   ```

2. **Props** (`export let`) → `$props()`

   ```svelte
   <!-- ❌ Svelte 4 -->
   <script>
   export let name;
   export let age = 0;
   </script>

   <!-- ✅ Svelte 5 -->
   <script>
   let { name, age = 0 } = $props();
   </script>
   ```

3. **Event handlers** (`on:`) → direct event attributes

   ```svelte
   <!-- ❌ Svelte 4 style (still works) -->
   <button on:click={handleClick}>Click</button>

   <!-- ✅ Svelte 5 style -->
   <button onclick={handleClick}>Click</button>
   ```

## Anti-Patterns to Avoid

### ❌ Using `let` for reactive state

```svelte
<!-- ❌ BAD -->
<script>
let count = 0; // Not reactive!
</script>

<!-- ✅ GOOD -->
<script>
let count = $state(0); // Reactive
</script>
```

### ❌ Recreating computed values

```svelte
<!-- ❌ BAD -->
<script>
let count = $state(0);
$effect(() => {
  doubled = count * 2; // Don't use $effect for this!
});
</script>

<!-- ✅ GOOD -->
<script>
let count = $state(0);
let doubled = $derived(count * 2);
</script>
```

### ❌ Mutating props directly

```svelte
<!-- ❌ BAD -->
<script>
let { items } = $props();
function addItem() {
  items.push('new'); // Don't mutate props!
}
</script>

<!-- ✅ GOOD -->
<script>
let { items, onAddItem } = $props();
function addItem() {
  onAddItem?.('new'); // Let parent handle state
}
</script>
```

### ❌ Using `$effect` for derived state

```svelte
<!-- ❌ BAD -->
<script>
let firstName = $state('John');
let lastName = $state('Doe');
let fullName = $state('');
$effect(() => {
  fullName = `${firstName} ${lastName}`;
});
</script>

<!-- ✅ GOOD -->
<script>
let firstName = $state('John');
let lastName = $state('Doe');
let fullName = $derived(`${firstName} ${lastName}`);
</script>
```

## Performance Tips

1. **Use `$derived` for expensive computations** - they're memoized automatically
2. **Avoid deep reactivity when not needed** - use plain objects if no reactivity needed
3. **Use `$effect.pre()` for timing-critical effects** - runs before DOM updates
4. **Batch state updates** - multiple updates in same tick are batched automatically
5. **Use `untrack()` to prevent dependency tracking** when reading reactive state without creating dependency

## Resources

See `resources.md` for links to official documentation and additional learning materials.
