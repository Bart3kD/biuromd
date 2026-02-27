---
title: "The Three Levels of Software: Why Code That Never Goes Wrong Can Still Be Wrong"
author: "James Koppel"
source: "https://www.pathsensitive.com/2018/01/the-three-levels-of-software-why-code.html"
archived: "2025-01-18"
tags: [design, correctness, modularity, reasoning, hidden-logic]
---

# The Three Levels of Software

Why code that never goes wrong can still be wrong.

## Overview

James Koppel explores three distinct levels at which software can be evaluated for correctness, moving beyond simple runtime behavior to encompass design and logical reasoning.

## The Three Definitions of "Wrong"

### Definition 1: Runtime Level

A program is wrong if it produces an incorrect result during execution. This is the most obvious category—when actual behavior deviates from expected outcomes.

### Definition 2: Concrete Implementation Level

"A program is wrong if there exists some environment, sequence of events, or other 'input' under which it produces a wrong result." This expands wrongness to include potential failures not yet encountered.

### Definition 3: Logic/Design Level

Most importantly, **"A program is wrong if the reasoning for why it should be correct is flawed."** Code may function perfectly in practice while violating its own specifications.

## The Three Levels Explained

### Level 1: Runtime

Deals with specific values during particular executions. Debugging at this level involves examining actual traces and states through tools like debuggers and print statements.

### Level 2: Concrete Implementation/Code

Concerns what the current implementation could do with arbitrary inputs and environments. Focuses on the actual codebase without assuming global knowledge about systems or future changes.

### Level 3: Logic/Design

Examines abstract specifications and modular components. Each unit should be reasoned about independently using only its contract, not implementation details of dependencies.

## The SimCity Example

The classic illustration involves SimCity's use-after-free bug. At the concrete implementation level under DOS, the code worked perfectly—freed memory remained accessible until the next allocation. However, at the logical level, this violated memory management contracts.

When Windows 3.1 introduced a different memory manager, SimCity crashed. "Microsoft had to add a special case to check if SimCity was running and switch to a legacy memory manager if so," demonstrating how implementation-level assumptions become brittle when environments change.

## Key Insight: Modular Reasoning

Errors at the logical level are **"errors of modular reasoning."** Functions exhibiting such errors cannot be verified correct by examining only their code and their dependencies' contracts. Instead, verification requires understanding implementation details throughout the entire system—destroying modularity and hindering maintainability.

This distinction explains why software engineering principles like encapsulation and modularity matter: they enforce the separation between specification guarantees and implementation details.

## Formal Reasoning Levels

- **Ground reasoning**: Reasoning about concrete values in specific executions
- **First-order logic**: Reasoning about all possible executions of code
- **Higher-order logic**: Reasoning about all possible implementations satisfying a specification

## Practical Implications

Software design should prioritize logical correctness because systems must remain maintainable across future modifications. The misspelled HTTP "referer" header and SimCity's workaround persist decades later, illustrating how specification violations become permanent technical debt.

API designers should enforce specifications strictly, particularly in debug modes, to prevent subtle violations from propagating through systems.

## Application to Code Review

When reviewing code, ask:

- [ ] Can this function be understood using only its contract and its dependencies' contracts?
- [ ] Does the code rely on implementation details that could change?
- [ ] Would this code break if a dependency changed its implementation (but not its contract)?
- [ ] Are there hidden assumptions about the environment or execution order?
