# Template Update Summary

This document tracks the update of all templates to remove hardcoded follow-up questions and replace them with dynamic question generation instructions.

## Update Status

### Completed
- Project-Initialization-Template.md (partial - Step 3, 5, 10 updated)

### In Progress
- Feature-Add-Template.md
- Feature-Refine-Template.md
- Implementation-Template.md
- UI-UX-Design-Template.md
- Database-Design-Template.md
- Cybersecurity-Validation-Template.md
- Feature-Design-Template.md
- Requirements-Gathering-Template.md
- Architecture-Decision-Template.md
- Flow-Breakdown-Template.md
- Setup-Scaffolding-Template.md
- Code-Review-Template.md
- Testing-and-TDD-Template.md
- Deployment-Template.md
- Maintenance-and-Monitoring-Template.md
- Finalization-and-Docs-Template.md

## Update Pattern

**Before (Hardcoded):**
```
**Question X:** [Question text]
**Your Answer:** [Answer]

**Dynamic Follow-ups (if Yes):**
- **Question Xa:** [Follow-up question]
- **Your Answer:** [Answer]
- **If Yes:**
  - **Question Xa-1:** [Nested question]
  - **Your Answer:** [Answer]
```

**After (Dynamic):**
```
**Question X:** [Question text]
**Your Answer:** [Answer]

**Instructions for AI:** Based on the user's answer to Question X, dynamically generate follow-up questions. If the answer is "Yes", ask about [relevant topics]. For each [item] mentioned, generate questions about [specific aspects]. Generate these questions on the fly based on the specific [items] mentioned.
```

## Key Principles

1. **No Predefined Questions:** All follow-up questions must be generated at runtime based on user answers
2. **Context-Aware:** Questions should adapt to the specific services, platforms, or data types mentioned
3. **Progressive Disclosure:** Ask only what's needed based on previous answers
4. **Self-Contained:** Each template remains a complete, runnable markdown prompt
