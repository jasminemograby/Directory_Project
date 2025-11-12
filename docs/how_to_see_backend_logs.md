# איך לראות את ה-Logs של ה-Backend

## שלבים:

### 1. מצא את הטרמינל של ה-Backend
- אם השרת רץ, יש לך טרמינל/חלון PowerShell שבו רץ `npm start` או `node server.js`
- זה החלון שבו כתוב משהו כמו:
  ```
  Server running on port 5000
  Database connected successfully
  ```

### 2. אם השרת לא רץ, הפעל אותו:
```powershell
cd backend
npm start
```

### 3. מה תראה ב-Logs:
כשאתה שולח טופס, תראה:
- `Step4 Registration Request:` - מה התקבל
- `Validation errors:` - אם יש שגיאות validation
- `Step4 Registration Error:` - אם יש שגיאה אחרת

## דוגמה ל-Logs תקינים:
```
Step4 Registration Request: {
  registrationId: '...',
  employeesCount: 1,
  departmentsCount: 0,
  learningPathPolicy: 'auto',
  hasDecisionMaker: false
}
Executed query { text: 'SELECT id, verification_status FROM companies...', duration: 45, rows: 1 }
Executed query { text: 'INSERT INTO employees...', duration: 23, rows: 1 }
...
```

## דוגמה ל-Logs עם שגיאה:
```
Validation errors: [
  {
    msg: 'All employees must have name, email, currentRole, targetRole, and type',
    param: 'employees',
    location: 'body'
  }
]
Request body: {
  "registrationId": "...",
  "employees": [...],
  ...
}
```

## אם לא רואה Logs:
1. ודא שהשרת רץ
2. ודא שאתה מסתכל על הטרמינל הנכון
3. נסה לשלוח את הטופס שוב
4. אם עדיין לא רואה כלום, שלח לי screenshot של הטרמינל

