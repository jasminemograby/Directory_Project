# Profile Updates Summary

## ✅ מה עודכן

### 1. Skills Tree
- ✅ הוסרה כותרת "COMPETENCIES" - רק היררכיה: competencies → nested competencies → skills
- ✅ מציג skills עם verification status

### 2. Courses Section
- ✅ עודכן להבין שני מקורות:
  - **Course Builder**: `feedback, course_id, course_name, learner_id` (completed courses)
  - **Content Studio**: `course_id, course_name, trainer_id, trainer_name, status` (taught courses for trainers)
- ✅ הוספה תמיכה ב-taught courses (למאמנים)

### 3. Value Proposition
- ✅ נוצר על ידי Gemini מ-`CURRENT_ROLE` + `TARGET_ROLE`
- ✅ Service חדש: `valuePropositionService.js`
- ✅ נשמר ב-database ב-`employees.value_proposition`
- ✅ נוצר אוטומטית אם לא קיים

### 4. API Routes
- ✅ `/api/profile/employee/:employeeId` - פרופיל מלא
- ✅ `/api/profile/employee/:employeeId/value-proposition` - value proposition
- ✅ `/api/profile/employee/:employeeId/courses/completed` - קורסים מ-Course Builder
- ✅ `/api/profile/trainer/:trainerId/courses/taught` - קורסים מ-Content Studio
- ✅ `/api/profile/employee/:employeeId/courses/assigned` - קורסים שהוקצו (עתיד)
- ✅ `/api/profile/employee/:employeeId/courses/learning` - קורסים בתהליך

### 5. Database Migration
- ✅ `add_value_proposition_fields.sql` - מוסיף `current_role` ו-`value_proposition`
- ✅ `target_role` כבר קיים ב-schema

### 6. Mock Data
- ✅ `mockData.js` - רק fallback אם API לא עובד
- ✅ Frontend מנסה API קודם, נופל ל-mock רק אם נכשל

## 📋 מה נדרש עכשיו

### 1. Database Migration
הרץ ב-Supabase:
```sql
-- Add current_role and value_proposition
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS current_role VARCHAR(255);

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS value_proposition TEXT;
```

### 2. Environment Variables (Railway)
הוסף:
- `COURSE_BUILDER_URL` - URL של Course Builder microservice
- `CONTENT_STUDIO_URL` - URL של Content Studio microservice
- `SKILLS_ENGINE_URL` - URL של Skills Engine microservice (לעתיד)

### 3. Company Registration
ודא ש-`current_role` ו-`target_role` נשמרים בעת הרשמת חברה.

## 🚧 מה הלאה

1. **Trainer Profile** - Employee + trainer fields
2. **Team Leader Profile** - עם hierarchy tree
3. **Department Manager Profile** - עם full hierarchy
4. **Company Profile** - HR view
5. **Super Admin Profile** - companies list

---

**הקוד נדחף ל-GitHub!** עכשיו צריך:
1. להריץ את ה-migration ב-Supabase
2. להוסיף environment variables ב-Railway
3. להמשיך לבנות את שאר הפרופילים

