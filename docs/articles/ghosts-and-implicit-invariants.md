# Ghosts and Implicit Invariants

_Based on Unit 1 of the Advanced Software Design course: The Hidden Layer of Logic_

## The Three Levels of Software

Every piece of software operates at three levels:

1. **Runtime Level**: The actual execution - memory, CPU, I/O operations
2. **Implementation Level**: The code as written - functions, classes, data structures
3. **Logic/Design Level**: The abstract reasoning about correctness

Most bugs live in the gap between implementation and logic. The code does something, but the _reasoning_ about what it does is wrong.

## What Are Ghosts?

**Ghosts** are implicit invariants that your code depends on but never states. They're the "dark knowledge" - assumptions that must be true for the code to work, but which aren't written anywhere.

### Example: The Crash-Safety Ghost

```typescript
class FileWriter {
  private buffer: string[] = [];

  write(data: string) {
    this.buffer.push(data);
  }

  flush() {
    const content = this.buffer.join("");
    fs.writeFileSync(this.path, content);
    this.buffer = [];
  }
}
```

**The ghost**: This code assumes `flush()` will always complete. If the program crashes between `writeFileSync` and `this.buffer = []`, the next run might have stale data. The invariant "buffer and file are consistent" is a ghost - it's assumed but never stated.

### Example: The Ordering Ghost

```typescript
async function processOrder(order: Order) {
  await validateInventory(order);
  await chargeCustomer(order);
  await shipOrder(order);
}
```

**The ghost**: These must run in order. But nothing in the code _enforces_ this. A future maintainer might "optimize" by running them in parallel, breaking the invisible invariant.

## Hoare Logic: Making Ghosts Visible

Hoare Logic gives us a formal way to think about code correctness:

```
{P} C {Q}
```

- **P** (Precondition): What must be true before the code runs
- **C** (Code): The code being executed
- **Q** (Postcondition): What will be true after the code runs

### Implicit vs Explicit Preconditions

```typescript
// Implicit precondition (ghost!)
function getElement(arr: any[], index: number) {
  return arr[index]; // Assumes: 0 <= index < arr.length
}

// Explicit precondition
function getElementSafe(arr: any[], index: number): any | undefined {
  if (index < 0 || index >= arr.length) return undefined;
  return arr[index];
}
```

The first function has a ghost - it assumes valid index bounds but doesn't state or enforce this.

## Identifying Ghosts in Code Review

### Smell Patterns

1. **Order-dependent operations without enforcement**

   ```typescript
   // Ghost: init() must be called before process()
   service.init();
   service.process();
   ```

2. **Comments warning about fragility**

   ```typescript
   // DON'T CHANGE THE ORDER OF THESE LINES
   loadConfig();
   initializeDatabase();
   startServer();
   ```

3. **Tests that fail in different order**

   ```typescript
   // If these tests share state, there's a ghost
   test('creates user', ...);
   test('deletes user', ...);  // Depends on previous test?
   ```

4. **Code relying on side effects elsewhere**
   ```typescript
   function calculateTotal() {
     // Ghost: assumes this.items was populated by loadCart()
     return this.items.reduce((sum, i) => sum + i.price, 0);
   }
   ```

### Questions to Ask

- What would break if someone modified adjacent code?
- Are there ordering requirements between operations?
- Does this function assume something about global state?
- Would the code still work if called from a different context?
- Are there implicit relationships between data structures?

## Making Ghosts Explicit

### Strategy 1: Type System Enforcement

```typescript
// Ghost: database must be connected
class Database {
  query(sql: string) { /* assumes connected */ }
}

// Explicit: types enforce connection
class DisconnectedDatabase {
  connect(): ConnectedDatabase { ... }
}
class ConnectedDatabase {
  query(sql: string) { ... }
  disconnect(): DisconnectedDatabase { ... }
}
```

### Strategy 2: Builder/Fluent Patterns

```typescript
// Ghost: must call setHeader before setBody
email.setHeader(h);
email.setBody(b);
email.send();

// Explicit: API enforces order
EmailBuilder.new()
  .withHeader(h) // Returns HeaderBuilder
  .withBody(b) // Returns CompleteEmail
  .send(); // Only available after both
```

### Strategy 3: Assertion Documentation

When you can't encode in types, at least document:

```typescript
/**
 * @precondition User must be authenticated (check session.isValid())
 * @postcondition Returns sanitized data safe for display
 */
function getUserProfile(userId: string): Profile {
  assert(session.isValid(), "User must be authenticated");
  // ...
}
```

## The Cost of Ghosts

Ghosts create **fragile code**:

- Changes in one place break code elsewhere
- Bugs appear only under specific conditions
- New team members make "innocent" changes that cause failures
- Testing becomes difficult without knowing all assumptions

## Key Takeaway

**Every invariant your code depends on should be either:**

1. Enforced by the type system
2. Checked at runtime with clear errors
3. Explicitly documented with preconditions

If it's none of these, it's a ghost - and ghosts eventually haunt you.

## Related Reading

- [The Three Levels of Software](the-three-levels-of-software.md)
- [Modules Matter Most](modules-matter-most.md)
- [Parse, Don't Validate](parse-dont-validate.md)
