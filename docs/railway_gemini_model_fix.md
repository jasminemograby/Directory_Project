# Railway Gemini Model Fix - CRITICAL

## 🚨 הבעיה

הלוגים מראים שהקוד עדיין משתמש ב-`gemini-pro`:
```
[Gemini] Calling API: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

**אבל הקוד כבר מעודכן ל-`gemini-2.0-flash`!**

## 🔍 הסיבה

יש משתנה סביבה ב-Railway שמחליף את הערך!

## ✅ הפתרון

### שלב 1: בדוק Railway Variables

1. לך ל-Railway → Project → Variables
2. חפשי את `GEMINI_MODEL`
3. אם יש `GEMINI_MODEL=gemini-pro` - **הסרי אותו!**

### שלב 2: אפשרויות

**אופציה A: הסר את המשתנה (מומלץ)**
- הסרי את `GEMINI_MODEL` לחלוטין
- הקוד ישתמש ב-default: `gemini-2.0-flash`

**אופציה B: עדכן את המשתנה**
- שנה את `GEMINI_MODEL` ל-`gemini-2.0-flash`
- או ל-`gemini-2.5-flash` (חדש יותר)

### שלב 3: חכה לעדכון

Railway יתעדכן אוטומטית תוך 1-2 דקות.

### שלב 4: בדוק את הלוגים

אחרי העדכון, חפשי ב-Railway logs:
```
[Gemini] Initialized with model: gemini-2.0-flash
[Gemini] Calling API: ...v1beta/models/gemini-2.0-flash:generateContent
```

אם עדיין רואה `gemini-pro`, המשתנה עדיין קיים ב-Railway!

## 📋 מה לעשות עכשיו

1. **לך ל-Railway → Variables**
2. **הסר `GEMINI_MODEL=gemini-pro`** (אם קיים)
3. **חכה לעדכון** (1-2 דקות)
4. **נסי שוב** - אמור לעבוד!

## ✅ אימות

אחרי התיקון, הלוגים צריכים להראות:
- ✅ `[Gemini] Initialized with model: gemini-2.0-flash`
- ✅ `[Gemini] Calling API: ...v1beta/models/gemini-2.0-flash`
- ✅ `[Enrichment] Gemini processing complete - Bio: true`
- ❌ אין שגיאות 404

---

**זה הפתרון!** הסרי את המשתנה ב-Railway ונסי שוב.

