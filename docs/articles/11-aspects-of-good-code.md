---
title: "The 11 Aspects of Good Code"
author: "James Koppel"
source: "https://www.pathsensitive.com/2023/07/the-11-aspects-of-good-code.html"
archived: "2025-01-18"
tags: [design, quality, aspects, principles]
---

# The 11 Aspects of Good Code

## Overview

James Koppel's essay explores what constitutes quality code beyond surface-level aesthetics. He argues that code quality discussions permeate programming education and careers, yet the underlying purpose often gets lost.

## External Properties (What Code Must Achieve)

### 1. Good Code is Done Code

Functioning software that accomplishes its intended purpose is foundational. However, "code that fails to achieve its purpose cannot have extrinsic quality."

Non-functional requirements matter too—performance sluggishness that drives users away undermines quality. Yet shipping working code doesn't excuse design that makes future changes take years.

### 2. Good Code is Understandable

Code must be comprehensible to its readers at the moment they need to understand it. This requires balancing two extremes:

- **The timid approach**: Refusing to learn powerful techniques for fear others won't understand them
- **The arrogant approach**: Assuming readers will learn whatever techniques you use

The master engineer breaks beyond this false choice entirely, enabling readers to grasp the code through excellent design.

### 3. Good Code is Evolvable

Software exists within changing systems and worlds. "Every software engineer carries the professional burden of building software that is easy to change."

Good code should be easy to extend without becoming brittle. This doesn't require predicting specific future changes, but rather designing for the reality that change will occur.

## Internal Properties (How to Build Quality)

### 4. Good Code Can Be Understood Modularly

Each line should serve a clear, isolatable purpose. "Each line can be understood in isolation" by reasoning about simple state transitions.

Code that works through mysterious interdependencies between distant parts creates debugging nightmares. Quality code clicks together like building blocks.

### 5. Good Code Makes Intent Recoverable

Programmers transform dreams into mechanisms into code. Readers reverse this process to understand the original vision.

Naming, function design, and module creation should guide readers toward recovering the programmer's original intent through carefully chosen words and structures.

### 6. Good Code Expresses Intent in a Single Place

Changes should ripple from one location, not require coordinated tweaks throughout the codebase. Like a dark mode requiring only color specification rather than thousands of manual adjustments.

### 7. Good Code is Robust

When every line serves a purpose, every line must be correct. "If you must think as hard as you can to check that a program works, it probably doesn't."

Quality APIs have guardrails—impossible to misuse or fail silently. Ideally, "if it compiles, it probably works."

### 8. Good Code Hides Secrets

Internal implementation details shouldn't leak to dependent systems. When details remain hidden, platforms can evolve without breaking external code.

The master engineer knows what not to expose—creating firewalls within their own mind and in code architecture.

### 9. Good Code Isolates Assumptions

Every datum that flows through the system ties it to the current world. When intermediate functions depend on specific representations, changes become expensive.

Passing data as sealed packages, agnostic to internal structure, enables evolution without cascading rewrites.

### 10. Good Code is Open

Programs should remain agnostic about the sizes of sets they handle—whether an entity has two options, three, or many.

When code is open to growth in its domain, deprecating options requires no rewrites; new capabilities integrate cleanly.

### 11. Good Code Uses a Programmer's Full Wisdom

Beyond learning established principles, the deepest practitioners search for connections between buckets of knowledge. They dissolve the boundaries between concepts to understand the interconnected whole.

This enables creating new explanations and approaches unavailable to those content with mere competence.

## Key Insight

Koppel emphasizes: "The pursuit of code quality isn't about prettiness but about enabling engineers to work effectively across a program's lifetime." Quality manifests as code that survives change, prevents bugs, and communicates intent—not through decoration, but through disciplined design choices.
