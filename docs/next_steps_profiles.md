# Next Steps - Complete Profile Implementation

## ✅ מה הושלם

### Employee Profile - COMPLETE
- ✅ Top Section (Name, Email, Buttons, External Data Icons)
- ✅ Bio Section (AI-generated from Gemini)
- ✅ Career Block (Current Role, Target Role, Value Proposition, Relevance Score)
- ✅ Skills Tree (Hierarchical, no "COMPETENCIES" title)
- ✅ Courses Section (Course Builder + Content Studio integration)
- ✅ Projects Section (From Gemini)
- ✅ Requests Section (Training, Trainer, Skill Verification, Self-Learning)

### Backend Services
- ✅ Value Proposition Service (Gemini-based)
- ✅ Profile Controller (API endpoints)
- ✅ Profile Routes
- ✅ Course Builder integration (with fallback)
- ✅ Content Studio integration (with fallback)

## 🚧 מה נדרש עכשיו

### 1. Database Migration (Supabase)
הרץ את ה-SQL:
```sql
-- Add current_role and value_proposition columns
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS current_role VARCHAR(255);

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS value_proposition TEXT;
```

### 2. Company Registration - Update
ודא ש-`current_role` ו-`target_role` נשמרים בעת הרשמת חברה.

בדוק ב-`companyRegistrationController.js` - האם השדות האלה נשמרים?

### 3. Environment Variables (Railway)
הוסף:
- `COURSE_BUILDER_URL` - URL של Course Builder
- `CONTENT_STUDIO_URL` - URL של Content Studio
- `SKILLS_ENGINE_URL` - URL של Skills Engine (לעתיד)

## 📋 מה הלאה - שאר הפרופילים

### Trainer Profile
- כל מה שיש ב-Employee Profile
- Trainer Status (Invited → Active → Archived)
- AI Enabled (boolean)
- Public Publish Enabled (boolean)
- Courses Taught (מ-Content Studio)
- Teaching Requests

### Team Leader Profile
- כל מה שיש ב-Employee/Trainer Profile
- Hierarchy Section (foldable tree)
- List of team members (clickable)

### Department Manager Profile
- כל מה שיש ב-Employee/Trainer Profile
- Full Hierarchy (Department → Teams → Employees)
- Clickable nodes

### Company Profile (HR)
- Overview Section
- Company name, Industry, Departments, Teams
- Primary KPIs
- Auto-Approval or Manual approval mode
- Decision Makers list
- Hierarchy Tree (full organization map)
- Requests Section
- Employee List
- Company Dashboard (redirects to Learning Analytics)

### Super Admin Profile
- List of all companies
- Click-through to each company profile
- Logs dashboard
- Read-only view of all employee profiles

---

**האם להמשיך לבנות את שאר הפרופילים עכשיו?**

