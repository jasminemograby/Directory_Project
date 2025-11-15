# 🧹 Database Clean Script

## 📋 Overview

This script (`clean_test_data.sql`) removes **ALL** test data from the database to start fresh. It's useful for:
- Testing if fields are being saved correctly in the appropriate tables
- Starting a clean slate for new testing
- Verifying the complete registration and enrichment flow

## ⚠️ WARNING

**This script will DELETE ALL DATA from the following tables (only if they exist):**
- `companies`
- `employees`
- `departments`
- `teams`
- `oauth_tokens`
- `external_data_raw`
- `external_data_processed`
- `projects`
- `skills`
- `company_settings`
- `courses` (if exists)
- `completed_courses` (if exists)
- `course_participation` (if exists)
- `employee_assessment` (if exists)
- `trainer_courses` (if exists)
- `extra_attempt_requests` (if exists)
- `notifications` (if exists)
- `critical_requests` (if exists)
- `consent_records` (if exists)
- `audit_logs` (if exists)
- `trainers` (if exists)
- `external_data_links` (if exists)

**The script does NOT drop tables** - it only deletes data. The table structure remains intact.

## 🚀 How to Run

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `clean_test_data.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Option 2: Command Line (if you have psql access)

```bash
psql -h your-supabase-host -U postgres -d postgres -f database/migrations/clean_test_data.sql
```

## ✅ Verification

After running the script, verify that all tables are empty by running these queries in Supabase SQL Editor:

```sql
-- Check counts (should all be 0)
SELECT COUNT(*) as companies_count FROM companies;
SELECT COUNT(*) as employees_count FROM employees;
SELECT COUNT(*) as departments_count FROM departments;
SELECT COUNT(*) as teams_count FROM teams;
SELECT COUNT(*) as oauth_tokens_count FROM oauth_tokens;
SELECT COUNT(*) as external_data_raw_count FROM external_data_raw;
SELECT COUNT(*) as external_data_processed_count FROM external_data_processed;
SELECT COUNT(*) as projects_count FROM projects;
SELECT COUNT(*) as skills_count FROM skills;
SELECT COUNT(*) as company_settings_count FROM company_settings;

-- Optional tables (may not exist)
SELECT COUNT(*) as completed_courses_count FROM completed_courses WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'completed_courses');
SELECT COUNT(*) as courses_count FROM courses WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses');
```

All counts should return `0`.

## 📝 What Gets Reset

1. **OAuth Tokens** - All LinkedIn and GitHub tokens
2. **External Data** - All raw and processed external data
3. **Projects** - All AI-generated projects
4. **Skills** - All normalized skills
5. **Course Data** - All course participation and assessments
6. **Employees** - All employee records
7. **Teams** - All team records
8. **Departments** - All department records
9. **Companies** - All company records
10. **Company Settings** - All company configuration
11. **Courses** - All course records
12. **Sequences** - All auto-increment sequences reset to 1

## 🔄 After Cleaning

After running the script, you can:

1. **Test Company Registration** - Register a new company from scratch
2. **Test Employee Creation** - Create employees and verify all fields are saved correctly
3. **Test Profile Enrichment** - Connect LinkedIn/GitHub and verify data is stored in the correct tables
4. **Verify Data Flow** - Check that data flows correctly through:
   - `external_data_raw` → `external_data_processed` → `projects` / `skills`
   - Employee fields → `employees` table
   - Company settings → `company_settings` table

## 🐛 Troubleshooting

### Error: "relation does not exist"
- Some tables might not exist yet if you haven't run all migrations
- The script will skip non-existent tables (like `trainer_courses`)
- This is normal and safe

### Error: "foreign key constraint"
- The script deletes in the correct order to avoid foreign key violations
- If you get this error, check that all tables exist and have the correct structure

### Sequences not resetting
- Some sequences might be managed by Supabase automatically
- This is not critical - new records will still get unique IDs

## 📚 Related Files

- `database/schema.sql` - Full database schema
- `database/migrations/` - Other migration files

