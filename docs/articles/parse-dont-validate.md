---
title: "Parse, Don't Validate"
author: "Alexis King"
source: "https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/"
archived: "2025-01-18"
tags: [types, validation, parsing, representable-valid]
---

# Parse, Don't Validate

## The Core Principle

The essence of type-driven design can be summarized in three words: **"Parse, don't validate."** This philosophy emphasizes leveraging static type systems to encode domain knowledge and constraints directly into data structures, rather than performing runtime checks that discard information.

## Key Concepts

### The Problem with Partial Functions

A partial function doesn't handle all possible inputs. For example, a `head` function on lists fails for empty lists:

```haskell
head :: [a] -> a
head (x:_) = x
-- Compiler warning: Pattern match(es) are non-exhaustive
```

### Two Approaches to Fix This

**Option 1: Weaken the return type**

```haskell
head :: [a] -> Maybe a
head (x:_) = Just x
head [] = Nothing
```

This forces callers to handle the `Nothing` case repeatedly, even when they've already verified the list is non-empty elsewhere.

**Option 2: Strengthen the input type**

```haskell
head :: NonEmpty a -> a
head (x:|_) = x
```

Using `NonEmpty` (defined as `data NonEmpty a = a :| [a]`) encodes the guarantee that a list is non-empty within the type system itself.

### Why Parsing Beats Validation

The distinction between validation and parsing lies in information preservation:

- **Validation**: Checks constraints but returns `()`, discarding what was learned
- **Parsing**: Checks constraints and returns a refined type that preserves the proof

"Shotgun parsing"—mixing validation checks throughout processing code—can lead to acting on invalid data before discovering errors later. Parsing everything upfront at system boundaries prevents this.

## Practical Guidance

1. **Use datatypes that make illegal states unrepresentable.** Choose precise data structures (like `Map` instead of lists of tuples for key-value pairs without duplicates).

2. **Push proof burden upward.** Parse data into its most precise form as early as possible, ideally at system boundaries.

3. **Let datatypes guide code design.** Rather than forcing data into convenient structures, refactor code to work with the right representation.

4. **Be suspicious of functions returning `m ()`.** If their primary purpose is error reporting, there's likely a better approach.

5. **Use abstract datatypes with smart constructors** when perfect type encoding is impractical (e.g., validating integer ranges).

## The Bottom Line

This approach transforms the type system from a passive checker into an active ally. When parsing and processing logic diverge, the program fails to compile rather than silently executing buggy code. As the author notes: "Write functions on the data representation you wish you had, not the data representation you are given."

## TypeScript/JavaScript Application

```typescript
// ❌ BAD: Validation (discards information)
function validateNonEmpty(arr: string[]): void {
  if (arr.length === 0) throw new Error("Array is empty");
}

// ✅ GOOD: Parsing (preserves information in types)
type NonEmptyArray<T> = [T, ...T[]];
function parseNonEmpty<T>(arr: T[]): NonEmptyArray<T> | null {
  if (arr.length === 0) return null;
  return arr as NonEmptyArray<T>;
}
```
