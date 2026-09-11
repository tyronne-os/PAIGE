# PAIGE IDE - Project Structure Clarification

**Date:** September 10, 2026  
**Update:** Directory rename completed for clarity

---

## Directory Organization

### Primary Project
**Path:** `/home/hunt/Downloads/FRONTAL-LOBE-ML/`  
**Name:** FRONTAL LOBE ML (Main Project Container)  
**GitHub Repo:** https://github.com/tyronne-os/connie-crane  
**Status:** ✓ Renamed from "FOR SQL" to reduce confusion

**Contents:**
- Main ML orchestration and sports data analysis
- GOCLONE setup and configuration
- Data playbooks and backend architecture
- Reference sites data extraction
- Free sports data stack integration

### Sub-Project: SQL Data Lake Builder
**Path:** `/home/hunt/Downloads/FRONTAL-LOBE-ML/sql-data-lake-builder/`  
**Name:** sql-data-lake-builder  
**Type:** Data Lake Builder Component  
**Status:** ✓ Part of FRONTAL LOBE ML project

**Contents:**
- CLI tools for SQL data extraction
- CRANE integration module
- Model configuration system
- Data verification and testing
- Output generation (CSV, JSON, XLSX)

---

## Why the Rename?

**Before (Confusing):**
```
/home/hunt/Downloads/FOR SQL/              ← Generic name with space + backslash
├── FRONTAL_LOBE_COMPLETE_STACK.md        ← Actual app name inside
├── sql-data-lake-builder/                 ← Subproject
├── goclone/                               ← Component
└── ... other files
```

**After (Clear):**
```
/home/hunt/Downloads/FRONTAL-LOBE-ML/      ← Matches actual application name
├── FRONTAL_LOBE_COMPLETE_STACK.md        ← Describes the contents
├── sql-data-lake-builder/                 ← Subproject
├── goclone/                               ← Component
└── ... other files
```

---

## Project Loading in PAIGE IDE

**When loading FRONTAL LOBE ML into PAIGE:**

```javascript
// Project structure when loaded
{
  "name": "FRONTAL-LOBE-ML",
  "path": "/home/hunt/Downloads/FRONTAL-LOBE-ML",
  "type": "local",
  "files": 50+,
  "directories": ["sql-data-lake-builder", "goclone", "schemas"],
  "components": [
    "FRONTAL LOBE COMPLETE STACK (main orchestration)",
    "SQL Data Lake Builder (data pipeline)",
    "GoClone (data scraping)",
    "Backend Architecture (Flask + ML)"
  ]
}
```

---

## GitHub Repository Link

**Main Repo:** https://github.com/tyronne-os/connie-crane

Both the parent directory and subdirectories commit to the same GitHub repo:
- Parent: `/home/hunt/Downloads/FRONTAL-LOBE-ML/`
- Subproject: `/home/hunt/Downloads/FRONTAL-LOBE-ML/sql-data-lake-builder/`
- Both sync to: `tyronne-os/connie-crane`

---

## How to Load into PAIGE

**Option 1: Via GitHub Browser (PAIGE IDE)**
1. Click GitHub button
2. Search for "connie-crane"
3. Click "📂 Load Project" 
4. Wait for file tree to load
5. Should show FRONTAL-LOBE-ML structure with subproject

**Option 2: Via API**
```bash
curl -X POST http://localhost:8002/api/project/load \
  -H "Content-Type: application/json" \
  -d '{"projectPath": "/home/hunt/Downloads/FRONTAL-LOBE-ML"}'
```

**Option 3: Via PAIGE Chat**
- Type: "Load FRONTAL LOBE ML project"
- PAIGE will navigate to Project mode with file tree

---

## Quick Reference

| Item | Old | New | Path |
|---|---|---|---|
| Main Directory | FOR SQL | FRONTAL-LOBE-ML | `/home/hunt/Downloads/FRONTAL-LOBE-ML/` |
| Sub-Project | sql-data-lake-builder | sql-data-lake-builder | `.../FRONTAL-LOBE-ML/sql-data-lake-builder/` |
| GitHub Repo | connie-crane | connie-crane | github.com/tyronne-os/connie-crane |
| Main App | FRONTAL_LOBE_* | FRONTAL LOBE ML | Clarified naming |

---

## Next Steps

1. ✓ Directory renamed to `FRONTAL-LOBE-ML`
2. ✓ GitHub repo link confirmed (`connie-crane`)
3. ✓ Project structure documented
4. → Update PAIGE IDE recent projects list
5. → Test loading full project structure
6. → Verify all subcomponents load correctly

---

**Summary:** The confusion is eliminated. FRONTAL LOBE ML is now the clear, single source of truth for your ML project, with sql-data-lake-builder as its data pipeline subcomponent.
