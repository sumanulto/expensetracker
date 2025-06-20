# Next.js Expense Tracker API Documentation

This project is a comprehensive expense tracking application built with Next.js 15, TypeScript, and MySQL. The application provides a complete REST API for managing users, expenses, budgets, and analytics with JWT-based authentication.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Password Hashing**: bcryptjs

## Libraries to Install

To deploy this project, you need to install the following dependencies:

```bash
npm install
or
npm i
```

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Database Setup

Run the following SQL scripts to set up your database:

1. **Create Database and Tables**: `scripts/create-database.sql`
2. **Seed Default Data**: `scripts/seed-data.sql`
3. **Update Schema**: `scripts/update-budget-schema.sql`

## API Reference

All API endpoints are prefixed with your domain. For local development, use `http://localhost:3000/api`.

### Authentication APIs

#### Register User
```http
POST /api/auth/register
```

##### Request Body
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

##### Response
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

##### Request Body
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

##### Response
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Logout User
```http
POST /api/auth/logout
```

##### Response
```json
{
  "message": "Logged out successfully"
}
```

### Expense Management APIs

#### Get All Expenses
```http
GET /api/expenses
```

##### Response
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "category": "Food",
    "amount": 25.50,
    "description": "Lunch at restaurant",
    "user_id": 1,
    "budget_id": 2,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Add New Expense
```http
POST /api/expenses
```

##### Request Body
```json
{
  "date": "2024-01-15",
  "category": "Food",
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "budgetId": 2
}
```

##### Response
```json
{
  "id": 1,
  "message": "Expense added successfully"
}
```

#### Delete Expense
```http
DELETE /api/expenses/[id]
```

##### Response
```json
{
  "message": "Expense deleted successfully"
}
```

### Budget Management APIs

#### Get All Budgets
```http
GET /api/budgets
```

##### Response
```json
[
  {
    "id": 1,
    "name": "Monthly Budget 2024",
    "monthly_income": 5000.00,
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "is_active": true,
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Create New Budget
```http
POST /api/budgets
```

##### Request Body
```json
{
  "name": "Monthly Budget 2024",
  "monthlyIncome": 5000.00,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "categories": [
    {
      "name": "Food",
      "amount": 800.00
    },
    {
      "name": "Transportation",
      "amount": 300.00
    }
  ]
}
```

##### Response
```json
{
  "id": 1,
  "message": "Budget created successfully"
}
```

#### Get Budget Details
```http
GET /api/budgets/[id]
```

##### Response
```json
{
  "id": 1,
  "name": "Monthly Budget 2024",
  "monthly_income": 5000.00,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "categories": [
    {
      "category_name": "Food",
      "allocated_amount": 800.00
    }
  ],
  "expenses": [
    {
      "category": "Food",
      "spent": 250.00
    }
  ]
}
```

#### Update Budget
```http
PUT /api/budgets/[id]
```

##### Request Body
```json
{
  "name": "Updated Monthly Budget 2024",
  "monthlyIncome": 5500.00,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "categories": [
    {
      "name": "Food",
      "amount": 900.00
    }
  ]
}
```

##### Response
```json
{
  "message": "Budget updated successfully"
}
```

#### Activate/Deactivate Budget
```http
PATCH /api/budgets/[id]
```

##### Request Body
```json
{
  "is_active": true
}
```

##### Response
```json
{
  "message": "Budget updated successfully"
}
```

#### Delete Budget
```http
DELETE /api/budgets/[id]
```

##### Response
```json
{
  "message": "Budget deleted successfully"
}
```

#### Get Active Budget
```http
GET /api/budgets/active
```

##### Response
```json
{
  "id": 1,
  "name": "Monthly Budget 2024",
  "monthly_income": 5000.00,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "is_active": true,
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Analytics APIs

#### Get Analytics Data
```http
GET /api/analytics
```

##### Response
```json
{
  "categoryData": [
    {
      "category": "Food",
      "total": 450.00
    },
    {
      "category": "Transportation",
      "total": 200.00
    }
  ],
  "timeData": [
    {
      "month": "2024-01",
      "total": 650.00
    },
    {
      "month": "2024-02",
      "total": 720.00
    }
  ]
}
```

## Error Responses

All APIs return consistent error responses:

### 400 Bad Request
```json
{
  "error": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Budget not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens are stored in HTTP-only cookies for security.

### Cookie Configuration
- **Name**: `token`
- **HttpOnly**: `true`
- **Secure**: `true` (in production)
- **SameSite**: `strict`
- **MaxAge**: 7 days

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  user_id INT,
  budget_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
);
```

### Budgets Table
```sql
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  monthly_income DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  user_id INT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Budget Categories Table
```sql
CREATE TABLE budget_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT,
  category_name VARCHAR(50) NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);
```

## Available Categories

The application supports the following expense categories:
- Food
- Transportation
- Bills
- Entertainment
- Education
- Shopping
- Healthcare
- Gym

## Currency Format

All monetary values are displayed in Indian Rupees (₹) format using the `formatCurrency` utility function.

## Development

### Running the Application
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Features

- **User Authentication**: Secure registration and login
- **Expense Tracking**: Add, view, and delete expenses
- **Budget Management**: Create and manage multiple budgets
- **Analytics**: Visual charts and reports
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Dynamic data updates

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- HTTP-only cookies
- CORS protection
- SQL injection prevention with prepared statements
- Input validation and sanitization

## Authors

- [@sumanulto](https://suman.kraftamine.com)
- Built with Next.js 15 and modern web technologies
```
