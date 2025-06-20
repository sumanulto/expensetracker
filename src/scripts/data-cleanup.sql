-- Data cleanup and maintenance script
USE expense_tracker;

-- Remove orphaned budget categories (categories without budgets)
DELETE bc FROM budget_categories bc
LEFT JOIN budgets b ON bc.budget_id = b.id
WHERE b.id IS NULL;

-- Remove orphaned expenses (expenses without users)
DELETE e FROM expenses e
LEFT JOIN users u ON e.user_id = u.id
WHERE u.id IS NULL;

-- Clean up expired sessions (if using session table)
DELETE FROM user_sessions 
WHERE expires_at < NOW();

-- Update any NULL values in required fields
UPDATE budgets SET is_active = FALSE WHERE is_active IS NULL;
UPDATE expenses SET description = '' WHERE description IS NULL;

-- Remove duplicate categories (keep the first one)
DELETE c1 FROM categories c1
INNER JOIN categories c2 
WHERE c1.id > c2.id 
AND c1.name = c2.name 
AND c1.user_id = c2.user_id;
