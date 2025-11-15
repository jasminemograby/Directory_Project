-- Clean Test Data Migration
-- This script removes all test data from the database to start fresh
-- WARNING: This will delete ALL data from the following tables:
-- - employees
-- - companies
-- - departments
-- - teams
-- - oauth_tokens
-- - external_data_raw
-- - external_data_processed
-- - projects
-- - skills
-- - company_settings
-- - course_participation
-- - employee_assessment
-- - trainer_courses (if exists)

-- IMPORTANT: This script does NOT drop tables, only deletes data
-- Run this script in Supabase SQL Editor

DO $$
DECLARE
    seq_record RECORD;
BEGIN
    -- Disable foreign key checks temporarily (PostgreSQL doesn't have this, but we'll use CASCADE)
    -- Delete in correct order to respect foreign key constraints

    -- 1. Delete OAuth tokens (no dependencies)
    DELETE FROM oauth_tokens;
    RAISE NOTICE 'Cleaned oauth_tokens';

    -- 2. Delete external data (depends on employees)
    DELETE FROM external_data_raw;
    RAISE NOTICE 'Cleaned external_data_raw';

    DELETE FROM external_data_processed;
    RAISE NOTICE 'Cleaned external_data_processed';

    -- 3. Delete projects (depends on employees)
    DELETE FROM projects;
    RAISE NOTICE 'Cleaned projects';

    -- 4. Delete skills (depends on employees)
    DELETE FROM skills;
    RAISE NOTICE 'Cleaned skills';

    -- 5. Delete course participation (depends on employees and courses)
    DELETE FROM course_participation;
    RAISE NOTICE 'Cleaned course_participation';

    -- 6. Delete employee assessment (depends on employees and courses)
    DELETE FROM employee_assessment;
    RAISE NOTICE 'Cleaned employee_assessment';

    -- 7. Delete trainer courses if table exists (depends on employees and courses)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trainer_courses') THEN
        DELETE FROM trainer_courses;
        RAISE NOTICE 'Cleaned trainer_courses';
    END IF;

    -- 8. Delete employees (depends on departments, teams, companies)
    -- This will cascade to any remaining dependencies
    DELETE FROM employees;
    RAISE NOTICE 'Cleaned employees';

    -- 9. Delete teams (depends on departments)
    DELETE FROM teams;
    RAISE NOTICE 'Cleaned teams';

    -- 10. Delete departments (depends on companies)
    DELETE FROM departments;
    RAISE NOTICE 'Cleaned departments';

    -- 11. Delete company settings (depends on companies)
    DELETE FROM company_settings;
    RAISE NOTICE 'Cleaned company_settings';

    -- 12. Delete courses (depends on companies)
    DELETE FROM courses;
    RAISE NOTICE 'Cleaned courses';

    -- 13. Delete companies (no dependencies from other tables)
    DELETE FROM companies;
    RAISE NOTICE 'Cleaned companies';

    -- 14. Reset sequences (optional, but good practice)
    -- This ensures new IDs start from 1
    FOR seq_record IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq_record.sequence_name) || ' RESTART WITH 1';
    END LOOP;
    RAISE NOTICE 'Reset all sequences';

    RAISE NOTICE '✅ Database cleaned successfully! All test data has been removed.';
END $$;

-- Verification queries (run these after the migration to verify)
-- SELECT COUNT(*) as companies_count FROM companies;
-- SELECT COUNT(*) as employees_count FROM employees;
-- SELECT COUNT(*) as departments_count FROM departments;
-- SELECT COUNT(*) as teams_count FROM teams;
-- SELECT COUNT(*) as oauth_tokens_count FROM oauth_tokens;
-- SELECT COUNT(*) as external_data_raw_count FROM external_data_raw;
-- SELECT COUNT(*) as external_data_processed_count FROM external_data_processed;
-- SELECT COUNT(*) as projects_count FROM projects;
-- SELECT COUNT(*) as skills_count FROM skills;

