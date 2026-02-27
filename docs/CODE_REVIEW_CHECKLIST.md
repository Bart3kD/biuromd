# Code Review Checklist

This document contains the comprehensive code review checklist for this project, with real examples from past code reviews. Use this checklist when reviewing PRs or when self-reviewing before submitting.

## How to Use

### In GitHub PR

Comment `/code-review` on any PR to trigger an automated review using Claude.

### In Claude Code CLI

Run `/cc:code-review` to review your current changes.

### Manual Review

Go through each category below when reviewing code.

---

## Getting the Diff (IMPORTANT)

### Three-Dot Diff vs Two-Dot Diff

**CRITICAL**: Always use three-dot diff semantics when reviewing branch changes. GitHub PRs use three-dot diffs.

- **Three-dot diff** (`main...HEAD` or merge-base approach): Shows only changes introduced on the current branch since it diverged from main. This is what GitHub shows in PRs.
- **Two-dot diff** (`git diff main` or `main..HEAD`): Shows ALL differences between current state of main and HEAD, including changes made to main after the branch was created.

Using two-dot diff will incorrectly flag files that were changed on main (not the PR branch), leading to false positives like "removed code" that wasn't actually removed by the PR.

### How to Get the Correct Diff

| Situation                          | Command                                                                |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Reviewing a PR by number           | `gh pr diff <number>`                                                  |
| Reviewing current branch changes   | `bun scripts/github-like-pr-diff-against-main.ts`                      |
| Reviewing specific files on branch | `bun scripts/github-like-pr-diff-against-main.ts` then filter to paths |

**❌ NEVER use these for branch reviews:**

- `git diff origin/main` (two-dot)
- `git diff main..HEAD` (two-dot)

**✅ ALWAYS use:**

- `gh pr diff <number>` for PRs
- `bun scripts/github-like-pr-diff-against-main.ts` for local branch review

---

## Checklist Categories

### 1. Steve Jobs Test (Clarity & Simplicity)

**Questions to Ask:**

- Can you state clearly what this file/module/function does?
- From a 10km view, how complex should this thing be? Is the code more complex than that?

**Pass Criteria:** Each component has a single, clear purpose expressible in one sentence.

---

### 2. Generalization Over Specificity

**Questions to Ask:**

- Is there code written for something specific that could be expressed more generally?
- Remember: general code = fewer details = simpler

**Real Example:**

```typescript
// File: frontend/src/components/App/routes/mcp/McpForm.svelte
// ❌ Problem: Parsing logic specific to MCP that's actually generic
function parseImport(text: string): Partial<McpServer> | null {
  try {
    const lines = text.split("\n");
    let inFrontmatter = false;
    let frontmatterLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "---") {
        if (inFrontmatter) {
          break;
        } else {
          inFrontmatter = true;
        }
      }
    }
    // ...
  }
}

// Review comment: "most of the code in this function is not specific to MCP,
// so make something reusable that can do the parsing (or if such a thing exists, use it)"
```

---

### 3. Reinventing the Wheel

**Questions to Ask:**

- Did you solve a problem that sounds like it should have been solved before?
- Is there a library or utility in the codebase that already does this?

**Real Example:**
Writing a custom state persistence utility when `runed`'s `PersistedState` already exists in the codebase. See PR #326.

---

### 4. The 7 Mistakes That Cause Fragile Code

#### 4.1 Excessive Error Checking (Missing Preconditions)

Having many guards indicates missing preconditions, imprecise types, or missing data structure invariants.

**Real Example:**

```typescript
// File: backend/src/mastra/workflows/steps/index.ts
// ❌ Problem: Failing quietly when model is missing
if (!model) {
  console.warn(
    "[Title Generation] No AI model available, keeping default title",
  );
}

// Review comment: "Is it reasonable for this code to be entered when no fast model exists?
// Is it good to fail quietly? I think not, and it should error far before this step."
```

#### 4.2 Refactoring is not Boxing

Don't extract things just because they're duplicated. Extract only if there's a sensible, simple concept with a clear name.

#### 4.3 Code Quality is About Data Structures

Start programming by figuring out the right data structures first.

#### 4.4 Getting Stuck in Old Design

AIs often leave old versions for "backwards compatibility" even when unnecessary. Be aggressive about proposing changes to adjacent limiting code.

---

### 5. Hidden Layer of Logic

**Questions to Ask:**

- Do methods have preconditions not cleanly expressed in the API?
- Can everything be shown correct by local reasoning?
- Does understanding this function require reading the functions it calls?

**Defense Priorities:**

1. Reduce statefulness
2. Use fluent APIs, tokens, or API techniques
3. Better names (including `longNamesThatTellYouWhenTheyShouldBeCalled`)
4. Comments and documentation

---

### 6. Embedded Design Principle

#### 6.1 Better Types Waiting to Jump Out

**Signs:**

- Multiple fields being moved around in tandem
- Using generic `number`/`string` types for something specific (especially IDs)

**Real Example:**

```typescript
// File: frontend/src/components/App/routes/mcp/McpForm.svelte
// ❌ Problem: Destructuring and grabbing identical fields
description: metadata.description,
type: metadata.type || "stdio",
command: metadata.command,
name: parsed.metadata.name,

// Review comment: "this is a sign that this thing should be passing around the metadata
// directly and not destructuring it. Also, should perhaps have a default metadata
// rather than applying the defaults to each field."
```

#### 6.2 Plain English Test

State in plain English how the thing works, and make the code match that.

#### 6.3 Linguistic Antipatterns

Check: https://www.linguistic-antipatterns.com/

#### 6.4 File/Function Sectioning

Use H1/H2/H3 section comments for mental chunking:

```typescript
// #######################################
// H1 SECTION
// #######################################

// ##############################
// H2 Section
// ##############################

// ####################
// H3 Section
// ####################
```

#### 6.5 Hidden Coupling

Use CONSPICUOUSLY_NAMED_TAGS to tie together related code:

```typescript
// First occurrence:
// Comment STRICT_MINITEMS 2025.04.18: We use minItems constraint, not supported in strict mode
strict: false,

// Other occurrences:
// See comment STRICT_MINITEMS
strict: false,
```

**Real Example:**

```typescript
// File: frontend/src/components/App/routes/settings/PairMachine.svelte
// ❌ Problem: Magic numbers without explanation
return id === "local" ? "localhost:3000" : "cc.dev";

// Review comment: "magic numbers"
```

#### 6.6 Non-obvious Code Needs Comments

If serious debugging was needed for a single line, add a comment explaining why.

#### 6.7 Named and Dated References

Comments referencing anything outside adjacent code should be named and dated:

```typescript
// TODO jkoppel 2025.05.01: Do X once we support Y
// NOTE note89 2025.04.18: This is here because function X internally does Y
```

**Always use YYYY.MM.DD format** (not American or European formats).

---

### 7. Representable/Valid Principle

**Questions to Ask:**

- Are invalid states unrepresentable?
- Are there consecutive arguments of the same type (misuse opportunity)?

**Real Examples:**

```typescript
// File: frontend/src/components/App/routes/mcp/McpManager.svelte
// ❌ Problem: Using empty string for "no error"
let error = $state("");

// Review comment: "undefined would be preferred compared to empty string"

// ❌ Problem: Using null instead of undefined
let editingServer = $state<McpServer | null>(null);

// Review comment: "We have decided on undefined being used instead of null to represent missing"
```

---

### 8. Structured Over Unstructured Types

Avoid specially-formatted strings when structured types would be better.

**Real Examples:**

```typescript
// File: frontend/src/components/App/routes/settings/PairMachine.svelte
// ❌ Problem: Accepting string that should be Date
function formatIso(iso: string | null): string {

// Review comment: "seems like this may break something downstream.
// maybe formatIso(iso: Date): string"
```

```typescript
// File: backend/src/services/snapshots/snapshot-service.ts
// ❌ Problem: Parsing JSON from commit message string
const lines = commitMessage.trim().split("\n");
const jsonStartIndex = lines.findIndex((line) => line.trim().startsWith("{"));

// Review comment: "would prefer that the commit message actually be JSON
// so this parsing logic isn't needed. Where's the code that produces this JSON?"
```

---

### 9. Data Over Code Principle

#### 9.1 Type Transparency

Can internal changes break other code? Can you be sure without reading the rest?

#### 9.2 Group Related Functions

Should functions operating on the same data be grouped into a type or namespace?

#### 9.3 Invariants Over Checks

**Real Example:**

```typescript
// File: backend/src/services/snapshots/snapshot-service.ts
// ❌ Problem: Sorting snapshots every time they're used
const sortedSnapshots = [...this.snapshots].sort(...)

// Review comment: "Can we make it so that snapshots are just already stored in sorted order?"
// Making "this.snapshots is always sorted" an invariant simplifies other code.
```

---

### 10. Algebraic Refactoring

**Questions to Ask:**

- Would loops be cleaner with map/filter/reduce?
- Can code be simplified?

**Real Example:**

```typescript
// File: frontend/src/components/snapshots/SnapshotsPanel.svelte
// ❌ Problem: Complex conditional
if (direction === "prev") {
  newIndex = currentIndex > 0 ? currentIndex - 1 : children.length - 1;
}

// ✅ Suggested fix:
newIndex = max(0, currentIndex - 1);
```

---

### 11. Future-Proofing

#### 11.1 "Old Lives Long" APIs

Think carefully about:

- APIs that will get lots of usage
- Data read by older versions
- Communication between multiple versions

#### 11.2 Parnas Subset Criterion

- A may use B if A is simpler because it uses B
- B should not be more complex because it can't use A
- No conceivable subset should contain A but not B
- **Don't let something general depend on something specific**

**Real Example:**

```typescript
// File: backend/src/mastra/models/models.ts
// ❌ Problem: Model file containing agent-specific code
const AGENT_TYPES = ["claude-code", "codex", "gemini"] as const;

// Review comment: "There should not be anything about agents in this file
// because this file is about uses of models through the API."
```

---

## Advanced Design Principles

_Based on the Advanced Software Design course_

### U1. Ghosts & Implicit Invariants

**Questions to Ask:**

- Are there implicit invariants the code depends on but never documents?
- Would modifying seemingly unrelated code break assumptions here?
- Are there ordering requirements between operations not enforced by types?

**Smell Patterns:**

- Comments like "don't change this order" or "must be called after X"
- Code that only works because of side effects elsewhere
- Tests that fail mysteriously when run in different order

**Key Question:** What would break if someone modified adjacent code without knowing about this code?

**Reference:** See `docs/articles/ghosts-and-implicit-invariants.md`

---

### U2. Plain English Test

**Questions to Ask:**

- Can you describe what this code does in ONE simple sentence?
- Does the explanation require "...and also..." or "...except when..."?
- Does the code structure match how you'd explain it to a colleague?

**Red Flags:**

- Functions doing multiple unrelated things
- Names that don't match the simple explanation
- "Helper" code that is actually doing the real work
- High parameter count indicating conflated responsibilities

**Reference:** See `docs/articles/embedded-design-principle.md`

---

### U5. Algebraic Simplification

**Questions to Ask:**

- Can this expression be simplified using algebraic laws?
- Are there nested conditionals that could be flattened?
- Could sum types (discriminated unions) replace complex conditionals?

**Algebraic Smell Patterns:**

- Boolean parameters that create two different "modes" of operation
- Functions returning booleans that callers immediately switch on
- Pairs where one field determines interpretation of another
- Multiple code paths that are structurally identical

**Reference:** See `docs/articles/algebraic-simplification.md`

---

### U6. Complexity Ratchets

**Questions to Ask:**

- Does this change make future changes harder?
- Are there "one-way doors" - easy decisions that are hard to undo?
- Is the code accumulating special cases rather than generalizing?

**Complexity Ratchet Signs:**

- Adding a boolean parameter instead of rethinking the design
- Special-casing for one client/use-case that others will copy
- Hardcoding values that will inevitably need to change
- Workarounds that become load-bearing
- Comments like "TODO: generalize this later"

**Key Question:** Before making this change, will it make the next change easier or harder?

**Reference:** See `docs/articles/complexity-ratchets.md`

---

### 12. JS/TS-Specific

#### 12.1 Use Full Power of Zod

Know about: `.transform`, `.refine`, `.superRefine`, defaults in schema definition

**Real Example:**

```typescript
// File: frontend/src/components/App/routes/mcp/McpForm.svelte
// ❌ Problem: Manual defaults instead of using Zod
const cleanData = {
  ...formData,
  name: formData.name || "Default Server",
  description: formData.description || undefined,
  type: formData.type || "stdio",
  command: formData.command || "",
  args: formData.args || [],
  env: formData.env || {},
  enabled: formData.enabled !== false,
  order: formData.order || 0,
};

// Review comment: "cannot zod do this? you have set defaults etc in its definition already"
```

#### 12.2 Avoid Type Casts (`as` keyword)

Type casts usually indicate messed up types elsewhere.

**Real Example:**

```typescript
// ❌ Problem: Type cast hiding a type problem
this._modelName = (config.options?.model as string | undefined) ?? "sonnet";

// Review comment: "The need to use an `as` here almost certainly means
// that config.options has the wrong type."
```

---

### 13. Frontend-Specific (Svelte)

#### 13.1 Styles in Style Section

Prefer `<style>` section over inline Tailwind classes.

**Real Example:**

```svelte
<!-- File: frontend/src/components/shared/NotificationToast.svelte -->
<!-- ❌ Problem: All styles inline -->
<div class="fixed top-4 right-4 z-50 max-w-md rounded-lg border bg-background p-4 shadow-lg...">

<!-- Review comment: "Can you move all this stuff into the style section?
I'm kinda bearish on using the Tailwind style of making every attribute its own class,
when in Svelte it's so easy to do it directly." -->
```

---

### 14. Performance

**Question to Ask:**

- If anything expensive (like LLM calls) is in a loop, is it parallelized?

---

### 15. PR Discipline

#### 15.1 Correct PR Target

- If branching off a branch, target should be the base branch, not main
- When base branch is merged, target should change to main

**Real Example:**

```
// Review comment on outdated PR:
// "First thought: Seems quite manual -- we'll want a more general way to do this
// Second thought: Wait, it stopped being the case...
// Third thought: Wait, why does the handlePointerLeave function not appear in my checkout?
// Fourth thought: Tomasz, this is an old PR you've taken. You should probably retarget it to main."
```

---

### 16. Theme Compliance (Svelte Components)

**Questions to Ask:**

- Are hardcoded colors replaced with CSS variables?
- Are design tokens used for spacing and sizing?
- Does the component respect theme switching?

**Pass Criteria:** All new/modified components use theme variables exclusively.

**Common Violations:**

**Hardcoded Colors:**

```css
/* ❌ Problem: Hardcoded colors break theming */
.component {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #333333;
}

/* ✅ Fix: Use theme variables */
.component {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
}
```

**Hardcoded Spacing:**

```css
/* ❌ Problem: Hardcoded spacing values */
.component {
  padding: 16px;
  margin: 8px;
  border-radius: 8px;
}

/* ✅ Fix: Use design tokens */
.component {
  padding: var(--space-md);
  margin: var(--space-xs);
  border-radius: var(--corner-radius-md);
}
```

**Tailwind with Hardcoded Colors:**

```svelte
<!-- ❌ Problem: Hardcoded Tailwind colors -->
<div class="bg-gray-900 text-white border-gray-700">

<!-- ✅ Fix: Use semantic tokens -->
<div class="bg-background text-foreground border-border">
```

**Transparency Patterns:**

```css
/* ❌ Problem: Hardcoded opacity */
.component {
  background: rgba(26, 26, 26, 0.9);
}

/* ✅ Fix: Use HSL pattern or color-mix */
.component {
  background: hsl(var(--primary) / 0.9);
  /* or */
  background: color-mix(in srgb, var(--card) 90%, transparent);
}
```

**Reference:** See `THEMING.md` for complete guidelines, available variables, and usage patterns.

---

### 17. Naming (Linguistic Antipatterns)

Names should reflect actual scope, not call site context.

**Real Example:**

```typescript
// File: backend/src/services/snapshots/snapshot-service.ts
// ❌ Problem: Name encodes caller context
private async fallbackToStandardDiff() {

// Review comment: "The name of this function encodes information about where it's called
// in the context of a specific caller. I generally don't think that function names
// should be based on such things -- call this something like just `standardDiffWithStats`.
// But if it's actually standard... is that operation never done elsewhere?"
```

---

## Quick Reference Scoring

| Score      | Meaning                                       |
| ---------- | --------------------------------------------- |
| ✅ Pass    | Category requirements fully met               |
| ⚠️ Warning | Minor issues that should be addressed         |
| ❌ Fail    | Serious issues requiring changes before merge |
| ➖ N/A     | Category not applicable to these changes      |

## Related Resources

### Internal Documentation (docs/articles/)

**Core Frameworks:**

- `11-aspects-of-good-code.md` - The 11 Aspects of Good Code
- `7-mistakes-fragile-code.md` - 7 Mistakes That Cause Fragile Code

**Advanced Design Principles (Course Units):**

- `ghosts-and-implicit-invariants.md` - Unit 1: Hidden Layer of Logic
- `embedded-design-principle.md` - Unit 2: Design Coherence
- `algebraic-simplification.md` - Unit 5: Equational Reasoning
- `complexity-ratchets.md` - Unit 6: RAD Process and Future-Proofing
- `the-three-levels-of-software.md` - Runtime, Implementation, Logic levels

**Design Patterns & Techniques:**

- `parse-dont-validate.md` - Parse, Don't Validate
- `boolean-blindness.md` - Boolean Blindness antipattern
- `defunctionalization-refactoring.md` - Converting functions to data
- `type-safety-back-and-forth.md` - Type safety patterns
- `state-of-emergency-miro.md` - MIRO: Make Invalid Representable Only
- `modules-matter-most.md` - Module design principles
- `should-you-split-that-file.md` - File organization guidance
- `abstraction-not-what-you-think.md` - What abstraction really means
- `design-of-software-thing-apart.md` - Design as separate artifact
- `linguistic-antipatterns.md` - Naming antipatterns

### External

- [Learn Advanced Software Design](https://self-service.mirdin.com) - Full course
