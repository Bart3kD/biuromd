# Svelte 5 Documentation

This directory contains comprehensive documentation for Svelte 5 development patterns and best practices used in this project.

## Contents

### 📘 [best-practices.md](./best-practices.md)

Core Svelte 5 concepts and patterns:

- **Runes**: `$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$inspect`
- **Event Handlers**: Modern patterns with `onclick` vs `on:click`
- **Snippets**: Reusable markup fragments
- **Common Patterns**: Loading states, form handling, etc.
- **Migration Guide**: Svelte 4 → Svelte 5
- **Anti-Patterns**: What to avoid and why

**Use this to:** Understand core Svelte 5 reactive patterns and runes.

### 🧰 [runed-integration.md](./runed-integration.md)

Comprehensive guide to the [runed](https://runed.dev) utility library:

- **When to use runed** vs custom implementations
- **State Management**: Debouncing, throttling, previous values, toggles
- **DOM & Browser**: Element size, intersection observer, media queries, scroll
- **Event Handling**: Event listeners, custom events
- **Timing**: Intervals, timeouts
- **Input & Forms**: Textarea autosize, focus trap
- **Storage**: LocalStorage, SessionStorage
- **Advanced**: Infinite scroll, reactive sorting

**Use this to:** Identify opportunities to replace custom implementations with battle-tested runed utilities.

### 🔗 [resources.md](./resources.md)

Links to official documentation and learning resources:

- Official Svelte 5 docs for all runes
- Runed docs for all utilities
- Learning resources (videos, articles, community)
- Quick reference for common patterns
- When to consult full documentation

**Use this to:** Find detailed documentation for specific features or edge cases.

## Quick Reference

| Need                    | Document             | Key Sections                |
| ----------------------- | -------------------- | --------------------------- |
| Reactive state patterns | best-practices.md    | Core Runes, Common Patterns |
| Replace custom logic    | runed-integration.md | Entire document             |
| Specific rune docs      | resources.md         | Runes Documentation links   |
| Migration help          | best-practices.md    | Migration from Svelte 4     |
| Performance tips        | best-practices.md    | Performance Tips            |

## Contributing

When adding new Svelte 5 patterns or runed utilities:

1. Update relevant sections in the appropriate document
2. Add examples with clear "before/after" comparisons
3. Include links to official docs in resources.md
4. Mark any project-specific adaptations clearly

## Related Documentation

- [`CLAUDE.md`](../../CLAUDE.md) - General coding guidelines
- [`docs/CODE_REVIEW_CHECKLIST.md`](../CODE_REVIEW_CHECKLIST.md) - Review criteria
- [`.claude/commands/cc/code-review.md`](../../.claude/commands/cc/code-review.md) - Code review command
