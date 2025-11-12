# Quick Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend  
cd ../backend && npm install
```

### 2. Set Up Environment

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_postgresql_connection_string
CORS_ORIGIN=http://localhost:3000
```

### 3. Set Up Database

Run `database/schema.sql` in your PostgreSQL database (or Supabase SQL Editor).

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5. Test the Flow

1. Open `http://localhost:3000/hr/landing`
2. Click "Register Your Company"
3. Fill Step 1 form → Continue
4. Wait for verification (5 seconds)
5. Continue to Step 4
6. Add employees, departments, teams
7. Submit

**Check database to verify data was created!**

---

## Quick API Test

```bash
# Health check
curl http://localhost:5000/api/health

# Register company (Step 1)
curl -X POST http://localhost:5000/api/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "step": 1,
    "companyName": "Test Co",
    "industry": "Technology",
    "hrName": "John Doe",
    "hrEmail": "john@test.com",
    "hrRole": "HR",
    "domain": "test.com"
  }'
```

---

For detailed testing instructions, see `docs/testing_guide.md`

