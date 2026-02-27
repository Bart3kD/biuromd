---
title: "Should You Split That File?"
author: "James Koppel"
source: "https://www.pathsensitive.com/2023/12/should-you-split-that-file.html"
archived: "2025-01-18"
tags: [organization, files, sections, embedded-design]
---

# Should You Split That File?

## Overview

This article explores the tension between keeping code in one large file versus splitting it into multiple files. Rather than presenting a binary choice, Koppel advocates for a "third way": organizing large files into clearly marked sections and subsections.

## The Core Problem

**The tradeoff:** Splitting code into separate files makes finding category-specific code easier but complicates tracking control flow across multiple components. Keeping everything in one file preserves readability of operations but creates difficulty in mental mapping.

## The Solution: Hierarchical Sections

Instead of aggressively fragmenting code, Koppel recommends using comment-based section markers similar to chapter headings in books:

```
/************************************************************
        MAIN HEADING
************************************************************/

/*********************
    Subheading
*********************/
```

This approach provides organizational benefits without actual file splitting. Examples are shown from:

- Semantic UI (CSS framework)
- Smart contract developers
- Various programming languages

## Key Benefits

**Cognitive Load Reduction:** Section dividers help readers reconstruct the programmer's original design intent without wading through unstructured code.

**Jigsaw Puzzle Effect:** As noted, subdividing large files significantly improves comprehension. "For each quadratic-time subregion, splitting pieces into halves roughly improves solving speed by 4x."

**Psychological Ease:** Well-organized code produces measurable cognitive comfort similar to entering a clean room.

**Delayed Complexity:** Sections enable adding features without immediately committing to permanent file structure changes.

## When to Apply This

The technique works best when:

- Related code is generally grouped together
- Multiple concerns exist within natural boundaries
- Build times aren't severely impacted (less critical for interpreted languages)
- Teams maintain consistent sectioning discipline

## Broader Principle

This reflects what Koppel calls the "Embedded Design Principle"—good code reveals the programmer's intent, allowing readers to recover the design without reconstructing everything from scratch.
