# הוראות בדיקה - Company Registration Step 3

## לפני הבדיקה - נקה את המסד נתונים

אם יש לך מחלקות/צוותים קיימים מהנסיונות הקודמים, מחק אותם או השתמש בשמות חדשים.

## תרחיש 1: עובד אחד + AUTO APPROVAL (ללא מחלקות)

### שלבים:
1. לך ל-`http://localhost:3000/company/register/step3`
2. **הוסף עובד אחד:**
   - Name: `John Doe`
   - Email: `john.doe@testcompany.com`
   - Current Role: `Developer`
   - Target Role: `Senior Developer`
   - Type: `Employee`
   - Department: (השאר ריק - לא חובה)
   - Team: (השאר ריק - לא חובה)
   - External Links: (אופציונלי)

3. **Learning Path Policy:**
   - בחר: **Auto-Approval** (לא Manual!)

4. **Organizational Settings:**
   - Exercise Limit: `10` (אופציונלי)
   - Passing Grade: `70` (אופציונלי)
   - Max Attempts: `3` (אופציונלי)

5. לחץ **Submit Registration**

### תוצאה צפויה:
✅ הצלחה - הודעת הצלחה והפנייה ל-HR Landing

---

## תרחיש 2: עובד אחד + מחלקה (ללא צוותים)

### שלבים:
1. לך ל-`http://localhost:3000/company/register/step3`
2. **הוסף עובד אחד:**
   - Name: `Jane Smith`
   - Email: `jane.smith@testcompany.com`
   - Current Role: `Manager`
   - Target Role: `Senior Manager`
   - Type: `Employee`
   - Department: (השאר ריק - נבחר אחר כך)
   - Team: (השאר ריק)

3. **הוסף מחלקה:**
   - לחץ **+ Add Department**
   - Department Name: `Engineering` (או שם אחר - **חשוב: שם חדש שלא קיים!**)
   - Department Manager: בחר את העובד `Jane Smith (jane.smith@testcompany.com)`
   - לחץ **Save**

4. **הקצה את העובד למחלקה:**
   - לחץ על העובד `Jane Smith`
   - בחר Department: `Engineering`
   - שמור

5. **Learning Path Policy:**
   - בחר: **Auto-Approval** או **Manual Approval**
   - אם Manual - בחר Decision Maker: `Jane Smith`

6. לחץ **Submit Registration**

### תוצאה צפויה:
✅ הצלחה - הודעת הצלחה והפנייה ל-HR Landing

---

## תרחיש 3: עובדים + מחלקה + צוות

### שלבים:
1. לך ל-`http://localhost:3000/company/register/step3`
2. **הוסף עובד ראשון (מנהל מחלקה):**
   - Name: `Alice Manager`
   - Email: `alice@testcompany.com`
   - Current Role: `Department Manager`
   - Target Role: `Senior Manager`
   - Type: `Employee`

3. **הוסף עובד שני (מנהל צוות):**
   - Name: `Bob TeamLead`
   - Email: `bob@testcompany.com`
   - Current Role: `Team Lead`
   - Target Role: `Engineering Manager`
   - Type: `Employee`

4. **הוסף עובד שלישי (עובד רגיל):**
   - Name: `Charlie Dev`
   - Email: `charlie@testcompany.com`
   - Current Role: `Developer`
   - Target Role: `Senior Developer`
   - Type: `Employee`

5. **הוסף מחלקה:**
   - Department Name: `Product Development` (**שם חדש!**)
   - Department Manager: `Alice Manager (alice@testcompany.com)`
   - לחץ **Save**

6. **הוסף צוות במחלקה:**
   - לחץ על המחלקה `Product Development`
   - לחץ **+ Add Team**
   - Team Name: `Frontend Team` (**שם חדש!**)
   - Team Manager: `Bob TeamLead (bob@testcompany.com)`
   - לחץ **Save**

7. **הקצה עובדים:**
   - `Charlie Dev` → Department: `Product Development`, Team: `Frontend Team`

8. **Learning Path Policy:**
   - בחר: **Manual Approval**
   - Decision Maker: `Alice Manager (alice@testcompany.com)`

9. לחץ **Submit Registration**

### תוצאה צפויה:
✅ הצלחה - הודעת הצלחה והפנייה ל-HR Landing

---

## פתרון בעיות

### אם מקבל "Validation Error":
- ✅ ודא ש-Learning Path Policy הוא **Auto-Approval** (לא Manual)
- ✅ ודא שכל העובדים מלאים: name, email, currentRole, targetRole, type
- ✅ ודא שה-email תקין (format: `user@domain.com`)

### אם מקבל "Duplicate entry":
- ✅ **השתמש בשמות חדשים למחלקות/צוותים** (לא קיימים במסד הנתונים)
- ✅ או מחק את המחלקות/צוותים הקיימים מהמסד נתונים
- ✅ הבדיקה היא case-insensitive (Engineering = engineering)

### אם מקבל "Connection timeout":
- ✅ בדוק שהשרת רץ
- ✅ בדוק את החיבור למסד הנתונים
- ✅ נסה שוב (יכול להיות בעיית רשת זמנית)

---

## טיפים

1. **תמיד התחל עם עובד אחד + AUTO** - הכי פשוט
2. **השתמש בשמות ייחודיים** למחלקות/צוותים
3. **אם יש בעיה, בדוק את ה-console** בדפדפן (F12) לראות את השגיאה המדויקת
4. **אם יש בעיה, בדוק את ה-logs** בשרת (backend terminal)

