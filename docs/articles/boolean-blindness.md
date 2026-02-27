---
title: "Code Smell: Boolean Blindness"
author: "Thomas Tuegel"
source: "https://runtimeverification.com/blog/code-smell-boolean-blindness"
archived: "2025-01-18"
tags: [booleans, types, enums, discriminated-unions]
---

# Code Smell: Boolean Blindness

## The Core Problem

The `Bool` type encodes minimal information—just `True` or `False`. "Boolean blindness" describes the information loss when functions operate on `Bool` instead of richer structures, creating code with ambiguous semantics.

## The Filter Example

Consider `filter`'s type signature:

```haskell
filter :: (a -> Bool) -> [a] -> [a]
```

The ambiguity: does the predicate mean "keep" or "discard"? Physical filters have dual purposes—collecting filtrate (coffee) or particulate (gold prospecting)—creating semantic confusion.

Both implementations below have the same type signature:

```haskell
-- Keep elements where predicate is true
filter keep (a : as)
  | keep a = a : filter keep as
  | otherwise = filter keep as

-- OR: Discard elements where predicate is true (equally valid from types alone!)
filter discard (a : as)
  | discard a = filter discard as
  | otherwise = a : filter discard as
```

The type system can't distinguish between these implementations.

## Solution 1: Expressive Naming

Custom types clarify intent:

```haskell
data Keep = Discard | Keep

filter1 :: (a -> Keep) -> [a] -> [a]
```

**Disadvantage:** Many existing functions work with `Bool`; reimplementation becomes necessary for custom types.

## Solution 2: Structural Types (Maybe)

The `Maybe` type structurally represents zero or one elements:

```haskell
filter2 :: (a -> Maybe a) -> [a] -> [a]
filter2 _ [] = []
filter2 keep (a : as)
  | Just b <- keep a = b : filter2 keep as
  | otherwise = filter2 keep as
```

This allows transformation during filtering:

```haskell
decrementPositive :: [Integer] -> [Integer]
decrementPositive = filter2 (\x -> if x > 0 then Just (x - 1) else Nothing)
```

## Solution 3: Parametric Polymorphism

Using different type variables ensures correctness:

```haskell
filter3 :: (a -> Maybe b) -> [a] -> [b]
```

The type signature **guarantees** "the implementation only collects outputs from the predicate, because that is the only thing in scope which can produce a value of `b`."

## TypeScript/JavaScript Application

```typescript
// ❌ BAD: Boolean blindness
function processItems(items: Item[], shouldProcess: (item: Item) => boolean) {
  // Does `true` mean "process" or "skip"? Ambiguous!
  return items.filter((item) => shouldProcess(item));
}

// ✅ BETTER: Discriminated union with explicit intent
type ProcessDecision = { action: "process" } | { action: "skip" };
function processItems(items: Item[], decide: (item: Item) => ProcessDecision) {
  return items.filter((item) => decide(item).action === "process");
}

// ✅ BEST: Return the transformed result or nothing
function processItems<T>(
  items: Item[],
  transform: (item: Item) => T | null,
): T[] {
  return items.flatMap((item) => {
    const result = transform(item);
    return result !== null ? [result] : [];
  });
}
```

## Key Takeaways

1. **Booleans discard information** about what the decision means
2. **Use enums/unions** to make decisions explicit (`Keep | Discard`, not `true | false`)
3. **Return the result or nothing** instead of returning whether to keep something
4. **Type parameters create guarantees** that implementations must satisfy
5. **Context determines appropriateness**—excessive abstraction can also obscure intent

## Relation to Other Guidelines

This connects directly to CLAUDE.md's guideline:

> **Enums over booleans** - `status: TodoStatus` not `isDone: boolean`

And the "State Modeling (Avoid MIRO)" principle of using discriminated unions instead of boolean flags.
