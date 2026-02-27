# Complexity Ratchets

_Based on Unit 6 of the Advanced Software Design course: Future-Proofing with the RAD Process_

## What Is a Complexity Ratchet?

A **complexity ratchet** is a design decision that makes future changes harder. Like a mechanical ratchet that only turns one way, these decisions are easy to make but hard to undo.

```
Easy Decision → Hard to Undo → Accumulated Complexity → Codebase Decay
```

Over time, complexity ratchets accumulate. Each one seems small, but together they make the codebase increasingly difficult to modify.

## The RAD Process

RAD stands for **Reduce Assumptions, Add Openness, Diminish Complexity Ratchets**:

### 1. Reduce Assumptions

Pass extensible objects instead of specific values. Isolate assumptions to single locations.

```typescript
// Ratchet: Assumes specific fields
function processUser(name: string, email: string, age: number) {
  // Every new field requires signature change
}

// Better: Reduces assumptions
function processUser(user: User) {
  // New fields can be added to User type without changing callers
}
```

### 2. Add Openness

Design for extension without modification. New capabilities should integrate cleanly.

```typescript
// Ratchet: Closed to extension
function handleEvent(event: Event) {
  if (event.type === 'click') { ... }
  else if (event.type === 'hover') { ... }
  else if (event.type === 'scroll') { ... }
  // Adding new event type requires modifying this function
}

// Better: Open to extension
const handlers: Record<string, EventHandler> = {
  click: handleClick,
  hover: handleHover,
  scroll: handleScroll,
};
function handleEvent(event: Event) {
  handlers[event.type]?.(event);
  // New event types just add to the handlers object
}
```

### 3. Diminish Complexity Ratchets

Actively resist decisions that create one-way doors.

## Common Complexity Ratchets

### The Boolean Parameter Ratchet

```typescript
// Starts simple
function sendEmail(to: string, subject: string) { ... }

// "Just add a flag"
function sendEmail(to: string, subject: string, urgent: boolean) { ... }

// Another flag
function sendEmail(to: string, subject: string, urgent: boolean, html: boolean) { ... }

// The ratchet turns
function sendEmail(
  to: string,
  subject: string,
  urgent: boolean,
  html: boolean,
  trackOpens: boolean,
  scheduleFor?: Date
) { ... }
```

Each boolean is easy to add but hard to remove. The function becomes increasingly complex, and callers scatter `true, false, true, false` throughout the codebase.

**Better**: Use an options object or separate functions.

### The Special Case Ratchet

```typescript
// v1: Clean
function calculatePrice(item: Item): number {
  return item.basePrice * item.quantity;
}

// v2: "Just one special case"
function calculatePrice(item: Item): number {
  if (item.type === 'subscription') {
    return item.basePrice;  // No quantity for subscriptions
  }
  return item.basePrice * item.quantity;
}

// v3: More special cases accumulate
function calculatePrice(item: Item): number {
  if (item.type === 'subscription') { ... }
  if (item.type === 'bundle') { ... }
  if (item.isOnSale) { ... }
  if (item.couponApplied) { ... }
  // The ratchet turns...
}
```

Special cases breed special cases. Once you have one, others follow the same pattern.

**Better**: Use polymorphism or strategy pattern from the start.

### The Hardcoded Value Ratchet

```typescript
// Seems fine now
const MAX_RETRIES = 3;
const TIMEOUT_MS = 5000;
const API_URL = "https://api.example.com";

// Later: "We need different values for different environments"
// But changing these requires touching every file that uses them
// And testing all the combinations
```

**Better**: Externalize configuration from the start.

### The Tight Coupling Ratchet

```typescript
// UserService directly calls PaymentService
class UserService {
  private paymentService = new PaymentService();

  deleteUser(id: string) {
    this.paymentService.cancelSubscription(id);
    // ...
  }
}

// Now UserService can't exist without PaymentService
// Can't test UserService in isolation
// Can't deploy UserService separately
```

**Better**: Use dependency injection and interfaces.

### The Load-Bearing Workaround Ratchet

```typescript
// "Temporary" fix
function getData() {
  const data = fetchData();
  // HACK: API returns dates as strings, convert them
  data.forEach((item) => {
    item.createdAt = new Date(item.createdAt);
  });
  return data;
}

// Six months later: 47 places depend on this conversion
// Can't fix the API without breaking everything
```

**Better**: Fix problems at the source or explicitly create a mapping layer.

## Identifying Ratchets in Code Review

### Questions to Ask

1. **Does this change make future changes harder?**
   - Will adding a new feature require modifying this code?
   - Will removing this code require changes elsewhere?

2. **Is this a one-way door?**
   - How hard would it be to undo this decision?
   - What would need to change to reverse course?

3. **Is this accumulating special cases?**
   - Is this the second/third/nth special case?
   - Could this be generalized instead?

4. **Will this workaround become load-bearing?**
   - Will other code start depending on this behavior?
   - Is this "temporary" fix in a high-traffic code path?

### Red Flags

- "Just add a boolean parameter"
- "Special case for [specific client/feature]"
- Comments like "TODO: generalize this later"
- Workarounds in shared/library code
- "It's easier to just copy-paste this"
- Adding fields to an already-large interface

## Resisting Ratchets

### Ask "What If There Are More?"

Before adding a special case:

- What if we need 5 more like this?
- What pattern would emerge?
- Should we build for that pattern now?

### Prefer Reversible Decisions

When you have a choice:

- Pick the option that's easier to change later
- Delay irreversible decisions as long as practical
- Document why you made the choice

### Invest in Foundations

Sometimes the right answer is:

- Spend time now to avoid complexity later
- Refactor before adding the new feature
- Create proper abstractions before they're "needed"

### Accept Some Duplication

Counter-intuitively, a little duplication is better than the wrong abstraction:

- Don't extract prematurely
- Wait for patterns to emerge
- Three occurrences before abstracting

## The Compound Effect

Complexity ratchets compound:

```
Year 1: "Just add a flag" (5 times)
Year 2: Functions with 5 boolean parameters
Year 3: Impossible to understand what any combination does
Year 4: "We need to rewrite this"
```

Each ratchet seems small. Together they destroy maintainability.

## Key Takeaway

**Before making a change, ask: "Will this make the next change easier or harder?"**

If harder, you're creating a complexity ratchet. Find another way, or accept the debt consciously.

## Related Reading

- [The 11 Aspects of Good Code](11-aspects-of-good-code.md) - Especially Evolvable and Openness
- [Should You Split That File](should-you-split-that-file.md)
- [Boolean Blindness](boolean-blindness.md)
