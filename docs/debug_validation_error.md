# פתרון בעיית Validation Error

## איך לבדוק מה הבעיה

### 1. בדוק את ה-Console בדפדפן (F12)
פתח את ה-Console (F12) ובדוק:
- מה נשלח ב-`Sending registration payload:`
- מה השגיאה ב-`Registration error:`

### 2. בדוק את ה-Logs בשרת (Backend Terminal)
בטרמינל של ה-backend, תראה:
- `Step4 Registration Request:` - מה התקבל
- `Validation errors:` - מה השגיאות המדויקות

## בעיות נפוצות ופתרונות

### בעיה 1: Employee missing required fields
**תסמינים:** Validation Error עם "All employees must have name, email, currentRole, targetRole, and type"

**פתרון:**
1. ודא שכל העובדים מלאים:
   - ✅ Name (לא ריק)
   - ✅ Email (פורמט תקין: `user@domain.com`)
   - ✅ Current Role (לא ריק)
   - ✅ Target Role (לא ריק)
   - ✅ Type (Employee/Trainer)

2. אם יש עובד עם שדות חסרים, מחק אותו והוסף מחדש

### בעיה 2: Learning Path Policy format
**תסמינים:** Validation Error עם "Learning path policy must be manual or auto"

**פתרון:**
- ✅ ודא שבחרת **Auto-Approval** או **Manual Approval**
- ✅ אם בחרת Manual, ודא שבחרת Decision Maker

### בעיה 3: Departments not an array
**תסמינים:** Validation Error עם "Departments must be an array"

**פתרון:**
- זה לא אמור לקרות, אבל אם כן - רענן את הדף ונסה שוב

## צעדים לבדיקה

1. **פתח Console בדפדפן (F12)**
2. **נסה לשלוח את הטופס**
3. **העתק את השגיאה מה-Console**
4. **בדוק את ה-Logs בשרת (Backend Terminal)**
5. **שלח לי את השגיאות המדויקות**

## דוגמה לשגיאה תקינה

אם הכל תקין, תראה ב-Console:
```
Sending registration payload: {
  step: 3,
  registrationId: "...",
  employees: [...],
  departments: [],
  learningPathPolicy: "auto",
  ...
}
```

אם יש שגיאה, תראה:
```
Validation errors: [
  {
    msg: "All employees must have name, email, currentRole, targetRole, and type",
    param: "employees",
    ...
  }
]
```

## אם עדיין לא עובד

1. **נקה את ה-localStorage:**
   - פתח Console (F12)
   - הרץ: `localStorage.clear()`
   - רענן את הדף

2. **התחל מחדש מהתחלה:**
   - לך ל-Step 1
   - מלא מחדש את כל הפרטים
   - המשך עד Step 3

3. **בדוק את ה-Database:**
   - ודא שהחברה קיימת במסד הנתונים
   - ודא שה-verification_status הוא 'verified'

