# Svelte 5 & Runed Resources

Comprehensive resource links for Svelte 5 development and runed integration.

## Official Svelte 5 Documentation

### Core Documentation

- **Svelte 5 Homepage**: https://svelte-5-preview.vercel.app/
- **Official Tutorial**: https://learn.svelte.dev/
- **Svelte 5 Docs**: https://svelte.dev/docs/svelte/overview
- **Migration Guide**: https://svelte.dev/docs/svelte/v5-migration-guide
- **API Reference**: https://svelte.dev/docs/svelte/svelte

### Runes Documentation

- **Introduction to Runes**: https://svelte.dev/docs/svelte/what-are-runes
- **`$state`**: https://svelte.dev/docs/svelte/$state
- **`$derived`**: https://svelte.dev/docs/svelte/$derived
- **`$effect`**: https://svelte.dev/docs/svelte/$effect
- **`$props`**: https://svelte.dev/docs/svelte/$props
- **`$bindable`**: https://svelte.dev/docs/svelte/$bindable
- **`$inspect`**: https://svelte.dev/docs/svelte/$inspect

### Advanced Topics

- **Snippets**: https://svelte.dev/docs/svelte/snippet
- **Event Handlers**: https://svelte.dev/docs/svelte/event-handlers
- **Component Composition**: https://svelte.dev/docs/svelte/component-composition
- **TypeScript**: https://svelte.dev/docs/svelte/typescript
- **Performance**: https://svelte.dev/docs/svelte/performance

## Runed Documentation

### Main Resources

- **Runed Homepage**: https://runed.dev/
- **Getting Started**: https://runed.dev/docs/getting-started
- **Utilities Overview**: https://runed.dev/docs/utilities/overview
- **GitHub Repository**: https://github.com/svecosystem/runed

### Utility Reference

See [`runed-integration.md`](./runed-integration.md) for the complete list of all 34 utilities with usage patterns.

## Learning Resources

### Video Tutorials

- **Svelte 5 Runes Explained**: https://www.youtube.com/watch?v=RVnxF3j3N8U
- **Svelte Society YouTube**: https://www.youtube.com/@SvelteSociety

### Articles & Guides

- **Introducing Runes**: https://svelte.dev/blog/runes
- **Svelte 5 Migration Guide**: https://svelte.dev/docs/svelte/v5-migration-guide
- **What's New in Svelte 5**: https://vercel.com/blog/svelte-5

### Community

- **Svelte Discord**: https://svelte.dev/chat
- **Svelte Society**: https://sveltesociety.dev/
- **SvelteKit Discord**: https://discord.gg/svelte
- **Reddit**: https://www.reddit.com/r/sveltejs/

## Related Tools & Libraries

### UI Components

- **shadcn-svelte**: https://www.shadcn-svelte.com/
  - This project uses shadcn-svelte for UI components
  - Always prefer shadcn components over custom implementations

### Development Tools

- **Svelte DevTools**: https://github.com/sveltejs/svelte-devtools
- **Svelte VSCode Extension**: https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode
- **Svelte Check**: https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check

### Testing

- **Vitest**: https://vitest.dev/ (recommended for Svelte 5)
- **Testing Library Svelte**: https://testing-library.com/docs/svelte-testing-library/intro
- **Playwright**: https://playwright.dev/

## Quick Reference

### Common Patterns Lookup

- **Reactive state**: Use `$state` → [docs](https://svelte.dev/docs/svelte/$state)
- **Computed values**: Use `$derived` → [docs](https://svelte.dev/docs/svelte/$derived)
- **Side effects**: Use `$effect` → [docs](https://svelte.dev/docs/svelte/$effect)
- **Component props**: Use `$props()` → [docs](https://svelte.dev/docs/svelte/$props)
- **Debouncing**: Use `Debounced` from runed → [docs](https://runed.dev/docs/utilities/debounced)
- **Element size**: Use `ElementSize` from runed → [docs](https://runed.dev/docs/utilities/element-size)
- **Previous value**: Use `Previous` from runed → [docs](https://runed.dev/docs/utilities/previous)
- **Scroll tracking**: Use `ScrollState` from runed → [docs](https://runed.dev/docs/utilities/scroll-state)

## When to Consult Full Documentation

The sub-agent reviewing code should consult full documentation when:

1. **Complex patterns** - Pattern not covered in local docs
2. **Edge cases** - Unusual usage or advanced features
3. **Breaking changes** - Migration-related questions
4. **Integration issues** - Compatibility with other libraries
5. **Performance optimization** - Advanced performance patterns
6. **TypeScript specifics** - Complex type interactions
7. **Accessibility** - ARIA patterns and screen reader support

## Project-Specific Documentation

For project-specific patterns and conventions, also check:

- `CLAUDE.md` - General coding guidelines
- `docs/CODE_REVIEW_CHECKLIST.md` - Review criteria
- `docs/articles/` - Referenced best practice articles

## Updates & Changelog

- **Svelte Blog**: https://svelte.dev/blog
- **Runed Releases**: https://github.com/svecosystem/runed/releases
- **Svelte Twitter**: https://twitter.com/sveltejs
