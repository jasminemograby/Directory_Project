# Precision.md vs Project_Customization.md

## Key Distinction

### `docs/precision.md`
**Purpose:** Generalized refinements applicable to multiple projects

**Contains:**
- Template improvements that can be reused
- Process refinements applicable across projects
- Code quality patterns and best practices
- Architecture patterns
- Testing approaches
- Documentation standards

**Example:** "All templates should use dynamic question generation" - This applies to ALL projects

### `docs/project_customization.md`
**Purpose:** Project-specific adjustments for THIS project only

**Contains:**
- Project-specific rules and exceptions
- Custom requirements for this project
- Deployment targets specific to this project
- Technology choices specific to this project
- Business logic customizations

**Example:** "For MVP, only LinkedIn and GitHub integration" - This is specific to THIS project

---

## Decision Tree

**Should this go in precision.md or project_customization.md?**

1. **Can this be applied to other projects?**
   - ✅ Yes → `precision.md`
   - ❌ No → `project_customization.md`

2. **Is this a template/process improvement?**
   - ✅ Yes → `precision.md`
   - ❌ No → `project_customization.md`

3. **Is this specific to this project's requirements?**
   - ✅ Yes → `project_customization.md`
   - ❌ No → `precision.md`

---

## Examples

### precision.md Examples:
- "All templates should use dynamic question generation"
- "Mock data fallback pattern for external APIs"
- "TDD-first approach for feature development"
- "Standard monorepo structure"

### project_customization.md Examples:
- "Notifications paused for this project"
- "Only LinkedIn/GitHub for MVP (this project)"
- "Deploy to Vercel/Railway/Supabase (this project)"
- "Use Tailwind CSS utility classes only (this project requirement)"

---

## Update Process

### precision.md
- Updated when generalized improvements are identified
- Can be updated during any template execution
- Should be reviewed periodically for applicability

### project_customization.md
- Updated automatically by Feature-Add and Feature-Refine templates
- When Question 8 (Feature-Add) or Question 5 (Feature-Refine) is "Yes"
- Format: Date, Feature, Rule, Impact, Status

---

## Both Files Exist ✅

- ✅ `docs/precision.md` - Created for generalized refinements
- ✅ `docs/project_customization.md` - Exists for project-specific customizations

Both files are now properly separated and maintained.

