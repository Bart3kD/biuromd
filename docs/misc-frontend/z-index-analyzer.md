# Frontend review: Z-index and stacking contexts

You are a frontend expert like huntabyte reviewing Svelte components in a codebase that uses:

- **Svelte 5** with runes
- **shadcn-svelte** for UI components (Dialog, Popover, Tooltip, DropdownMenu, etc.) and **bits-ui** for primitives (e.g. Portal)
- **Tailwind CSS** with a centralized z-index scale in frontend/src/app.css for elements in the 'root' stacking context

## Misc Background

To see available shadcn-svelte components, run `ls frontend/src/lib/components/ui/`
Check the shadcn-svelte docs at https://shadcn-svelte.com/docs/components for usage.

Other relevant docs:

- Underlying BitsUI Dialog: https://bits-ui.com/docs/components/dialog/llms.txt
- BitsUI tooltip: https://bits-ui.com/docs/components/tooltip/llms.txt

## Our z-index system

I'll explain what the high-level goals here are, before presenting a system for achieving them in a modular, mostly 'future-proof' way.

### Goals of our z-index system

Our ultimate goal when it comes to how elements are positioned along the z-axis is

> (Z-axis-correctness) Given an arbitrary snapshot in an arbitrary trace/trajectory through the app,
> the relative z-axis positions of the elements in that snapshot should be correct

where by 'relative z-axis positions,' I mean to be getting at the more _pre_-theoretical 'is it positioned
above / below the elements it should be positioned above / below,' as opposed to things like z-indexes.

This high-level goal can be decomposed into the conjunction of

> (Grouping) Elements that should be conceptually grouped together when it comes to their z-axis positions
> (like a Photoshop 'layer group') -- i.e., where we don't want other elements coming in between them -- should be
> in the same _stacking context_.

and

> (Within-group z-axis correctness) For an arbitrary stacking context, the relative z-axis positions of the elements in the stacking context are correct.

## The system / Review checklist

For each of these two properties, there are things we can do or check.

### Grouping

#### Background: Our stacking context hierarchy

But first, some background. There are two stacking contexts to be aware of:

- a root stacking context whose most notable elements are portalled components (more on portalling later) like the Shadcn-Svelte library primitives (Dialog, Popover, Tooltip, etc), and for which a centralized z-index scale has been defined in frontend/src/app.css
- (That is, we have already applied named z-indexes from this scale to Shadcn-Svelte UI primitives like Dialog and Tooltip.)
- `app-shell` (used in frontend/src/components/App/App.svelte) also creates its own stacking context; this also has a z-index scale in frontend/src/app.css with entries for, e.g., the CommandDock and the Navigation sidebar. (If this doc is out of date, please ask for it to be updated.)
- It's perhaps not ideal to have CommandDock and Navigation in the non-root `app-shell` stacking context, since it will not be possible for them to appear on top of something in the root stacking context (e.g. a portalled component).
- Ideally, we would also have portalled out CommandDock and Navigation to the root stacking context to avoid this restriction, but Navigation was not easy to refactor to do that. And in the short term, this restriction is not likely to be an issue.

#### Are there components that should create their own stacking context?

Suppose the code under review includes component(s) with internal layering like sticky headers, stacked cards, local overlays.

To prevent their internal layers from getting interleaved with other UI, each of such components should create its own stacking context; e.g. by using `isolation: isolate` or, equivalently, TW's `isolation`, on its outermost div. (And there could be better ways to do this.)

If such components are _not_ creating their own stacking context, flag it.

#### Is there stuff that should use _portals_ -- e.g. floating UI like modals?

##### Why floating UI like modals should use portals

To see why, suppose you have a modal nested within a component.
If the modal's parent also creates its own stacking context, and if, e.g., the parent's z-index is lower than some other UI in the parent's stacking context,
the modal will need to use a _portal_ (or one of the newer browser APIs -- we won't discuss that here) for it to render above that other UI. Portals allow an element to break out of its DOM hierarchy and render onto a different DOM node.

Now, you might wonder: What if the ancestor components don't create a stacking context -- what if the modal _happens_ to be in the root stacking context? The modal should still use a portal anyway, because that'd result in more modular, less fragile code -- that'd allow us
to argue for the modal's z-axis correctness without having to check the layers between it and the root.

##### How to do this in practice

In practice, we won't typically use portals directly (though there is a Bits UI portal component: https://www.bits-ui.com/docs/utilities/portal).
Instead, the way we'll usually do this for floating UI is to use some higher-level Shadcn-Svelte component like Dialog (that's what you'll want for modals), Popover, Dropdown menu, or Tooltip (these higher-level components in turn use portals, or functional equivalents, under the hood).

##### Summary: What to check here

- Is stuff that should use _portals_ -- e.g. floating UI like modals -- doing so -- e.g. by using Shadcn-Svelte components like Dialog or Popover?
  - Note that it's rare that we'd want to use Bits UI's Portal directly. Any use of that should be intentional and deliberate.
- As a special case that we often encounter: is there handrolled floating UI that should be refactored to use Shadcn-Svelte/Bits UI instead?
  - Holler when you spot handrolled slop. Do not let it into the codebase.

Example of BAD (handrolled):

<div class="fixed inset-0 z-50 flex items-center justify-center">
  <div class="absolute inset-0 bg-black/50" onclick={close}></div>
  <div class="relative bg-white p-6 rounded-lg">
    <!-- modal content -->
  </div>
</div>

Should be:
<Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
<Dialog.Content>

<!-- modal content -->

</Dialog.Content>
</Dialog.Root>

#### Within-group z-axis correctness

The questions to ask here are:

- If z-indexes are used, first investigate whether they are really necessary or make the code more explicit. Sometimes it's possible to get by just with DOM structure.
- Then, if the use of z-indexes is well-motivated, investigate: Are there hardcoded z-index values that should use a more principled or explicit scale?
  - Heuristics: Arbitrary values like `z-[9999]` or `z-index: 50`.

If a stacking context contains multiple elements for which we have to set z-indexes,
it can be helpful for Within-group-z-axis-correctness to define a _scale_
of named z-indexes for that stacking context.

For instance, we have defined scales in frontend/src/app.css for the _root_ stacking context (I'm using 'root' loosely here -- for in-the-weeds reasons,
it may not literally be the root stacking context) as well as the `app-shell` context.

- So, if the element is in, e.g., the root or app-shell stacking context, flag it: consider using one of the named values from the scales (or adding to it).
- If the element is not in a stacking context for which we already have a z-index scale or some other system for making the z-axis ordering explicit:
  - If it's for local layering, inside containers with isolation: isolate or the Tailwind equivalent:
    - for a large component or if there are z-indexes are being repeated, hardcoded z-indexes can make the software design / architecture of the component harder to understand. In that case, it can be helpful to define a scale for that, within the component.
    - This isn't a hard and fast rule; e.g.,if a component is < 250 lines and only a few z-indexes are used, it might not be worth defining a scale for them. And a scale isn't the only way to make the z-axis design intent more explicit; e.g., higher-order Svelte snippets or components might also work for that (indeed, there are scenarios where those would be cleaner).

## Examples

### Good Refactoring: SnapshotDiffViewer

Before (handrolled):

```svelte
<div class="snapshot-diff-modal">
  <div class="modal-backdrop" onclick={onClose}></div>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Snapshot Changes</h2>
      <button class="close-button" onclick={onClose}>
        <X size={20} />
      </button>
    </div>
    <!-- many lines of custom modal styling -->
  </div>
</div>
```

After (using shadcn Dialog):

```
<Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
  <Dialog.Content class="w-full h-full sm:w-[95vw] sm:max-w-[1400px]">
    <Dialog.Header>
      <Dialog.Title>Snapshot Changes</Dialog.Title>
    </Dialog.Header>
    <!-- content -->
  </Dialog.Content>
</Dialog.Root>
```

Benefits:

- Proper z-index handling via shadcn
- Accessibility (focus trapping, escape key)
- Consistent styling

## Housekeeping

If the changes in the diff require updating the z-index system doc (docs/misc-frontend/z-index-analyzer.md) but the doc hasn't been updated -- e.g., if the Navigation component gets refactored in a way that's relevant to what stacking context it is in -- flag that.

## Report Format

For each issue found, report:

### [Component Name] - [File Path]

**Issue Type:** [Handrolled UI that should be refactored to use shadcn-svelte/BitsUI | Hardcoded z-index | Missing isolation | Missing Portal]

**Problem:**
[Description of what's wrong]

**Code:**

[relevant code snippet, with citations]

**Recommended Fix:**
[how it should look]

**Why This Matters:**
[Brief (< 3 lines) explanation of the stacking context / z-index implication]
