# Debug: Company Not Found After Registration

## הבעיה

אחרי הרשמת חברה, כשמנסים לגשת ל-HR Dashboard, מקבלים שגיאה "Company not found".

## מה תוקן

1. **Case-insensitive HR email search** - עכשיו ה-query מחפש HR email ב-case-insensitive
2. **Better logging** - הוספתי logging מפורט ל-`getCompanyById` ו-`getCompanyIdByHrEmail`
3. **GitHub Actions health check** - תוקן כדי לא להיכשל אם secrets לא מוגדרים

## איך לבדוק

1. **בדוק את ה-logs ב-Railway** - חפש:
   - `[getCompanyById] Fetching company with ID: ...`
   - `[getCompanyIdByHrEmail] Looking for company with HR email: ...`

2. **בדוק את ה-localStorage** - פתח את ה-Console ב-browser ובדוק:
   ```javascript
   localStorage.getItem('companyId')
   localStorage.getItem('hrEmail')
   ```

3. **בדוק ב-Supabase** - הרץ את ה-query הבא:
   ```sql
   -- בדוק אם החברה קיימת
   SELECT id, name, verification_status, created_at 
   FROM companies 
   WHERE id = 'YOUR_COMPANY_ID'
   ORDER BY created_at DESC;

   -- בדוק את ה-HR email settings
   SELECT company_id, setting_key, setting_value 
   FROM company_settings 
   WHERE setting_key = 'hr_email' 
   ORDER BY company_id DESC;
   ```

## אם עדיין יש בעיה

1. **בדוק את ה-HR email** - וודא שה-HR email ב-localStorage תואם ל-HR email ב-company_settings
2. **נקה את ה-localStorage** - נסה למחוק את ה-localStorage ולנסות שוב
3. **בדוק את ה-logs** - שלח את ה-logs מ-Railway

## מה קורה עכשיו

השינויים נדחפו ל-GitHub ו-Railway יבנה מחדש אוטומטית (2-3 דקות).

אחרי שהבנייה תסתיים, נסה שוב לרשום חברה ולגשת ל-HR Dashboard.

