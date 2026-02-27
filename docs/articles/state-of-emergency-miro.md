---
title: "State of Emergency: The Four Ways Your State Might Be Wrong (MIRO)"
author: "note89"
source: "https://note89.github.io/state-of-emergency/"
archived: "2025-01-18"
tags: [state, MIRO, data-modeling, illegal-states, representable-valid]
---

# State of Emergency: The Four Ways Your State Might Be Wrong (MIRO)

## Overview

This article explores how application state can be modeled incorrectly, introducing the MIRO framework for identifying and fixing state-related bugs.

## Core Concepts

### What is State?

State describes the current condition of a system. Examples include an oven being on, a broken traffic light, or dark-mode settings.

### The Four Levels of State

1. **The Real World** - Complex, messy reality with infinite details
2. **Abstract State** - A simplified, useful subset mapping from reality
3. **Concrete State** - The actual data types representing abstract states
4. **Interpretation** - Code that uses the concrete state

### Abstraction Mapping

"An abstraction is a mapping from a complex set to a simpler one, where operations and results in the abstract domain still tell us something relevant about the original set."

The goal of data modeling is achieving one-to-one mappings between abstract and concrete states.

## The Four MIRO Problems

### 1. Missing States

**Definition:** Abstract states exist that the concrete state cannot express.

**How to Spot:** Requirements that are straightforward but impossible due to insufficient expressiveness.

**Fix:** Add unique concrete states. Example: representing empty lists with `just(value) | nothing()` instead of allowing undefined returns.

### 2. Illegal States

**Definition:** Concrete states with no corresponding abstract state.

**How to Spot:** Settings or options that "only apply if X is activated" but allow selection anyway, causing undefined behavior.

**Fix:** Remove concrete states. Use union types to make illegal combinations unrepresentable:

```typescript
type Settings = {
  extraFx: Off | ExtraFxOptions;
};
```

### 3. Redundant States

**Definition:** Multiple ways to represent a single abstract state.

**How to Spot:** Options that produce no effect when selected in certain contexts.

**Fix:** Remove concrete states. Eliminate duplicate representations.

### 4. Overloaded States

**Definition:** One concrete state representing two different abstract states.

**How to Spot:** UI showing "no messages" then data appearing moments later suggests ambiguity between "empty" and "not loaded yet."

**Fix:** Add unique concrete states using discriminated unions:

```typescript
type State = NotAsked | Loading | Success<List<number>> | Failure<string>;
```

This distinguishes between "never requested" and "empty response."

## The MIRO Mnemonic

When designing data models, avoid **MIRO** states:

- **M**issing
- **I**llegal
- **R**edundant
- **O**verloaded

Alternative: Use **MISO** if you replace Redundant with Superfluous.

## Key Principle

The strongest solution involves making the concrete state stricter so illegal states become unrepresentable. This prevents bugs at the type level rather than relying on correct interpretation code.
