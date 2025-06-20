-- Insert default categories (global categories available to all users)
INSERT IGNORE INTO categories (name, user_id) VALUES 
('Food', NULL),
('Transportation', NULL),
('Bills', NULL),
('Entertainment', NULL),
('Education', NULL),
('Shopping', NULL),
('Healthcare', NULL),
('Gym', NULL),
('Utilities', NULL),
('Insurance', NULL),
('Investment', NULL),
('Savings', NULL),
('Travel', NULL),
('Personal Care', NULL),
('Home Maintenance', NULL),
('Clothing', NULL),
('Electronics', NULL),
('Books', NULL),
('Gifts', NULL),
('Charity', NULL);

-- Insert sample user for testing (password is 'password123' hashed with bcrypt)
INSERT IGNORE INTO users (username, email, password) VALUES 
('demo_user', 'demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa');

-- Get the demo user ID
SET @demo_user_id = (SELECT id FROM users WHERE username = 'demo_user' LIMIT 1);

-- Insert sample budget for demo user
INSERT IGNORE INTO budgets (name, monthly_income, start_date, end_date, user_id, is_active) VALUES 
('Demo Monthly Budget 2024', 50000.00, '2024-01-01', '2024-12-31', @demo_user_id, TRUE);

-- Get the demo budget ID
SET @demo_budget_id = (SELECT id FROM budgets WHERE user_id = @demo_user_id LIMIT 1);

-- Insert sample budget categories
INSERT IGNORE INTO budget_categories (budget_id, category_name, allocated_amount) VALUES 
(@demo_budget_id, 'Food', 8000.00),
(@demo_budget_id, 'Transportation', 3000.00),
(@demo_budget_id, 'Bills', 5000.00),
(@demo_budget_id, 'Entertainment', 2000.00),
(@demo_budget_id, 'Education', 1500.00),
(@demo_budget_id, 'Healthcare', 2500.00),
(@demo_budget_id, 'Shopping', 3000.00),
(@demo_budget_id, 'Gym', 1000.00);

-- Insert sample expenses for demo user
INSERT IGNORE INTO expenses (date, category, amount, description, user_id, budget_id) VALUES 
(CURDATE() - INTERVAL 1 DAY, 'Food', 250.00, 'Grocery shopping', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 2 DAY, 'Transportation', 150.00, 'Fuel for car', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 3 DAY, 'Bills', 1200.00, 'Electricity bill', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 4 DAY, 'Food', 180.00, 'Restaurant dinner', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 5 DAY, 'Entertainment', 300.00, 'Movie tickets', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 6 DAY, 'Healthcare', 500.00, 'Doctor consultation', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 7 DAY, 'Shopping', 800.00, 'Clothing purchase', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 8 DAY, 'Gym', 1000.00, 'Monthly gym membership', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 10 DAY, 'Food', 320.00, 'Weekly groceries', @demo_user_id, @demo_budget_id),
(CURDATE() - INTERVAL 12 DAY, 'Transportation', 200.00, 'Public transport', @demo_user_id, @demo_budget_id);

-- Insert user preferences for demo user
INSERT IGNORE INTO user_preferences (user_id, theme, currency, date_format, timezone) VALUES 
(@demo_user_id, 'system', 'INR', 'DD/MM/YYYY', 'Asia/Kolkata');
