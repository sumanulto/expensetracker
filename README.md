# Next.js Expense Tracker API Documentation

This project is a comprehensive expense tracking application built with Next.js 15, TypeScript, and MySQL. The application provides a complete REST API for managing users, expenses, budgets, and analytics with JWT-based authentication.

### 🚨 Smart Alerts

- 🟢 **Safe Zone**: Under 80% of budget
- 🟡 **Warning**: 80-99% of budget usage
- 🔴 **Over Budget**: Exceeded budget limits

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, MySQL
- **Authentication**: JWT with bcryptjs
- **Charts**: Recharts
- **Database**: MySQL with connection pooling
- **Icons**: Lucide React
- **Testing**: Jest, Supertest, ts-jest

## 🧪 Testing Framework

### Testing Tools Used

- **Jest** - JavaScript testing framework
- **ts-jest** - TypeScript preprocessor for Jest
- **Supertest** - HTTP assertion library for API testing
- **@types/jest** - TypeScript definitions for Jest

### Test Coverage

My comprehensive test suite includes:

#### 📋 Unit Tests (70%+ Coverage)

- **Authentication utilities** - Password hashing, JWT token generation/verification
- **Utility functions** - Currency formatting, number conversion, percentage calculation
- **Middleware functions** - User authentication and request validation

#### 🔗 Integration Tests

- **Database operations** - CRUD operations with real database connections
- **User management** - User creation, authentication, and data integrity
- **Expense operations** - Expense creation, categorization, and aggregation
- **Connection pooling** - Database connection management and concurrent queries

#### 🌐 API Tests

- **Authentication endpoints** - Registration, login, logout functionality
- **Expense endpoints** - Create, read, delete expense operations
- **Budget endpoints** - Budget CRUD operations and activation
- **Analytics endpoints** - Data aggregation and reporting
- **Error handling** - Proper error responses and status codes

### Test Coverage Results

![Test Coverage Screenshot](https://i.ibb.co/Zy7bMws/Screenshot-2025-06-24-133251.png)

**Current Coverage:**

- **Statements**: 72.63%
- **Branches**: 62.09%
- **Functions**: 90.47%
- **Lines**: 72.53%

### Test Coverage Results using keploy

<table align="center">
<tr>
    <td>
        <img src="https://i.ibb.co/Y4b0j5RM/Screenshot-2025-06-27-201608.png" alt="Coverage Screenshot" title="Umbrella"/>
    </td>
    <td>
        <img src="https://i.ibb.co/qFsWcSRq/Screenshot-2025-06-27-202203.png" alt="Coverage Screenshot" title="Umbrella"/> 
    </td>
</tr>
</table>

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sumaulto/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   or
   npm i
   ```
3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:

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

4. **Set up the database**

   Run the SQL scripts in order:

   1. **All in one query runner**: `scripts/one-run-schema.sql`
   2. **Create Database and Tables**: `scripts/create-database.sql`
   3. **Seed Default Data**: `scripts/seed-data.sql`
   4. **Update Schema**: `scripts/update-budget-schema.sql`

5. **Start the development server**
   `npm run dev `
6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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
  "username": "sumanulto",
  "email": "suman@kraftamine.com",
  "password": "securePassword123"
}
```

##### Response

```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "sumanulto",
    "email": "suman@kraftamine.com"
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
  "username": "sumanulto",
  "password": "securePassword123"
}
```

##### Response

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "sumanulto",
    "email": "suman@kraftamine.com"
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
    "date": "2025-06-01",
    "category": "Food",
    "amount": 25.5,
    "description": "Lunch at restaurant",
    "user_id": 1,
    "budget_id": 2,
    "created_at": "2025-06-01T10:30:00.000Z"
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
  "date": "2025-06-01",
  "category": "Food",
  "amount": 25.5,
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
    "name": "Monthly Budget 2025",
    "monthly_income": 5000.0,
    "start_date": "2025-06-01",
    "end_date": "2025-06-05",
    "is_active": true,
    "user_id": 1,
    "created_at": "2025-06-01T00:00:00.000Z"
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
  "name": "Monthly Budget 2025",
  "monthlyIncome": 5000.0,
  "startDate": "2025-06-01",
  "endDate": "2025-06-05",
  "categories": [
    {
      "name": "Food",
      "amount": 800.0
    },
    {
      "name": "Transportation",
      "amount": 300.0
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
  "name": "Monthly Budget 2025",
  "monthly_income": 5000.0,
  "start_date": "2025-06-01",
  "end_date": "2025-06-05",
  "categories": [
    {
      "category_name": "Food",
      "allocated_amount": 800.0
    }
  ],
  "expenses": [
    {
      "category": "Food",
      "spent": 250.0
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
  "name": "Updated Monthly Budget 2025",
  "monthlyIncome": 5500.0,
  "startDate": "2025-06-01",
  "endDate": "2025-06-05",
  "categories": [
    {
      "name": "Food",
      "amount": 900.0
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
  "name": "Monthly Budget 2025",
  "monthly_income": 5000.0,
  "start_date": "2025-06-01",
  "end_date": "2025-06-05",
  "is_active": true,
  "user_id": 1,
  "created_at": "2025-06-01T00:00:00.000Z"
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
      "total": 450.0
    },
    {
      "category": "Transportation",
      "total": 200.0
    }
  ],
  "timeData": [
    {
      "month": "2025-01",
      "total": 650.0
    },
    {
      "month": "2025-02",
      "total": 720.0
    }
  ]
}
```

## 📱 Usage Guide

### Getting Started
1. **Register** a new account or **Login** with existing credentials
2. **Create your first budget** with monthly income and category allocations
3. **Add expenses** and categorize them appropriately
4. **Monitor your spending** through the dashboard and analytics

### Demo Account
For testing purposes, use these credentials:
- **Username**: `demo_user`
- **Password**: `password123`

### Key Pages
- **Dashboard** (`/dashboard`) - Overview of your finances with alerts
- **Expenses** (`/expenses`) - Manage all your expenses
- **Budgets** (`/budgets`) - Create and manage budgets
- **Analytics** (`/analytics`) - Visual spending insights
- **Insights** (`/insights`) - Advanced financial insights

## 🏗️ Project Structure

```
expense-tracker/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── budgets/       # Budget management
│   │   ├── expenses/      # Expense operations
│   │   └── analytics/     # Data analytics
│   ├── dashboard/         # Dashboard page
│   ├── expenses/          # Expense management pages
│   ├── budgets/           # Budget management pages
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Main navigation
│   └── theme-toggle.tsx  # Theme switcher
├── lib/                  # Utility libraries
│   ├── db.ts            # Database connection
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
├── __tests__/           # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── api/           # API tests
│   └── setup.ts       # Test configuration
├── scripts/             # Database scripts
│   ├── create-database.sql
│   ├── seed-data.sql
│   └── *.sql           # Various DB scripts
└── public/             # Static assets
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

### One run schema

```
- Go to your sql database workbench/myphpadmin
- Select import database
- Select the one-run-schema.sql file
- All tables will automatically gets imported
```

#### Still like to run sql queries go for it.

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
- ....more

## Currency Format

All monetary values are displayed in Indian Rupees (₹) format using the `formatCurrency` utility function.

## Features

- **User Authentication**: Secure registration and login
- **Expense Tracking**: Add, view, and delete expenses
- **Budget Management**: Create and manage multiple budgets
- **Analytics**: Visual charts and reports
- **Real-time Updates**: Dynamic data updates

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- HTTP-only cookies
- CORS protection
- SQL injection prevention with prepared statements
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Write tests for your changes
4. Ensure all tests pass: `npm run test:coverage`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Lucide** - Beautiful icon set
- **Vercel** - Deployment platform
- **Jest** - Delightful JavaScript testing framework

## Getting Help
- 📧 Email: suman@kraftamine.com
- 💬 Discord: [Join our community](https://discord.gg/zYgSMFpQk3)
- 🐛 Issues: [GitHub Issues](https://github.com/sumanulto/expense-tracker/issues)

## Authors

- [@sumanulto](https://suman.kraftamine.com)
- Built with Next.js 15 and modern web technologies
