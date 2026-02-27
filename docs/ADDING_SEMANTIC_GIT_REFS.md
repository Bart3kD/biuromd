# Adding Semantic Git References

This document explains how to add new semantic git references (like `PARENT_COMMIT` for HEAD~1) to the CommandCenter codebase.

## Architecture Overview

The codebase uses **branded types** and **discriminated unions** to model Git references. This design follows the principle of **Lazy Resolution**: we want to preserve the "Intent" of a reference as long as possible and only resolve it to a concrete string when passing it to the Git CLI.

### The Hierarchy

```
GeneralGitRef
├── SemanticRef (Abstract Concepts)
│   ├── DEFAULT_BRANCH ("The main integration branch")
│   └── PARENT_BRANCH  ("The branch I forked from")
│
└── ResolvedGitRef (Execution-Ready)
    ├── GitSHA         ("a1b2c3...")
    ├── HEAD           ("The current state")
    ├── PARENT_COMMIT  ("HEAD~1")
    ├── WORKING_TREE   (Uncommitted changes)
    └── STAGED_ONLY    (Staged changes)
```

### Concept: Lazy Resolution

Just as a `NOW()` function in a database shouldn't be resolved to a timestamp until the query actually runs, dynamic Git references should be passed to Git as-is whenever possible.

- **Bad (Eager Resolution):**
  - User selects "Parent Commit".
  - Frontend calls `git rev-parse HEAD~1` -> returns `a1b2c3`.
  - Frontend requests diff for `a1b2c3`.
  - _Problem:_ If the user commits in the meantime, `a1b2c3` is no longer the parent. It's stale.

- **Good (Lazy Resolution):**
  - User selects "Parent Commit".
  - Frontend passes `{ type: 'parent_commit' }`.
  - Backend recognizes this corresponds to the git-native `HEAD~1`.
  - Backend passes `HEAD~1` to `git diff`.
  - _Result:_ Git resolves it at the exact moment of execution.

## Adding a New Semantic Ref (e.g., PARENT_COMMIT)

### Step 1: Define the Type (shared/src/git/git-types.ts)

```typescript
// 1. Add the constant
export const PARENT_COMMIT = { type: "parent_commit" as const };

// 2. Add to SpecialRef union
export type SpecialRef =
  | typeof WORKING_TREE
  | typeof STAGED_ONLY
  | typeof HEAD
  | typeof DEFAULT_BRANCH
  | typeof PARENT_BRANCH
  | typeof PARENT_COMMIT; // NEW

// 3. Decide: Needs Backend Resolution?
//
// Ask: "Does Git understand this natively?"
// - YES (HEAD, HEAD~1): Add to ResolvedGitRef. Resolution is a no-op.
// - NO (DEFAULT_BRANCH, "My Fork's Parent"): Add to SemanticRef. Needs logic.

export type ResolvedGitRef =
  | GitSHA
  | typeof WORKING_TREE
  | typeof STAGED_ONLY
  | typeof HEAD
  | typeof PARENT_COMMIT; // NEW - git understands HEAD~1
```

### Step 2: Add Encoding/Decoding

In `shared/src/git/git-types.ts`, update the `GeneralGitRef` namespace:

```typescript
// The namespace provides encode/decode methods
export namespace GeneralGitRef {
  // In decode (String -> Object)
  export const decode = (str: string): GeneralGitRef =>
    match(str)
      // ... existing cases
      .with("HEAD~1", () => PARENT_COMMIT) // Handle the native git syntax
      .with("__PARENT_COMMIT__", () => PARENT_COMMIT) // Handle our internal encoding
      .with(P.string, (sha) => {
        if (!GIT_SHA_REGEX.test(sha)) {
          throw new Error(`Invalid commit reference: ${sha}`);
        }
        return sha as GitSHA;
      })
      .exhaustive();

  // In encode (Object -> String)
  export const encode = (ref: GeneralGitRef): EncodedGitRef =>
    match(ref)
      // ... existing cases
      // NEW: For Resolved refs, return the string Git expects
      .with(PARENT_COMMIT, () => "HEAD~1")
      .exhaustive() as EncodedGitRef;
}
```

**Usage:**

```typescript
// Encoding (Object -> String for URLs/storage)
const encoded = GeneralGitRef.encode(PARENT_COMMIT); // "HEAD~1"

// Decoding (String -> Object)
const decoded = GeneralGitRef.decode("HEAD~1"); // { type: "parent_commit" }
```

### Step 3: Backend Resolution

In `backend/src/services/git/git-service.ts`, the `resolveGitRef` function acts as the barrier between "Abstract Intent" and "Execution Ready".

**If you added a `ResolvedGitRef` (like PARENT_COMMIT):**
You generally **do not** need to touch `resolveGitRef`. The type system understands that `PARENT_COMMIT` is already a `ResolvedGitRef`, so it will be passed through as-is.

**If you added a `SemanticRef` (like DEFAULT_BRANCH):**
You must implement the logic to resolve it to a concrete SHA or Ref.

```typescript
// Only needed for SemanticRefs
.with(DEFAULT_BRANCH, async () => {
  const mergeBase = await getMergeBaseWithDefaultBranch(repoPath);
  return mergeBase; // Returns a GitSHA
})
```

## Design Principles

### 1. Parse, Don't Validate

We parse the user's intent into a specific type (`PARENT_COMMIT`) rather than passing around loose strings like `"HEAD~1"`. This makes illegal states unrepresentable (you can't accidentally pass `"HEAD~2"` if the type system only supports `PARENT_COMMIT`).

### 2. Embedded Design

The code explicitly models the domain concept ("The Parent Commit") rather than relying on the implementation detail ("HEAD~1").

### 3. Late Binding

We delay converting abstract concepts into concrete SHAs until the last possible moment.

- **SemanticRef**: Resolved by the backend just before execution.
- **ResolvedGitRef**: Passed to Git, resolved by Git at execution time.
