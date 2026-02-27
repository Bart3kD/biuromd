---
title: "Linguistic Antipatterns in Code"
author: "Venera Arnaoudova et al."
source: "https://www.linguistic-antipatterns.com/"
archived: "2025-01-18"
tags: [naming, antipatterns, intent, readability]
---

# Linguistic Antipatterns in Code

## Overview

A linguistic antipattern is a "recurring poor practice in the naming, documentation, and choice of identifiers" that impairs program comprehension. These arise when names predictably mislead developers about what code actually does.

## Origin

Researchers led by Venera Arnaoudova first systematized this concept through empirical studies of real codebases. Their work identified 18 specific patterns by analyzing naming conventions and validating findings with professional engineers and graduate students.

This website consolidates those 18 narrow patterns into 3 broader categories, then adds new patterns derived from real debugging stories.

## Primary Antipattern Categories

### 1. Confusable Methods

**Description**: A class or namespace contains multiple functions with similar names but different behaviors. Programmers may inadvertently call the wrong function, and casual testing might not reveal the mistake.

**Java Threading Example**:

- `Thread.start()` launches code on a background thread
- `Thread.run()` executes code on the current thread

Calling `run()` when you meant `start()` produces working but slow code—the bug hides for extended periods.

**PyYAML Example**:
The library changed between versions 3.12 and 4.1. Originally, `load()` was unsafe while `safe_load()` was secure. Later revisions flipped this, creating security vulnerabilities masked by familiar function names.

**Core Principle**: This violates the Representable/Valid Principle—error states should be impossible to reach accidentally. When dangerous and safe options have similar names, even rigorous code review may fail to catch mistakes.

### 2. Inappropriately-Specific Names

**Description**: Names that encode information about call-site context rather than what the function actually does.

**Example**:

```typescript
// BAD: Name encodes caller context
private async fallbackToStandardDiff() { ... }

// GOOD: Name describes what it does
private async standardDiffWithStats() { ... }
```

Function names should reflect their actual scope and behavior, not where they happen to be called from.

### 3. Incorrect Associated Specifications

**Description**: Comments, documentation, or type signatures that don't match actual behavior.

### 4. Missing Implied Return Types

**Description**: Function names that suggest a return value but return void, or vice versa.

**Example**:

```typescript
// BAD: "get" implies returning something
function getUser(): void { ... }

// GOOD: Name matches behavior
function fetchUser(): Promise<User> { ... }
```

### 5. Name/Type Mismatches

**Description**: Variable or parameter names that contradict their types.

**Example**:

```typescript
// BAD: Name says array, type is single item
const users: User = ...

// GOOD: Name matches type
const user: User = ...
```

### 6. Unexpected Side Effects

**Description**: Functions with names suggesting pure computation that actually mutate state.

**Example**:

```typescript
// BAD: "calculate" suggests no side effects
function calculateTotal(): number {
  this.lastCalculation = Date.now(); // Hidden side effect!
  return this.items.reduce(...);
}

// GOOD: Name indicates mutation
function calculateAndRecordTotal(): number { ... }
```

## Key Takeaway

Linguistic antipatterns cause bugs by creating a gap between what developers expect (based on names) and what code actually does. The fix is ensuring names accurately communicate behavior, side effects, and relationships.

## Prevention Checklist

- [ ] Do function names accurately describe what they do?
- [ ] Do similar names in the same scope have clearly different behaviors?
- [ ] Do "get/is/has" prefixes return values?
- [ ] Do "set/update/save" prefixes mutate state?
- [ ] Does documentation match actual behavior?
- [ ] Are type signatures consistent with naming conventions?
