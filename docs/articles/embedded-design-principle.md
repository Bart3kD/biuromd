---
title: "My Favorite Principle for Code Quality: The Embedded Design Principle"
author: "James Koppel"
source: "https://www.pathsensitive.com/2018/02/making-bugs-impossible-illustrating.html"
archived: "2025-01-18"
tags: [design, embedded-design, coupling, refactoring, single-expression]
---

# The Embedded Design Principle

Code should make the program's design apparent. This principle helps prevent bugs, improve readability, and reduce coupling—more effectively than memorizing specific design patterns.

## The Problem: AwesomeSauce Stats Page

Bob creates a stats dashboard with repeated caching logic:

```java
public void displayStats() {
  if (lastCachedTime <= lastMidnight()) {
    numUsers = countUsers();
    lastCachedTime = Time.now();
    print("Total Users: " + numUsers);
  } else {
    print("Total Users: " + numUsers);
  }
  // Similar blocks for articles and words...
}
```

### Cascading Issues

1. **Initial Bug**: Charlie fixes variable naming conflicts by creating separate cache timestamps
2. **Refresh Rate Change**: When updating frequency doubles, separate if-conditions cause unintended independent refreshes
3. **Code Removal Problem**: Later, removing the word-count stat leaves orphaned computation code
4. **Performance Crisis**: Unused `countWords()` calls cause twice-daily slowdowns costing real server resources

## The Core Issue

The code treats three independent concerns as one: **computation**, **caching behavior**, and **display**. This creates N×3 "knobs" instead of the ideal N+1 (each stat plus one cache policy).

## The Solution: Embedded Design

Instead of hiding the design in scattered code, make it explicit:

```java
public interface DashboardStatComputation {
  Object compute();
}

public class DashboardStat {
  private DashboardStatComputation computation;
  private String textLabel;
}

public class Dashboard {
  private List<DashboardStat> stats;
  private Time lastComputedTime;
  private Map<DashboardStat, Object> curValues;

  public Map<DashboardStat, Object> getCurrentValues() { … }
}
```

### Declarative Usage

```java
dash = new Dashboard(list(
  new DashboardStat(countUsers, "Total Users"),
  new DashboardStat(countArticles, "Articles written"),
  new DashboardStat(countWords, "Words written")
));

public void displayDashboard() {
  print(dash.getCurrentValues());
}
```

## The Key Principle

**"One line of code per low-level concept"** prevents independent variation of related elements. Each stat now appears exactly once in the initialization, eliminating update errors.

## Tradeoff Framework

The principle applies across levels of detail:

1. **Minimal**: Hardcode stats with single cache refresh (better than N×3 knobs)
2. **Medium**: Extract caching checks into `shouldUpdate()` methods
3. **Full**: Create `DashboardStat` values making concept explicit

Balance simplicity against design clarity. Simpler approximations beat no abstraction, but proper concepts prevent future bugs more effectively than short-term convenience.

## More Applications

- **Internationalization**: Wrap translatable strings in i18n functions—makes "language choice" explicit
- **Configuration**: Parameterize policies instead of hardcoding them
- **Styling**: Use CSS variables to make "color scheme" a first-class concept

## Application to Code Review

When reviewing code, ask:

- [ ] Would a design change require edits in multiple places?
- [ ] Are there parallel structures that must stay in sync manually?
- [ ] Is the same concept expressed in different forms across files?
- [ ] Could removing a feature leave orphaned code behind?
- [ ] How many "knobs" exist vs how many should exist conceptually?
