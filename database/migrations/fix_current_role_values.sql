-- Fix existing employee current_role values that defaulted to PostgreSQL session role
DO $$
BEGIN
    -- Update current_role with role value when it is NULL or equals the database role name (e.g., 'postgres')
    UPDATE employees
    SET current_role = role,
        updated_at = CURRENT_TIMESTAMP
    WHERE (current_role IS NULL OR LOWER(current_role) = 'postgres')
      AND role IS NOT NULL;

    -- Optional: if role column also ended up with 'postgres', set it to NULL to avoid confusion
    UPDATE employees
    SET role = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE LOWER(role) = 'postgres';
END $$;

