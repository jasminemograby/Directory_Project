# איך לעצור ולהפעיל מחדש את ה-Backend Server

## אם השרת כבר רץ על פורט 5000

### דרך 1: מצא והרוג את ה-Process

1. **מצא את ה-PID של השרת:**
   ```powershell
   netstat -ano | findstr :5000
   ```
   זה יציג משהו כמו:
   ```
   TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING       20464
   ```
   ה-PID הוא המספר האחרון (כאן: 20464)

2. **הרוג את ה-Process:**
   ```powershell
   taskkill /F /PID [PID]
   ```
   לדוגמה:
   ```powershell
   taskkill /F /PID 20464
   ```

3. **הפעל מחדש את השרת:**
   ```powershell
   cd backend
   npm start
   ```

### דרך 2: מצא את הטרמינל שבו השרת רץ

1. **פתח את כל חלונות הטרמינל/PowerShell**
2. **חפש את הטרמינל שבו כתוב:**
   ```
   Server running on port 5000
   Database connected successfully
   ```
3. **לחץ `Ctrl+C` כדי לעצור את השרת**
4. **הרץ מחדש:**
   ```powershell
   cd backend
   npm start
   ```

## אם השרת לא רץ

פשוט הפעל אותו:

```powershell
cd backend
npm start
```

## איך לבדוק שהשרת רץ

1. **בדוק את הפורט:**
   ```powershell
   netstat -ano | findstr :5000
   ```
   אם אתה רואה `LISTENING`, השרת רץ.

2. **בדוק את ה-Health Check:**
   ```powershell
   curl http://localhost:5000/api/health
   ```
   אם אתה רואה `{"success":true,"message":"Server is running"}`, השרת רץ.

## טיפים

- **שמור את הטרמינל פתוח** - כך תראה את כל ה-Logs בזמן אמת
- **אל תסגור את הטרמינל** - אם תסגור אותו, השרת יעצור
- **אם השרת נעצר** - פשוט הרץ `npm start` שוב

