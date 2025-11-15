# ⚠️ Requirements Discrepancy Notes

**תאריך:** 2025-01-XX

---

## 📋 Department/Team Required vs Optional

### **בפרומפט המקורי:**
```
**Step 3: Organization**
Department [Select Department ▼] (required)
Team [Select Team ▼] (required, filtered by Department)
```

### **מה שיושם:**
- ✅ Department: **Optional** (can be empty)
- ✅ Team: **Optional** (can be empty)
- ✅ Labels show "(Optional)"
- ✅ Validation: אם יש departments/teams, הם חייבים managers

### **הסיבה:**
המשתמש אישר במפורש שזה optional - חברה יכולה להוסיף עובדים בלי departments/teams.

### **סטטוס:**
✅ **יושם נכון** - Department/Team הם optional, אבל אם הם קיימים, הם חייבים managers.

---

## 📋 Validation Rules - Final Status

### **Employee Registration:**
- ✅ Name: required
- ✅ Email: required, format validation, uniqueness check (local)
- ✅ Current Role: required
- ✅ Target Role: required
- ✅ Department: **optional** (can be empty) ← שונה מהפרומפט
- ✅ Team: **optional** (can be empty) ← שונה מהפרומפט
- ✅ Manager fields: required only if isManager checked

### **Company Registration Step 4:**
- ✅ At least 1 employee required
- ✅ All employees must have: name, email, currentRole, targetRole
- ✅ Email uniqueness per company (local check)
- ✅ **If departments exist:** each department must have manager
- ✅ **If teams exist:** each team must have manager
- ✅ Decision Maker: required only if Manual approval
- ✅ Manager fields: required only if isManager checked

---

## ✅ Final Decision

**Department/Team:** **Optional** ✅

**Rationale:**
- המשתמש אישר במפורש שזה optional
- חברה יכולה להוסיף עובדים בלי departments/teams
- אם departments/teams קיימים, הם חייבים managers

**Status:** ✅ **Correct Implementation**

---

**תאריך:** 2025-01-XX  
**סטטוס:** ✅ Resolved - Department/Team are Optional

