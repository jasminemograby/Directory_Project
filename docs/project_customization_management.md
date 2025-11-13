# Project Customization Management

## File Status

✅ **File Exists:** `docs/project_customization.md`

## Current Content

The file currently contains:
- 5 Customization Rules (Notifications paused, External data sources, Mock data fallback, Inter-microservice communication, External integrations)
- UI/UX Customizations (Design system, Navigation)
- API Customizations (Single public entry endpoint)
- Database Customizations (Supabase setup)
- Deployment Customizations (Vercel, Railway, Supabase, GitHub Actions)

## Update Process

### When Adding a New Feature (Feature-Add-Template)

1. **Question 8** asks: "Does this feature require any special/custom rules that differ from general templates?"
2. If user answers "Yes", they describe the custom requirements
3. **Note in template:** "These will be recorded in `docs/project_customization.md`"
4. **Action Required:** AI should automatically update `docs/project_customization.md` with:
   - Date of customization
   - Rule description
   - Impact on the feature/project
   - Status (Applied/Pending)

### When Refining a Feature (Feature-Refine-Template)

1. During pre-change scan, AI reads `docs/project_customization.md`
2. If refinement introduces new customizations or changes existing ones:
   - AI should ask: "Does this refinement introduce new custom rules or change existing ones?"
   - If yes, update `docs/project_customization.md` accordingly

### Update Format

Each customization entry should follow this format:

```markdown
### [N]. [Customization Title]
- **Date:** YYYY-MM-DD
- **Feature:** FXXX (if applicable)
- **Rule:** [Description of the customization]
- **Impact:** [What this affects]
- **Status:** Applied/Pending
```

## Verification Checklist

- ✅ File exists
- ✅ Current customizations are documented
- ✅ Templates reference the file
- ⚠️ **Needs Improvement:** Automatic update process should be more explicit in templates
- ⚠️ **Needs Improvement:** Should verify all customizations are captured

## Recommendations

1. **Enhance Feature-Add-Template:** Add explicit instruction to AI to update `docs/project_customization.md` automatically when Question 8 is answered "Yes"
2. **Enhance Feature-Refine-Template:** Add explicit instruction to check and update `docs/project_customization.md` if refinements introduce customizations
3. **Add Verification Step:** In Generation Phase, verify that all customizations mentioned are documented
4. **Regular Review:** Periodically review the file to ensure it's up-to-date

