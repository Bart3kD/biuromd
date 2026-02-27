---
title: "Type Safety Back and Forth"
author: "Matt Parsons"
source: "https://www.parsonsmatt.org/2017/10/11/type_safety_back_and_forth.html"
archived: "2025-01-18"
tags: [types, safety, validation, boundaries]
---

# Type Safety Back and Forth

## Introduction to Type Safety Approaches

The article explores two contrasting strategies for handling potential failures using the type system.

### Pushing Responsibility Forward

The traditional approach uses types like `Maybe` to signal potential failure to callers:

```haskell
safeDivide :: Int -> Int -> Maybe Int
safeDivide i 0 = Nothing
safeDivide i j = Just (i `div` j)
```

This tells callers: "This might fail; you handle it." The function accepts any parameters but offloads error handling downstream.

### Pushing Responsibility Backward

An alternative strategy restricts input types to prevent failures entirely:

```haskell
safeDivide :: Int -> NonZero Int -> Int
safeDivide i (NonZero j) = i `div` j
```

The author explains this philosophy: "No! You must provide a `NonZero Int`... because then I might fail, and that's annoying."

## The NonZero Implementation

Using `PatternSynonyms`, the author demonstrates a safe wrapper:

```haskell
newtype NonZero a = UnsafeNonZero a
pattern NonZero a <- UnsafeNonZero a
nonZero :: (Num a, Eq a) => a -> Maybe (NonZero a)
nonZero 0 = Nothing
nonZero i = Just (UnsafeNonZero i)
```

This prevents unsafe construction while enabling pattern matching.

## The Ripple Effect

The author describes how responsibility propagates through systems. When upstream code requires strict types, downstream developers naturally maintain those constraints. Real-world example:

**Before:**

```typescript
interface Order {
  items: Item[]; // Could be empty!
}
```

**After:**

```typescript
type NonEmptyArray<T> = [T, ...T[]];
interface Order {
  items: NonEmptyArray<Item>; // Can never be empty
}
```

This single change eliminated numerous `Maybe` values throughout the codebase, pushing the responsibility burden to system boundaries—JSON decoding and database retrieval.

## Key Insight

**"By restricting our past, we gain freedom in the future."**

Type safety at entry points (APIs, databases) simplifies internal logic dramatically.

## Application to Code Review

When reviewing code, ask:

- Are we pushing responsibility forward (callers handle errors) or backward (types prevent errors)?
- Can we strengthen input types to prevent invalid states?
- Are validation checks scattered throughout, or concentrated at boundaries?
