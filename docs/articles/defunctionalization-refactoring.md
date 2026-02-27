---
title: "The Best Refactoring You've Never Heard Of: Defunctionalization"
author: "James Koppel (presenting Evan Czaplicki's talk)"
source: "https://www.pathsensitive.com/2019/07/the-best-refactoring-youve-never-heard.html"
archived: "2025-01-18"
tags: [refactoring, functional-programming, data-structures, serialization]
---

# Defunctionalization: The Best Refactoring You've Never Heard Of

A program transformation technique that converts higher-order functions into data structures. While invented by John Reynolds as a compiler optimization decades ago, it has proven invaluable as a refactoring method for solving real-world problems.

## Core Concept

Defunctionalization transforms functions into equivalent data representations:

- **Higher-order (direct style)**: Easy to extend with new variants but cannot be serialized
- **Defunctionalized (data-driven)**: Closed to new additions but fully serializable and transmissible across networks

As Czaplicki explains, "the higher-order version...is open" but "the defunctionalized version is closed."

## Application Examples

### 1. Filter Operations

Starting with a simple filter function that takes predicates as parameters, defunctionalization creates an enum where each case represents a function variant:

```typescript
// Higher-order version
const filtered = items.filter((item) => item.price > 100);

// Defunctionalized version
type FilterOp =
  | { type: "priceGreaterThan"; threshold: number }
  | { type: "inStock" }
  | { type: "category"; name: string };

function applyFilter(items: Item[], op: FilterOp): Item[] {
  switch (op.type) {
    case "priceGreaterThan":
      return items.filter((i) => i.price > op.threshold);
    case "inStock":
      return items.filter((i) => i.stock > 0);
    case "category":
      return items.filter((i) => i.category === op.name);
  }
}
```

When free variables exist (like comparing against different thresholds), these get stored in the data structure itself.

### 2. Tree Traversal to Iteration

Converting recursive tree traversal to iterative code involves a four-step process:

1. **CPS Conversion**: Rewrite code in continuation-passing style
2. **Defunctionalize**: Transform the continuation function into a data type
3. **Inline**: Combine recursive functions into single tail-recursive form
4. **Eliminate tail recursion**: Convert to explicit loops using `while(true)`

The resulting "continuation data type" becomes a stack structure—exactly what iterative algorithms require.

### 3. Web Action Continuations

Early versions of Hacker News demonstrated this brilliantly. When users weren't logged in but initiated actions, the system captured "the rest of computation as continuation."

Rather than storing lambda function IDs (which cannot serialize across servers), defunctionalization converts these into data structures:

```typescript
// Can't serialize this
const pendingAction = () => submitPost(title, content);

// Can serialize this
type PendingAction =
  | { type: "submitPost"; title: string; content: string }
  | { type: "upvote"; postId: string }
  | { type: "comment"; postId: string; text: string };
```

## Historical Context

- **John Reynolds** (1972): Developed as compiler technique for eliminating higher-order functions
- **Olivier Danvy** (~2001): Revitalized for "program manipulation"—transforming code appearance while preserving behavior
- **Refunctionalization**: The inverse operation, equally valuable

## Why This Matters

The technique appears everywhere developers already work:

- Task managers storing user preferences
- Cloud services saving filter configurations
- Web applications storing pending actions

These are all defunctionalized continuations. The transformation makes clear why certain architectural patterns emerge: **you cannot transmit functions, but you can always transmit data.**

## Key Takeaway

Defunctionalization reveals equivalences between seemingly different programming styles—much like recognizing that recursion and iteration represent the same underlying concept. Understanding this transformation provides **mechanical methods for solving difficult refactoring problems** without relying on intuition alone.

## Application to Code Review

When reviewing code, ask:

- [ ] Are there functions being stored/serialized that should be defunctionalized?
- [ ] Are there enum/union types that are really defunctionalized functions?
- [ ] Would refunctionalization (converting data back to functions) simplify the code?
- [ ] Is the code open to extension (higher-order) or closed (defunctionalized) appropriately?
