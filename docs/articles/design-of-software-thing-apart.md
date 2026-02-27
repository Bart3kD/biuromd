---
title: "The Design of Software is A Thing Apart"
author: "James Koppel"
source: "https://www.pathsensitive.com/2018/01/the-design-of-software-is-thing-apart.html"
archived: "2025-01-18"
tags: [design, documentation, specification, intent, coupling]
---

# The Design of Software is A Thing Apart

Software design exists at a distinct level from code implementation. While code represents _how_ something works, design represents _what_ it should accomplish and _why_ certain decisions were made.

## Key Argument

**"The information of a program's design is largely not present in its code."**

Multiple designs can correspond to identical code, making it impossible to fully recover design intent by reading implementation alone.

## Three Illustrative Problems

### 1. Testing Too Much

Test-driven development can create fragile tests when developers mistake implementation details for design requirements.

Example: A function that calls `appState.saveCurrentState()` twice—but the tests shouldn't assume this is intentional. A redesign might accomplish the same goal differently.

**Key insight**: Tests should verify design specifications, not implementation mechanics.

### 2. Coupling and Module Boundaries

Whether module A "knows about" module B depends entirely on documentation, not on code structure.

Three modules dealing with students and employees might be coupled or independent based on what their specifications claim—information invisible in the code itself.

### 3. Semantic Meaning

The expression `x >= 65` could mean:

- A character is alphabetic (ASCII check)
- A person qualifies for retirement

The code is identical, but the purposes differ fundamentally. Future changes like internationalization or legal updates would affect them differently.

```typescript
// These are identical code but different designs:

// Design A: ASCII alphabetic check
if (charCode >= 65) { ... }

// Design B: Retirement eligibility
if (age >= 65) { ... }

// Better: Make design explicit
const UPPERCASE_A = 65;
const RETIREMENT_AGE = 65;

if (charCode >= UPPERCASE_A) { ... }
if (age >= RETIREMENT_AGE) { ... }
```

## The Embedded Design Principle

**Make the design apparent in the code.** This means:

- Using explicit constant names (`RETIREMENT_AGE` instead of `65`)
- Documenting module contracts clearly
- Separating specification from implementation concerns

## Why Self-Documenting Code is Insufficient

Documentation should explain:

- Current behavior
- Future evolution possibilities
- Reasoning behind architectural choices

Code and tests should both follow design specifications, not precede them.

## Application to Code Review

When reviewing code, ask:

- [ ] Can the design intent be recovered from reading this code?
- [ ] Are magic numbers/strings given meaningful names?
- [ ] Do tests verify design specifications or implementation details?
- [ ] Is coupling between modules documented or just implicit?
- [ ] Would two developers understand this code's purpose identically?
- [ ] Are there comments explaining WHY, not just WHAT?
