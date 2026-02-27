# Algebraic Simplification

_Based on Unit 5 of the Advanced Software Design course: Equational Reasoning_

## Code as Algebra

Just as mathematics has algebraic laws for simplifying expressions, code has equivalent transformations that preserve behavior while improving structure.

```
Math:  a × (b + c) = a×b + a×c
Code:  Similar transformations exist for functions and types
```

This lens helps identify code that can be simplified without changing its behavior.

## Functions Are Exponentials

In type theory, there's a correspondence between types and numbers:

| Type                     | Corresponds To |
| ------------------------ | -------------- |
| `void`/`never`           | 0              |
| `unit`/`()`              | 1              |
| `boolean`                | 2              |
| `A \| B` (sum type)      | a + b          |
| `A & B` (product type)   | a × b          |
| `A -> B` (function type) | b^a            |

### The Key Law: Functions with Boolean Parameters

If `A -> B` is `b^a`, then:

```
b^(a+c) = b^a × b^c
```

In code terms: **a function that takes a boolean parameter is equivalent to a pair of functions**.

```typescript
// Original: one function with boolean
function format(value: string, uppercase: boolean): string {
  if (uppercase) {
    return value.toUpperCase();
  }
  return value.toLowerCase();
}

// Algebraically equivalent: two functions (a product)
function formatUpper(value: string): string {
  return value.toUpperCase();
}

function formatLower(value: string): string {
  return value.toLowerCase();
}
```

Why is the second better? The boolean parameter is "boolean blindness" - at call sites you see `format(s, true)` which doesn't convey meaning.

## Algebraic Simplification Patterns

### Pattern 1: Nested Conditionals → Flat Conditionals

```typescript
// Before
if (a) {
  if (b) {
    doSomething();
  }
}

// After (when appropriate)
if (a && b) {
  doSomething();
}
```

### Pattern 2: Conditional Returns → Expression

```typescript
// Before
function isEligible(user: User): boolean {
  if (user.age >= 18) {
    return true;
  } else {
    return false;
  }
}

// After
function isEligible(user: User): boolean {
  return user.age >= 18;
}
```

### Pattern 3: Boolean Return → Caller's Switch

When a function returns a boolean that callers immediately switch on, the abstraction boundary is wrong:

```typescript
// Smell: boolean returned, caller switches
function shouldRetry(error: Error): boolean {
  return error.code === "TIMEOUT" || error.code === "NETWORK";
}

// Caller
if (shouldRetry(error)) {
  retry();
} else {
  fail();
}

// Better: function that captures the decision's effect
function handleError(error: Error, onRetry: () => void, onFail: () => void) {
  if (error.code === "TIMEOUT" || error.code === "NETWORK") {
    onRetry();
  } else {
    onFail();
  }
}
```

### Pattern 4: Pairs Where One Interprets Another

When you have a pair where one field determines how to interpret the other:

```typescript
// Smell: type field determines interpretation
type Response = {
  success: boolean;
  data?: any; // Only meaningful if success
  error?: string; // Only meaningful if !success
};

// Better: sum type (discriminated union)
type Response =
  | { kind: "success"; data: any }
  | { kind: "error"; error: string };
```

### Pattern 5: Parallel Code Paths

When multiple code paths have identical structure, there's a missing abstraction:

```typescript
// Smell: structural duplication
function processUser(user: User) {
  validate(user);
  normalize(user);
  save(user);
  log("user processed");
}

function processOrder(order: Order) {
  validate(order);
  normalize(order);
  save(order);
  log("order processed");
}

// Better: extract the pattern
function process<T>(entity: T, name: string) {
  validate(entity);
  normalize(entity);
  save(entity);
  log(`${name} processed`);
}
```

## Defunctionalization

**Defunctionalization** converts stored callbacks into data structures:

```typescript
// Before: storing functions for later
type Task = {
  execute: () => void;
};

const tasks: Task[] = [
  { execute: () => sendEmail(user) },
  { execute: () => updateDatabase(record) },
  { execute: () => notifyAdmin(message) },
];

// After: data that describes what to do
type Task =
  | { kind: "sendEmail"; user: User }
  | { kind: "updateDatabase"; record: Record }
  | { kind: "notifyAdmin"; message: string };

const tasks: Task[] = [
  { kind: "sendEmail", user },
  { kind: "updateDatabase", record },
  { kind: "notifyAdmin", message },
];

function execute(task: Task) {
  switch (task.kind) {
    case "sendEmail":
      return sendEmail(task.user);
    case "updateDatabase":
      return updateDatabase(task.record);
    case "notifyAdmin":
      return notifyAdmin(task.message);
  }
}
```

**Why is this better?**

- Tasks can be serialized (JSON, database)
- Tasks can be inspected and logged
- Tasks can be compared for equality
- Easier to test
- Easier to understand what will happen

## When to Apply Algebraic Simplification

### In Code Review, Look For:

1. **Boolean parameters** - Can they become separate functions?
2. **Nested conditionals** - Can they be flattened?
3. **Structural duplication** - Is there a pattern to extract?
4. **Functions returning booleans** - Are callers always switching on them?
5. **Pairs with type/value structure** - Should they be sum types?
6. **Stored callbacks** - Could they be defunctionalized to data?

### Don't Over-Apply

Not every transformation is an improvement. Consider:

- Does this make the code clearer?
- Does this reduce the number of concepts?
- Will maintainers understand the refactored version?

Sometimes the "algebraically simpler" version is harder to understand.

## Equational Reasoning in Practice

Equational reasoning lets you refactor mechanically:

```typescript
// Original
users.filter((u) => u.active).map((u) => u.name);

// By laws of map and filter, equivalent to:
users.flatMap((u) => (u.active ? [u.name] : []));

// Or with a different decomposition:
users.map((u) => (u.active ? u.name : null)).filter((n) => n !== null);
```

Each step preserves behavior. You can verify the transformation is correct without testing every case.

## Key Takeaways

1. **Code has algebraic structure** - transformations can be mechanical
2. **Boolean parameters often indicate split functions** - `b^(a+c) = b^a × b^c`
3. **Look for structural duplication** - it reveals missing abstractions
4. **Consider defunctionalization** - data is often better than stored functions
5. **Sum types beat type+value pairs** - discriminated unions are clearer

## Related Reading

- [Defunctionalization Refactoring](defunctionalization-refactoring.md)
- [Boolean Blindness](boolean-blindness.md)
- [Parse, Don't Validate](parse-dont-validate.md)
