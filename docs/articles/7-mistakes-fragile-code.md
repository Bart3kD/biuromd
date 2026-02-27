---
title: "7 Mistakes That Cause Fragile Code"
author: "James Koppel"
source: "https://mirdin.com/wp-content/uploads/2018/05/7mistakes-2ndedition.pdf"
archived: "2025-01-18"
tags: [mistakes, fragile-code, preconditions, abstraction, data-structures]
---

# 7 Mistakes That Cause Fragile Code

## Overview

This document outlines seven common mistakes that lead to fragile, hard-to-maintain code. These patterns often seem reasonable in isolation but create compounding problems over time.

## The 7 Mistakes

### 1. Excessive Error Checking (Missing Preconditions)

**Problem:** Code filled with guards and null checks indicates missing preconditions, imprecise types, or missing data structure invariants.

**Signs:**

- Functions that check if parameters are valid before operating
- Null checks scattered throughout code
- Defensive programming that hides the real problem

**Fix:** Push validation to system boundaries. Use types that make invalid states unrepresentable.

```typescript
// BAD: Checking everywhere
function processOrder(order: Order | null) {
  if (!order) return;
  if (!order.items || order.items.length === 0) return;
  // ...
}

// GOOD: Types enforce validity
function processOrder(order: ValidOrder) {
  // order is guaranteed to have items
}
```

### 2. Refactoring is not Boxing

**Problem:** Extracting code just because it's duplicated, without a clear concept behind it.

**Signs:**

- Functions with generic names like `helper`, `util`, `process`
- Extractions that don't reduce complexity
- Code that's harder to understand after "refactoring"

**Fix:** Only extract when there's a sensible, simple concept with a clear name. Duplication is sometimes better than the wrong abstraction.

### 3. Code Quality is About Data Structures

**Problem:** Starting with algorithms before figuring out the right data structures.

**Quote:** "Show me your flowcharts and conceal your tables, and I shall continue to be mystified. Show me your tables, and I won't usually need your flowcharts; they'll be obvious." - Fred Brooks

**Fix:** Start programming by figuring out the right data structures. The right structure makes the code obvious.

### 4. Getting Stuck in Old Design

**Problem:** Leaving old code "for backwards compatibility" when it's not needed, or failing to improve adjacent code that's limiting.

**Signs:**

- Re-exports for "backwards compatibility" in internal code
- Old patterns preserved alongside new ones
- Fear of changing working code

**Fix:** Be aggressive about proposing changes to adjacent limiting code. In internal codebases without external consumers, clean breaks are often better.

### 5. Hidden Preconditions (Logic Layers)

**Problem:** Methods with preconditions not cleanly expressed in the API.

**Signs:**

- Functions that only work after other functions are called
- State that must be checked before operations
- Documentation like "must call X before Y"

**Fix:** Use fluent APIs, tokens, or type state patterns. Make preconditions explicit in the type system.

### 6. Missing Abstraction Layer

**Problem:** Code operating at mixed levels of abstraction.

**Signs:**

- Business logic mixed with infrastructure concerns
- High-level operations alongside bit manipulation
- Difficulty explaining what a function does at one level

**Fix:** Identify the natural abstraction boundaries and separate concerns.

### 7. Information Discarding

**Problem:** Throwing away information that will be needed later.

**Signs:**

- Parsing strings repeatedly
- Converting structured data to strings and back
- Losing type information through `any` or untyped dictionaries

**Fix:** Preserve information in types. Parse once at boundaries, then work with structured data.

## Application to Code Review

When reviewing code, check for these patterns:

- [ ] Are there excessive guards/null checks? (Missing preconditions)
- [ ] Are extractions meaningful or just boxing? (Refactoring done wrong)
- [ ] Are data structures appropriate? (Data structure first)
- [ ] Is old code preserved unnecessarily? (Stuck in old design)
- [ ] Are preconditions hidden? (Hidden logic layers)
- [ ] Are abstraction levels mixed? (Missing abstraction)
- [ ] Is information being discarded? (Information loss)
