# Code Guard System

Code Guards are a system for protecting critical code sections that have broken in the past. They provide automated detection and alerting when protected code is modified.

## 🎯 Purpose

Code Guards solve the problem of **critical code breaking repeatedly**. When you identify code that:

- Has broken multiple times
- Is difficult to test comprehensively
- Has subtle requirements that are easy to miss
- Requires deep understanding to modify safely

You can mark it with a Code Guard to:

- Alert reviewers when it's modified
- Document why it's critical
- Prevent accidental breakage

## 🚀 Quick Start

### Using the VSCode Snippet

1. Add a comment line above your code
2. Type `cg` and press **Tab**
3. Fill in the template:
   - **Name**: Human-readable description (e.g., "Synced Diff Scrolling")
   - **Description**: (Optional) Describe the feature it protects
4. Add a comment line below your code
5. Type `cge` and press **Tab**

Example:

```typescript
// CODE_GUARD_START
// Name: Synced Diff Scrolling
// Description: These CSS properties enable synchronized scrolling between both diff panels.
.diff-container {
  overflow: auto;
  max-height: 80vh;
}
// CODE_GUARD_END
```

## 📋 Code Guard Syntax

### Required Elements

```
CODE_GUARD_START
Name: [Human Readable Name]
Description: [(Optional) Describe the feature it protects]
[... protected code ...]
CODE_GUARD_END
```

### Rules

1. **Name is required** - Must be present after CODE_GUARD_START
2. **Description is optional** - Use it to describe what feature this code protects
3. **Names should be descriptive** - Use clear, human-readable names
4. **Description should explain**:
   - What functionality this code provides
   - What feature it protects
   - What to test if modifying

## 🤖 CI Integration

### How It Works

When a PR is opened or updated:

1. **Detection**: GitHub Actions runs `check-code-guards.ts` to generate JSON report
2. **Analysis**: Script compares PR changes against Code Guard regions
3. **Review Comments**: Creates inline review comments on protected code that was changed
4. **Rich Display**: GitHub automatically shows code snippets with syntax highlighting

The script outputs structured JSON that the GitHub Action uses to create review comments.

### What Gets Flagged

- Any line changed within a CODE_GUARD region
- Modifications to the guard markers themselves
- Changes to any code between START and END markers

### What You'll See in the PR

**1. Summary comment** (top of PR conversation):

```markdown
## ⚠️ Code Guard Changes Detected

2 protected code section(s) have been modified.
Please review the inline comments on the changed lines.
```

**2. Inline review comments** (on the actual changed lines in Files Changed tab):

- Shows exactly which line triggered the guard
- GitHub quotes the actual code with syntax highlighting
- Appears in both Files Changed and Conversation tabs
- Warning explains what feature is protected

**Example inline comment:**

```markdown
⚠️ CODE GUARD: Synced Diff Scrolling

**Protected Feature:** These CSS properties enable synchronized scrolling between both diff panels.

This code is protected because it has broken before. Changed lines: L590, L595, L600

**Please:**

1. Verify the change is necessary
2. Test thoroughly
3. Document why the change was needed
```

GitHub automatically includes the code snippet above this comment!

## 🧪 Testing Locally

### Output Formats

The script supports three output formats:

```bash
# Structured JSON (default) - machine-readable
bun run scripts/check-code-guards.ts --format=json

# Pretty terminal output - human-readable
bun run scripts/check-code-guards.ts --format=pretty

# GitHub markdown format - for CI
bun run scripts/check-code-guards.ts --format=github
```

### JSON Output Structure

```json
{
  "summary": {
    "totalGuards": 5,
    "totalChangedGuards": 1,
    "files": ["frontend/src/components/viewers/SideBySideDiffViewer.svelte"]
  },
  "changes": [
    {
      "guard": {
        "name": "Synced Diff Scrolling",
        "description": "These CSS properties enable synchronized scrolling...",
        "file": "frontend/src/components/viewers/SideBySideDiffViewer.svelte",
        "startLine": 576,
        "endLine": 602
      },
      "changedLines": [590, 600]
    }
  ]
}
```

### Testing Against a Branch

Run the Code Guard checker manually:

```bash
# Check COMMITTED changes only (default - same as CI)
bun run scripts/check-code-guards.ts --format=pretty

# Check ALL changes including uncommitted/staged (for local testing)
bun run scripts/check-code-guards.ts --format=pretty --include-working-tree

# Check against a different branch
bun run scripts/check-code-guards.ts --format=pretty --base=develop

# Get JSON output for further processing
bun run scripts/check-code-guards.ts --format=json > code-guard-report.json
```

**Important**: By default, the script only checks **committed** changes (what would appear in a PR). Use `--include-working-tree` to also check your uncommitted and staged changes during local development.

## 📝 Best Practices

### When to Use Code Guards

✅ **Good use cases:**

- Critical business logic that has broken before
- Subtle CSS that breaks in non-obvious ways
- Complex state management with hidden dependencies
- Security-sensitive code sections
- Performance-critical paths

❌ **Avoid for:**

- Code that changes frequently by design
- Simple, well-tested utility functions
- Code with comprehensive test coverage
- Temporary or experimental code

### Writing Good Descriptions

**Bad:**

```
Description: Important code, do not change
```

**Good:**

```
Description: These overflow properties enable synchronized scrolling between both diff panels.
Changing .diff-container to overflow:visible or .diff-side to overflow:auto will break
synchronized scrolling, causing panels to scroll independently. This has broken 3 times
in commits abc123, def456, and ghi789.
```

### Maintaining Code Guards

1. **Remove guards** when:
   - The code is no longer critical
   - Comprehensive tests are added
   - The risk of breakage is resolved

2. **Update guards** when:
   - Requirements change
   - New risks are identified
   - The protected code is refactored

3. **Review regularly**:
   - Check if guards are still necessary
   - Update descriptions to reflect current understanding
   - Remove stale guards

## 🔧 Configuration

### GitHub Action

File: `.github/workflows/code-guard-check.yml`

Runs on: `pull_request` events (opened, synchronize, reopened)

Permissions needed:

- `contents: read` - To checkout code
- `pull-requests: write` - To post comments

### Script

File: `scripts/check-code-guards.ts`

Environment variables:

- `BASE_BRANCH` - Branch to compare against (default: `main`)
- `GITHUB_OUTPUT` - GitHub Actions output file (auto-set in CI)

## 🤝 Integration with AI Agents

AI agents (Claude, etc.) are instructed to:

1. **Respect Code Guards** - Rarely modify guarded code
2. **Ask permission** - Request explicit approval before changing guards
3. **Explain changes** - Document what was changed and why
4. **Inform users** - Alert when guarded code was modified

See `AGENTS.md` for complete AI integration guidelines.

## 📊 Example Use Cases

### 1. CSS Synchronization Issue

**Problem:** Diff viewer scrolling broke 3 times in different PRs
**Solution:** Guard the critical overflow CSS properties
**Result:** CI alerts reviewers when these properties change

### 2. Complex State Machine

**Problem:** Subtle bugs in state transitions caused data corruption
**Solution:** Guard the state transition logic with clear documentation
**Result:** Changes require explicit review and testing

### 3. Performance-Critical Path

**Problem:** Innocent-looking changes caused 10x performance regression
**Solution:** Guard the hot path with performance requirements
**Result:** Reviewers know to run benchmarks before merging

## 🆘 Troubleshooting

### False Positives

If the checker flags changes that shouldn't be flagged:

1. Check that your guard markers are correctly formatted
2. Verify tags match between START and END
3. Ensure there are no typos in marker syntax

### Missing Detections

If changes aren't being caught:

1. Verify guards are committed to the base branch
2. Check that files are included in git diff
3. Ensure CI workflow has correct permissions

### Script Errors

If the checker script fails:

1. Run locally to see full error: `bun run scripts/check-code-guards.ts`
2. Check that Bun is installed and up to date
3. Verify git repository is properly initialized

## 📚 Additional Resources

- [AGENTS.md](../AGENTS.md) - AI agent guidelines for Code Guards
- [GitHub Actions Docs](https://docs.github.com/en/actions) - CI/CD documentation
- [VSCode Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets) - Snippet customization
