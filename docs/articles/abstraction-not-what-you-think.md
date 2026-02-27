---
title: "Abstraction: Not What You Think It Is"
author: "James Koppel"
source: "https://www.pathsensitive.com/2022/03/abstraction-not-what-you-think-it-is.html"
archived: "2025-01-18"
tags: [abstraction, design, anti-unification, boxing, indirection]
---

# Abstraction: Not What You Think It Is

"Abstraction" in software engineering is fundamentally misunderstood. The term conflates multiple unrelated concepts, creating confusion in technical discussions.

## Five Things That Aren't Abstraction

### 1. Functions

Lambda calculus uses "abstraction" merely to mean creating a function. This usage differs markedly from how the term is employed elsewhere and has unfortunately influenced broader programming discussions about "abstracting into functions."

### 2. Anti-unification

This describes finding similarities between code snippets and extracting shared logic—essentially the DRY principle. While syntactically similar code gets extracted into parameterized functions, this is **pattern-matching, not true abstraction.**

### 3. Boxing

Excessive anti-unification creates bloated functions with many conditionals and parameters. As Sandi Metz notes, programmers add parameters and conditional logic to preserve "existing abstractions" that no longer apply uniformly, undermining code clarity.

### 4. Indirection

Jumping between files or through layers of single-line function calls to understand code—common in Enterprise Java patterns—creates complexity without meaningful abstraction benefits.

### 5. Interfaces and Typeclasses

These polymorphic mechanisms allow multiple implementations but don't guarantee conceptual coherence. Julia's `getindex` interface has 188 implementations, most doing lookups but some doing the opposite.

## True Abstraction (Abstract Interpretation)

Drawing from PL theory, specifically abstract interpretation:

**Abstractions are mappings** between concrete and abstract domains that enable reasoning about complex systems using simplified models.

Key properties:

- **Soundness**: Following any path through the mapping produces equivalent results
- **Precision**: Operations yield deterministic or near-deterministic results in the abstract domain
- **Size efficiency**: The abstract representation uses fewer bits than concrete data

### The Restaurant Booking Example

Consider a restaurant reservation system. Multiple abstractions exist:

1. Carol's current bookings: `[]` or `[7-8 PM]`
2. Available time slots across all tables
3. Bob's reservations (unaffected by Carol's booking)

Each abstraction enables different precise reasoning about the system without requiring knowledge of implementation details.

## Critical Insights

**Abstractions exist outside code.** They aren't properties of functions or interfaces but rather _patterns we impose_ for understanding behavior. Code can support multiple abstractions simultaneously without modification.

**The question "Is X an abstraction?" is always answerable with "yes,"** but that's uninteresting. More useful: **"Which operations can be tracked precisely using this mapping?"**

A TV's serial number technically abstracts the device, but nearly every operation (turning it on, changing channels) leaves the serial unchanged—maximally imprecise.

**Good abstractions enable a "new semantic level on which one can be absolutely precise,"** quoting Dijkstra. This precision allows reasoning about complex behavior through simple abstract states.

## Resolving Confusion

The misunderstanding stems from correctly intuiting that reasoning about code while ignoring details is desirable, then fixating on code entities (functions, interfaces) rather than examining the actual mappings between domains.

- **Functions** support abstractions over their steps but aren't themselves abstractions
- **Anti-unification** often extracts patterns with similar abstract properties, but wrongly merged patterns cause boxing
- **Indirection** may coincide with abstraction but creates complexity independently
- **Polymorphic mechanisms** succeed when implementations share a well-defined abstract domain

## Practical Takeaway

Rather than asking "Is this an abstraction?" ask:

> **"What precise operations can I describe using this mapping?"**

This reframes scattered debates about code organization into coherent discussions about concrete-to-abstract relationships and their utility.

## Application to Code Review

When reviewing code, ask:

- [ ] Does this "abstraction" enable precise reasoning, or just add indirection?
- [ ] Are extracted functions conceptually unified, or just syntactically similar (boxing)?
- [ ] What operations can be tracked precisely using this interface?
- [ ] Would inlining this function make the code clearer (bad abstraction)?
- [ ] Is this polymorphism backed by a coherent abstract domain?
