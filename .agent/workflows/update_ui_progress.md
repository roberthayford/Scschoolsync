---
description: Update the UI/UX enhancement progress tracker
---

# Workflow: Update UI/UX Progress

This workflow describes how to update the project documentation to reflect progress on the UI/UX enhancements.

## When to run
Run this workflow after completing a Phase or a significant set of tasks from the `docs/ui-ux-enhancement.md` roadmap.

## Steps

1. **Locate the Roadmap**:
   Open `docs/ui-ux-enhancement.md` and navigate to section **9. Implementation Roadmap**.

2. **Update Checks**:
   - Find the relevant "Deliverables" section for the current phase (e.g., Phase 1, Phase 2).
   - Change `[ ]` to `[x]` for any completed items.
   - Also check the **Implementation Checklist** section further down in the document for specific component updates.

3. **Verify**:
   - Ensure you haven't accidentally checked off future P2/P3 tasks that haven't been started.

4. **Commit**:
   - Include the documentation update in your git commit, or make a separate commit with the message `docs: update ui/ux progress`.

## Example

```markdown
**Phase 1 Deliverables:**
- [x] Colour system implemented
- [x] Event cards with child attribution
```
