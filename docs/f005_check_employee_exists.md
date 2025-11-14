# Check if Employee Exists in Database

## Quick Check in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your employee ID):

```sql
SELECT id, name, email, role, company_id, created_at
FROM employees
WHERE id = 'ae39378a-61bb-4b13-9cbd-d97991603598';
```

### If Employee EXISTS:
- You'll see one row with employee details
- ✅ Employee ID is valid
- Continue to Step 3 (Connect LinkedIn/GitHub)

### If Employee DOES NOT EXIST:
- You'll see "0 rows returned"
- ❌ Employee ID is invalid
- **Solution**: Get a valid employee ID

## Get Valid Employee ID

### Option 1: List All Employees
```sql
SELECT id, name, email, role, created_at
FROM employees
ORDER BY created_at DESC
LIMIT 10;
```

### Option 2: Get HR Employee (if company registered)
```sql
SELECT e.id, e.name, e.email, e.role, c.name as company_name
FROM employees e
JOIN companies c ON e.company_id = c.id
WHERE e.role = 'HR'
ORDER BY e.created_at DESC
LIMIT 1;
```

### Option 3: Use Company Registration
If you just registered a company:
- The HR employee was created automatically
- Check `localStorage.getItem('hrEmployeeId')` in browser console
- Or check the latest employee in database

## After Getting Valid Employee ID

1. Update `localStorage`:
   ```javascript
   localStorage.setItem('currentEmployeeId', 'NEW_VALID_EMPLOYEE_ID')
   ```

2. Refresh the profile page

3. Continue with Step 3 (Connect LinkedIn/GitHub)

