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
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'oauth_tokens') THEN
        DELETE FROM oauth_tokens;
        RAISE NOTICE 'Cleaned oauth_tokens';
    END IF;

    -- 2. Delete external data (depends on employees)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'external_data_raw') THEN
        DELETE FROM external_data_raw;
        RAISE NOTICE 'Cleaned external_data_raw';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'external_data_processed') THEN
        DELETE FROM external_data_processed;
        RAISE NOTICE 'Cleaned external_data_processed';
    END IF;

    -- 3. Delete projects (depends on employees)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
        DELETE FROM projects;
        RAISE NOTICE 'Cleaned projects';
    END IF;

    -- 4. Delete skills (depends on employees)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skills') THEN
        DELETE FROM skills;
        RAISE NOTICE 'Cleaned skills';
    END IF;

    -- 5. Delete completed courses if table exists (depends on employees and courses)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'completed_courses') THEN
        DELETE FROM completed_courses;
        RAISE NOTICE 'Cleaned completed_courses';
    END IF;

    -- 6. Delete course participation if table exists (depends on employees and courses)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_participation') THEN
        DELETE FROM course_participation;
        RAISE NOTICE 'Cleaned course_participation';
    END IF;

    -- 7. Delete employee assessment if table exists (depends on employees and courses)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employee_assessment') THEN
        DELETE FROM employee_assessment;
        RAISE NOTICE 'Cleaned employee_assessment';
    END IF;

    -- 8. Delete trainer courses if table exists (depends on employees and courses)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trainer_courses') THEN
        DELETE FROM trainer_courses;
        RAISE NOTICE 'Cleaned trainer_courses';
    END IF;

    -- 9. Delete extra attempt requests if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'extra_attempt_requests') THEN
        DELETE FROM extra_attempt_requests;
        RAISE NOTICE 'Cleaned extra_attempt_requests';
    END IF;

    -- 10. Delete notifications if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        DELETE FROM notifications;
        RAISE NOTICE 'Cleaned notifications';
    END IF;

    -- 11. Delete critical requests if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'critical_requests') THEN
        DELETE FROM critical_requests;
        RAISE NOTICE 'Cleaned critical_requests';
    END IF;

    -- 12. Delete consent records if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consent_records') THEN
        DELETE FROM consent_records;
        RAISE NOTICE 'Cleaned consent_records';
    END IF;

    -- 13. Delete audit logs if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        DELETE FROM audit_logs;
        RAISE NOTICE 'Cleaned audit_logs';
    END IF;

    -- 14. Delete trainers if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trainers') THEN
        DELETE FROM trainers;
        RAISE NOTICE 'Cleaned trainers';
    END IF;

    -- 15. Delete external data links if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'external_data_links') THEN
        DELETE FROM external_data_links;
        RAISE NOTICE 'Cleaned external_data_links';
    END IF;

    -- 16. Update foreign key references to NULL before deleting employees
    -- This prevents foreign key constraint violations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
        UPDATE teams SET manager_id = NULL WHERE manager_id IS NOT NULL;
        RAISE NOTICE 'Updated teams.manager_id to NULL';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
        UPDATE departments SET manager_id = NULL WHERE manager_id IS NOT NULL;
        RAISE NOTICE 'Updated departments.manager_id to NULL';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        UPDATE companies SET decision_maker_id = NULL WHERE decision_maker_id IS NOT NULL;
        RAISE NOTICE 'Updated companies.decision_maker_id to NULL';
    END IF;

    -- 17. Delete teams (depends on departments, but manager_id is now NULL)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
        DELETE FROM teams;
        RAISE NOTICE 'Cleaned teams';
    END IF;

    -- 18. Delete departments (depends on companies, but manager_id is now NULL)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
        DELETE FROM departments;
        RAISE NOTICE 'Cleaned departments';
    END IF;

    -- 19. Delete employees (now safe to delete since all foreign key references are NULL)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employees') THEN
        DELETE FROM employees;
        RAISE NOTICE 'Cleaned employees';
    END IF;

    -- 20. Delete company settings (depends on companies)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_settings') THEN
        DELETE FROM company_settings;
        RAISE NOTICE 'Cleaned company_settings';
    END IF;

    -- 21. Delete courses if table exists (depends on companies)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        DELETE FROM courses;
        RAISE NOTICE 'Cleaned courses';
    END IF;

    -- 22. Delete companies (no dependencies from other tables)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        DELETE FROM companies;
        RAISE NOTICE 'Cleaned companies';
    END IF;

    -- 23. Reset sequences (optional, but good practice)
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
-- Uncomment and run these queries to verify all tables are empty:
-- 
-- SELECT COUNT(*) as companies_count FROM companies;
-- SELECT COUNT(*) as employees_count FROM employees;
-- SELECT COUNT(*) as departments_count FROM departments;
-- SELECT COUNT(*) as teams_count FROM teams;
-- SELECT COUNT(*) as oauth_tokens_count FROM oauth_tokens;
-- SELECT COUNT(*) as external_data_raw_count FROM external_data_raw;
-- SELECT COUNT(*) as external_data_processed_count FROM external_data_processed;
-- SELECT COUNT(*) as projects_count FROM projects;
-- SELECT COUNT(*) as skills_count FROM skills;
-- SELECT COUNT(*) as company_settings_count FROM company_settings;
-- 
-- All counts should return 0

