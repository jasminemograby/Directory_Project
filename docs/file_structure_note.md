# File Structure Note

## Requirements File Duplication

There are currently two `requirements.md` files:

1. **`docs/requirements.md`** - Original requirements file (your initial version)
2. **`requirements.md`** (root level) - New comprehensive requirements file created during initialization

### Recommendation

The root-level `requirements.md`, `flow.md`, and `architecture.md` are the **working documents** that will be used for the build process. These are the authoritative versions.

The `docs/requirements.md` can be:
- Kept as a reference/backup of your original requirements
- Or removed if you prefer to have only one version

### Standard Structure

According to the orchestrator instructions:
- **Root level:** `requirements.md`, `flow.md`, `architecture.md`, `roadmap.json` (working documents)
- **`docs/` folder:** Artifacts and logs (`feature_log.md`, `change_log.md`, `project_customization.md`, etc.)

After roadmap approval, we can consolidate or archive the duplicate as needed.

