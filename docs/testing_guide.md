# מדריך בדיקה - Directory System

## 📋 תוכן עניינים
1. [הכנה לבדיקה](#הכנה-לבדיקה)
2. [בדיקות End-to-End](#בדיקות-end-to-end)
3. [בדיקות RBAC](#בדיקות-rbac)
4. [בדיקות Company Isolation](#בדיקות-company-isolation)
5. [בדיקות Profile Visibility](#בדיקות-profile-visibility)
6. [בדיקות Requests System](#בדיקות-requests-system)
7. [בדיקות Profile Pages](#בדיקות-profile-pages)
8. [בדיקות API](#בדיקות-api)

---

## הכנה לבדיקה

### 1. בדיקת סביבת הפיתוח

```bash
# Backend
cd backend
npm install
npm start  # או npm run dev

# Frontend
cd frontend
npm install
npm start  # או npm run dev
```

### 2. בדיקת חיבור למסד הנתונים

```bash
# בדוק שהמסד הנתונים פעיל
# בדוק את ה-.env files
# Backend: backend/.env
# Frontend: frontend/.env
```

### 3. הכנת נתוני בדיקה

**אפשרויות:**
1. **יצירת חברה חדשה דרך UI** (מומלץ)
2. **הזנת נתונים ישירות למסד הנתונים** (לבדיקות מתקדמות)

---

## בדיקות End-to-End

### תרחיש 1: רישום חברה → התחברות HR → אישור פרופילים

**שלבים:**
1. פתח את האפליקציה: `http://localhost:3000` (או URL של Vercel)
2. לחץ על "Register Your Company"
3. מלא את פרטי החברה:
   - שם חברה
   - תעשייה
   - Domain
   - פרטי HR (שם, אימייל)
4. המשך לשלב הבא - הוסף מחלקות וצוותים
5. הוסף עובדים (לפחות 3-4 עובדים)
6. סיים את הרישום

**בדיקות:**
- ✅ החברה נוצרה בהצלחה
- ✅ כל העובדים נוצרו
- ✅ HR מועבר ל-HR Dashboard
- ✅ HR רואה רשימת פרופילים ממתינים

**המשך:**
7. התחבר כ-HR (אימייל של HR)
8. עבור ל-HR Dashboard
9. בדוק את סעיף "Pending Profiles"
10. לחץ על פרופיל → "Approve" או "Reject"
11. בדוק שהסטטוס השתנה

**תוצאה צפויה:**
- ✅ פרופיל מאושר → `profile_status = 'approved'`
- ✅ פרופיל נדחה → `profile_status = 'rejected'`

---

### תרחיש 2: התחברות עובד → צפייה בפרופיל

**שלבים:**
1. התחבר עם אימייל של עובד רגיל
2. בדוק שהמערכת מעבירה אותך ל-`/profile`
3. בדוק שהפרופיל נטען

**בדיקות:**
- ✅ הפרופיל מציג את כל הסעיפים:
  - שם ואימייל
  - Bio (אם קיים)
  - Projects (אם קיימים)
  - Career Block (current role, target role, value proposition, relevance score)
  - Skills Tree (hierarchical skills)
  - Courses Section (assigned, learning, completed)
  - Requests Section (כפתורים ליצירת בקשות)

**המשך:**
4. לחץ על "Enhance Profile"
5. התחבר ל-GitHub (או LinkedIn)
6. בדוק שהפרופיל מתעדכן עם נתונים מ-GitHub

**תוצאה צפויה:**
- ✅ Bio נוצר אוטומטית (Gemini)
- ✅ Projects מופיעים (מ-GitHub)
- ✅ Skills מתעדכנים (mock Skills Engine)

---

### תרחיש 3: התחברות Trainer → צפייה בפרופיל Trainer

**שלבים:**
1. התחבר עם אימייל של Trainer (`type = 'internal_instructor'` או `'external_instructor'`)
2. בדוק שהמערכת מעבירה אותך ל-`/trainer/profile`
3. בדוק שהפרופיל נטען

**בדיקות:**
- ✅ כל הסעיפים של Employee Profile
- ✅ Trainer Info Section (status, AI enabled, public publish enabled)
- ✅ Courses Taught (מ-Content Studio - mock)
- ✅ Teaching Requests Section

---

### תרחיש 4: התחברות Team Leader → צפייה בהיררכיה

**שלבים:**
1. התחבר עם אימייל של Team Leader (עובד שהוא `team.manager_id`)
2. בדוק שהמערכת מעבירה אותך ל-`/team-leader/profile`
3. בדוק שהפרופיל נטען

**בדיקות:**
- ✅ כל הסעיפים של Employee Profile
- ✅ Hierarchy Tree (Team → Employees)
- ✅ לחיצה על עובד → מעבר לפרופיל שלו

**תוצאה צפויה:**
- ✅ Team Leader רואה רק את העובדים בצוות שלו
- ✅ לחיצה על עובד מעבירה לפרופיל שלו

---

### תרחיש 5: התחברות Department Manager → צפייה בהיררכיה מלאה

**שלבים:**
1. התחבר עם אימייל של Department Manager (עובד שהוא `department.manager_id`)
2. בדוק שהמערכת מעבירה אותך ל-`/department-manager/profile`
3. בדוק שהפרופיל נטען

**בדיקות:**
- ✅ כל הסעיפים של Employee Profile
- ✅ Hierarchy Tree (Department → Teams → Employees)
- ✅ לחיצה על עובד → מעבר לפרופיל שלו

**תוצאה צפויה:**
- ✅ Department Manager רואה את כל המחלקה שלו
- ✅ לחיצה על עובד מעבירה לפרופיל שלו

---

## בדיקות RBAC

### בדיקה 1: גישה לפי תפקיד

**מטרה:** לוודא שכל תפקיד מועבר לדף הנכון

| תפקיד | Route צפוי | בדיקה |
|--------|------------|-------|
| HR | `/hr/dashboard` | ✅ |
| Employee | `/profile` | ✅ |
| Trainer | `/trainer/profile` | ✅ |
| Team Leader | `/team-leader/profile` | ✅ |
| Department Manager | `/department-manager/profile` | ✅ |
| Admin | `/admin/dashboard` | ✅ |

**איך לבדוק:**
1. התחבר עם כל תפקיד בנפרד
2. בדוק שהמערכת מעבירה אותך ל-Route הנכון
3. בדוק שהדף נטען בהצלחה

---

### בדיקה 2: Protected Routes

**מטרה:** לוודא שרק משתמשים מורשים יכולים לגשת לדפים

**שלבים:**
1. התחבר כ-Employee רגיל
2. נסה לגשת ל-`/hr/dashboard` ישירות (בכתובת)
3. נסה לגשת ל-`/admin/dashboard` ישירות

**תוצאה צפויה:**
- ✅ מעבר ל-`/error/403` (Forbidden)
- ✅ או מעבר ל-`/profile` (דף ברירת מחדל)

---

### בדיקה 3: RBAC Type vs Role

**מטרה:** לוודא שהמערכת משתמשת ב-`employee.type` (לא `employee.role`)

**שלבים:**
1. בדוק במסד הנתונים שיש עובד עם:
   - `type = 'regular'` (או `'internal_instructor'`)
   - `role = 'QA'` (או כל תפקיד מקצועי אחר)
2. התחבר עם האימייל של העובד הזה
3. בדוק שהמערכת קובעת את הגישה לפי `type` (לא `role`)

**תוצאה צפויה:**
- ✅ עובד עם `type = 'regular'` → `/profile` (לא לפי `role = 'QA'`)
- ✅ עובד עם `type = 'internal_instructor'` → `/trainer/profile`

---

## בדיקות Company Isolation

### בדיקה 1: מניעת גישה בין חברות

**מטרה:** לוודא שעובד מחברה A לא יכול לגשת לנתונים של חברה B

**שלבים:**
1. צור שתי חברות (Company A ו-Company B)
2. צור עובדים בכל חברה
3. התחבר כ-Employee מחברה A
4. נסה לגשת לפרופיל של Employee מחברה B (ישירות ב-URL: `/profile/{employee-id-from-company-b}`)

**תוצאה צפויה:**
- ✅ 403 Forbidden
- ✅ הודעת שגיאה: "Access denied: Employees must be from the same company"

---

### בדיקה 2: Company Isolation ב-Requests

**שלבים:**
1. התחבר כ-Employee מחברה A
2. נסה ליצור בקשה עבור Employee מחברה B:
   ```
   POST /api/requests/training/{employee-id-from-company-b}
   ```

**תוצאה צפויה:**
- ✅ 403 Forbidden
- ✅ הודעת שגיאה: "Access denied: Employees must be from the same company"

---

### בדיקה 3: Company Isolation ב-Profile

**שלבים:**
1. התחבר כ-Employee מחברה A
2. נסה לגשת לפרופיל של Employee מחברה B:
   ```
   GET /api/profile/employee/{employee-id-from-company-b}
   ```

**תוצאה צפויה:**
- ✅ 403 Forbidden
- ✅ הודעת שגיאה: "You do not have permission to view this profile"

---

## בדיקות Profile Visibility

### בדיקה 1: HR רואה את כל העובדים

**שלבים:**
1. התחבר כ-HR
2. עבור ל-HR Dashboard
3. בדוק את רשימת העובדים

**תוצאה צפויה:**
- ✅ HR רואה את כל העובדים בחברה שלו
- ✅ HR יכול ללחוץ על כל עובד ולראות את הפרופיל שלו

---

### בדיקה 2: Department Manager רואה רק את המחלקה שלו

**שלבים:**
1. צור מחלקה עם 2 צוותים
2. צור עובדים בכל צוות
3. התחבר כ-Department Manager
4. בדוק את ההיררכיה

**תוצאה צפויה:**
- ✅ Department Manager רואה רק את העובדים במחלקה שלו
- ✅ Department Manager לא רואה עובדים ממחלקות אחרות

---

### בדיקה 3: Team Leader רואה רק את הצוות שלו

**שלבים:**
1. צור צוות עם 3-4 עובדים
2. התחבר כ-Team Leader
3. בדוק את ההיררכיה

**תוצאה צפויה:**
- ✅ Team Leader רואה רק את העובדים בצוות שלו
- ✅ Team Leader לא רואה עובדים מצוותים אחרים

---

### בדיקה 4: Employee רואה רק את הפרופיל שלו

**שלבים:**
1. התחבר כ-Employee רגיל
2. נסה לגשת לפרופיל של Employee אחר (ישירות ב-URL)

**תוצאה צפויה:**
- ✅ 403 Forbidden
- ✅ הודעת שגיאה: "Employees can only view their own profile"

---

## בדיקות Requests System

### בדיקה 1: יצירת Training Request

**שלבים:**
1. התחבר כ-Employee
2. עבור ל-`/profile`
3. גלול ל-Requests Section
4. לחץ על "Request Training"
5. מלא את הפרטים:
   - Course ID
   - Course Name
   - Reason (אופציונלי)
   - Target Date (אופציונלי)
6. שלח את הבקשה

**תוצאה צפויה:**
- ✅ הבקשה נוצרה בהצלחה
- ✅ הסטטוס הוא `pending`
- ✅ HR רואה את הבקשה ב-HR Dashboard

---

### בדיקה 2: יצירת Skill Verification Request

**שלבים:**
1. התחבר כ-Employee
2. עבור ל-`/profile`
3. גלול ל-Skills Tree
4. לחץ על "Verify Your Skills"
5. בחר skills (או כל ה-skills)
6. שלח את הבקשה

**תוצאה צפויה:**
- ✅ הבקשה נוצרה בהצלחה
- ✅ הסטטוס הוא `pending`
- ✅ HR רואה את הבקשה ב-HR Dashboard

---

### בדיקה 3: יצירת Self-Learning Request

**שלבים:**
1. התחבר כ-Employee
2. עבור ל-`/profile`
3. גלול ל-Requests Section
4. לחץ על "Request Self-Learning"
5. מלא את הפרטים:
   - Topic
   - Description
   - Estimated Hours
   - Target Date
6. שלח את הבקשה

**תוצאה צפויה:**
- ✅ הבקשה נוצרה בהצלחה
- ✅ הסטטוס הוא `pending`
- ✅ HR רואה את הבקשה ב-HR Dashboard

---

### בדיקה 4: HR מאשר/דוחה בקשה

**שלבים:**
1. התחבר כ-HR
2. עבור ל-HR Dashboard
3. בדוק את סעיף "Pending Requests"
4. לחץ על בקשה
5. בחר "Approve" או "Reject"
6. הוסף Notes (אופציונלי)
7. שלח

**תוצאה צפויה:**
- ✅ הסטטוס מתעדכן ל-`approved` או `rejected`
- ✅ העובד יכול לראות את הסטטוס בפרופיל שלו

---

## בדיקות Profile Pages

### בדיקה 1: Employee Profile

**URL:** `/profile` או `/profile/{employee-id}`

**בדיקות:**
- ✅ Top Section (שם, אימייל, כפתורי Edit/Dashboard)
- ✅ External Data Icons (LinkedIn, GitHub, Credly, ORCID, Crossref, YouTube)
- ✅ Professional Bio (אם קיים)
- ✅ Projects Section (אם קיים)
- ✅ Career Block (current role, target role, value proposition, relevance score)
- ✅ Skills Tree (hierarchical competencies → skills)
- ✅ Courses Section (assigned, learning, completed)
- ✅ Requests Section (כפתורים ליצירת בקשות)
- ✅ Enhance Profile Section (OAuth for LinkedIn/GitHub)

---

### בדיקה 2: Trainer Profile

**URL:** `/trainer/profile` או `/trainer/profile/{employee-id}`

**בדיקות:**
- ✅ כל הסעיפים של Employee Profile
- ✅ Trainer Info Section (status, AI enabled, public publish enabled)
- ✅ Courses Taught (מ-Content Studio - mock)
- ✅ Teaching Requests Section

---

### בדיקה 3: Team Leader Profile

**URL:** `/team-leader/profile` או `/team-leader/profile/{employee-id}`

**בדיקות:**
- ✅ כל הסעיפים של Employee Profile
- ✅ Hierarchy Tree (Team → Employees)
- ✅ לחיצה על עובד → מעבר לפרופיל שלו

---

### בדיקה 4: Department Manager Profile

**URL:** `/department-manager/profile` או `/department-manager/profile/{employee-id}`

**בדיקות:**
- ✅ כל הסעיפים של Employee Profile
- ✅ Hierarchy Tree (Department → Teams → Employees)
- ✅ לחיצה על עובד → מעבר לפרופיל שלו

---

### בדיקה 5: Company Profile

**URL:** `/company/{company-id}`

**בדיקות:**
- ✅ Company Overview (שם, תעשייה, domain, סטטוס)
- ✅ Primary KPIs
- ✅ Statistics (departments, teams, employees)
- ✅ Learning Path Approval Policy
- ✅ Hierarchy Tree (Company → Departments → Teams → Employees)
- ✅ Requests Section (pending approvals)
- ✅ Employee List (טבלה עם כל העובדים)
- ✅ Company Dashboard Button (מעבר ל-Learning Analytics)

---

### בדיקה 6: Super Admin Profile

**URL:** `/admin/dashboard`

**בדיקות:**
- ✅ Companies Tab (כל החברות עם סטטיסטיקות)
- ✅ Employees Tab (כל העובדים בכל החברות, read-only)
- ✅ Logs Tab (system logs - placeholder)
- ✅ Analytics Dashboard Button (מעבר ל-Management Reporting)

---

## בדיקות API

### בדיקה 1: Health Check

```bash
# Backend Health Check
curl http://localhost:5000/health

# Expected: {"status":"ok","timestamp":"..."}
```

---

### בדיקה 2: Get Employee Profile

```bash
# Get employee profile
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/profile/employee/{employee-id}

# Expected: Full employee profile with all sections
```

---

### בדיקה 3: Create Training Request

```bash
# Create training request
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course-123",
    "course_name": "JavaScript Basics",
    "reason": "Need to learn JavaScript",
    "target_date": "2024-12-31"
  }' \
  http://localhost:5000/api/requests/training/{employee-id}

# Expected: Request created with status "pending"
```

---

### בדיקה 4: Get Pending Requests (HR)

```bash
# Get pending requests
curl -H "Authorization: Bearer {hr-token}" \
  http://localhost:5000/api/requests/pending

# Expected: List of all pending requests
```

---

### בדיקה 5: Approve Request

```bash
# Approve training request
curl -X PUT \
  -H "Authorization: Bearer {hr-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Approved for training"
  }' \
  http://localhost:5000/api/requests/training/{request-id}

# Expected: Request status updated to "approved"
```

---

## 🐛 דיבוג

### בעיות נפוצות

**1. "Employee not found"**
- בדוק שהאימייל קיים במסד הנתונים
- בדוק שהעובד שייך לחברה

**2. "Access denied"**
- בדוק את RBAC type של המשתמש
- בדוק את Company Isolation

**3. "Profile not found"**
- בדוק שה-`employee-id` תקין
- בדוק שהפרופיל קיים במסד הנתונים

**4. "Request creation failed"**
- בדוק את ה-request body
- בדוק את ה-company_id
- בדוק את ה-validations

---

## 📊 Checklist לבדיקה מלאה

### Phase 1: Authentication & Role Detection
- [ ] התחברות עם כל תפקיד
- [ ] ניתוב אוטומטי לפי תפקיד
- [ ] Protected Routes

### Phase 2: HR Profile Approval
- [ ] HR רואה רשימת פרופילים ממתינים
- [ ] HR מאשר/דוחה פרופיל
- [ ] סטטוס הפרופיל מתעדכן

### Phase 3: Mock Skills & Courses
- [ ] Skills Tree מופיע בפרופיל
- [ ] Courses Section מופיע בפרופיל
- [ ] Career Block מופיע בפרופיל

### Phase 4: Requests System
- [ ] יצירת Training Request
- [ ] יצירת Skill Verification Request
- [ ] יצירת Self-Learning Request
- [ ] HR מאשר/דוחה בקשות

### Phase 5: Company Isolation & Profile Visibility
- [ ] מניעת גישה בין חברות
- [ ] HR רואה את כל העובדים
- [ ] Department Manager רואה רק את המחלקה שלו
- [ ] Team Leader רואה רק את הצוות שלו
- [ ] Employee רואה רק את הפרופיל שלו

### Phase 6: Profile Pages
- [ ] Employee Profile מלא
- [ ] Trainer Profile מלא
- [ ] Team Leader Profile מלא
- [ ] Department Manager Profile מלא
- [ ] Company Profile מלא
- [ ] Super Admin Profile מלא

---

## ✅ סיכום

לאחר השלמת כל הבדיקות, המערכת אמורה להיות:
- ✅ פונקציונלית לחלוטין
- ✅ מאובטחת (RBAC + Company Isolation)
- ✅ מוכנה לבדיקות end-to-end
- ✅ מוכנה לאינטגרציה עם מיקרוסרבסים אמיתיים

**הערה:** חלק מהתכונות משתמשות ב-mock data (Skills Engine, Course Builder, Content Studio) - זה תקין עד שהמיקרוסרבסים האמיתיים יהיו מוכנים.
