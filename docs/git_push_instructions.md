# הוראות Push ל-GitHub

## שלב 1: בדוק שהכל מוכן

1. **ודא שאין קבצי .env:**
   ```powershell
   git status
   ```
   לא אמור לראות קבצי `.env` ברשימה

2. **ודא ש-.gitignore כולל .env:**
   - קובץ `.gitignore` צריך לכלול `.env`

## שלב 2: הוסף את כל הקבצים

```powershell
git add .
```

## שלב 3: Commit

```powershell
git commit -m "Initial deployment-ready version - F001 Company Registration complete"
```

## שלב 4: הגדר Remote (אם עדיין לא)

אם זה ה-commit הראשון:

```powershell
# החלף <your-github-repo-url> ב-URL של ה-repository שלך
git remote add origin <your-github-repo-url>
```

דוגמה:
```powershell
git remote add origin https://github.com/your-username/directory-project.git
```

## שלב 5: Push ל-GitHub

```powershell
git push -u origin main
```

אם אתה משתמש ב-branch אחר (לא main):
```powershell
git push -u origin <your-branch-name>
```

## אם יש שגיאה: Authentication

אם GitHub מבקש authentication:

1. **אפשרות 1: Personal Access Token**
   - לך ל-GitHub → Settings → Developer settings → Personal access tokens
   - צור token חדש עם הרשאות `repo`
   - השתמש ב-token במקום password

2. **אפשרות 2: SSH**
   - הגדר SSH key ב-GitHub
   - השתמש ב-SSH URL: `git@github.com:username/repo.git`

## אימות שהכל נדחף

לך ל-GitHub repository ובדוק:
- ✅ כל הקבצים קיימים
- ✅ אין קבצי .env
- ✅ יש תיקיות: frontend/, backend/, database/, docs/
- ✅ יש קובץ README.md
- ✅ יש קובץ DEPLOYMENT.md

## אחרי ה-Push

אחרי שה-push הצליח, המשך ל:
1. **Railway Deployment** - ראה `docs/railway_deployment_setup.md`
2. **Vercel Deployment** - ראה `docs/vercel_deployment_setup.md`

