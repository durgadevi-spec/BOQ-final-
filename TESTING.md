# BOQ Project - Testing Documentation

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [API Testing](#api-testing)
6. [Frontend Testing](#frontend-testing)
7. [Database Testing](#database-testing)
8. [End-to-End Testing](#end-to-end-testing)
9. [Performance Testing](#performance-testing)
10. [Testing Checklist](#testing-checklist)

---

## Overview

This document outlines the testing strategy for the BOQ (Bill of Quantities) project, a full-stack application for managing material bills and estimations.

### Project Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT-based
- **Key Features:** Material management, estimation workflows, approval processes

### Test Categories
- ✅ Authentication & Authorization
- ✅ Material CRUD Operations
- ✅ Estimation Calculations (Civil, Plumbing, Doors, Blinds, Flooring)
- ✅ Material Templates
- ✅ Shop Management
- ✅ User Roles (Admin, Supplier, User)
- ✅ Data Validation

---

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Environment variables (.env)
DATABASE_URL=postgresql://boq_admin:boq_admin_pass@localhost:5432/boq
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

### Start Services
```bash
# Terminal 1: Start PostgreSQL
docker-compose up postgres

# Terminal 2: Start Backend Server
npm run dev

# Terminal 3: Start Frontend (optional)
npm run dev:client
```

### Verify Services
```bash
# Test backend
curl http://localhost:5000/api/health

# Test database connection
node scripts/diagnose-db.cjs
```

---

## Unit Testing

### 1. Authentication Tests

**File:** `test_login.cjs`

**What it tests:**
- ✅ Login with correct credentials
- ✅ Login with wrong password
- ✅ Login with non-existent email
- ✅ Token generation
- ✅ User role assignment

**Run the test:**
```bash
node test_login.cjs
```

**Expected Output:**
```
Testing login endpoints...

[correct] {"status":200,"token":"eyJhbGc...","user_role":"admin"}
[wrong-password] {"status":401,"message":"Invalid credentials"}
[wrong-email] {"status":401,"message":"Invalid credentials"}
```

**Test Data:**
| Email | Password | Expected Status | Role |
|-------|----------|-----------------|------|
| admin@example.com | DemoPass123! | 200 | admin |
| admin@example.com | WrongPass | 401 | - |
| noone@example.com | DoesntMatter | 401 | - |

---

### 2. Material CRUD Tests

**File:** `server/test_crud_workflow.js`

**What it tests:**
- ✅ Create material
- ✅ Read material
- ✅ Update material
- ✅ Delete material
- ✅ Bulk operations
- ✅ Material validation

**Run the test:**
```bash
node server/test_crud_workflow.js
```

**Test Cases:**
```javascript
// Create Material
POST /api/materials
{
  name: "Gypsum Board",
  code: "GB12",
  rate: 250,
  unit: "pcs",
  category: "Walls",
  brandName: "Saint-Gobain",
  technicalSpecification: "12mm thickness"
}

// Read Material
GET /api/materials/:id

// Update Material
PUT /api/materials/:id
{
  rate: 270,
  stock: 100
}

// Delete Material
DELETE /api/materials/:id
```

---

### 3. Calculation Tests

**File:** `client/src/pages/estimators/computeRequired.ts`

**What it tests:**
- ✅ Gypsum wall calculations
- ✅ Plywood wall calculations
- ✅ Glass partition calculations
- ✅ Hybrid wall combinations
- ✅ Material quantity precision

**Manual Test:**
```typescript
// Test Gypsum Wall Calculation
const result = computeRequired({
  wallType: "GYPSUM",
  area: 100,  // sq ft
  subOption: "Single Layer"
});

// Expected materials
console.log(result); // Should contain:
// - boards: calculated quantity
// - rockwoolSheets: calculated quantity
// - floorChannel, ceilingChannel: calculated quantity
// - studs, jointTape, jointCompound: calculated quantity
// - screws: calculated quantity
```

**Validation Points:**
- [ ] Area calculations are correct
- [ ] Material quantities match specifications
- [ ] No negative numbers
- [ ] Decimal precision is appropriate
- [ ] All material types are returned

---

## Integration Testing

### 1. Material Template Workflow

**File:** `test_material_templates.mjs`

**What it tests:**
- ✅ Create material templates
- ✅ Retrieve templates
- ✅ Use templates in estimations
- ✅ Template validation

**Run the test:**
```bash
node test_material_templates.mjs
```

**Workflow:**
```
1. Admin Login
   ↓
2. Create Material Templates (Gypsum, Plywood, Glass, etc.)
   ↓
3. Verify Templates Created
   ↓
4. Use Templates in Estimations
   ↓
5. Verify Integration
```

**Test Templates:**
```javascript
const testTemplates = [
  {
    name: "Gypsum Wall Complete",
    wallType: "GYPSUM",
    materials: ["Gypsum Board", "Rockwool", "Channels", ...]
  },
  {
    name: "Plywood Wall Complete",
    wallType: "PLYWOOD",
    materials: ["Plywood Sheets", "Laminate", "Channels", ...]
  }
];
```

---

### 2. Shop Management & Material Availability

**What it tests:**
- ✅ Add/remove shops
- ✅ Assign materials to shops
- ✅ Check material availability
- ✅ Price variations across shops

**Test Scenario:**
```javascript
// Step 1: Create shops
POST /api/shops
{
  name: "BuildMart",
  location: "City Center",
  contact: "9999999999"
}

// Step 2: Add materials to shop
POST /api/shops/:shopId/materials
{
  materialId: "mat-001",
  rate: 250,
  stock: 100
}

// Step 3: Verify in estimation
GET /api/materials/:id?shopFilter=true
// Should return available shops and prices
```

---

## API Testing

### 1. Authentication Endpoints

**Test: Admin Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "DemoPass123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-001",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### 2. Material Endpoints

**GET All Materials**
```bash
curl -X GET http://localhost:5000/api/materials \
  -H "Authorization: Bearer <token>"
```

**POST Create Material**
```bash
curl -X POST http://localhost:5000/api/materials \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gypsum Board 12mm",
    "code": "GB12",
    "rate": 250,
    "unit": "pcs",
    "category": "Walls"
  }'
```

**PUT Update Material**
```bash
curl -X PUT http://localhost:5000/api/materials/:id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 270
  }'
```

**DELETE Material**
```bash
curl -X DELETE http://localhost:5000/api/materials/:id \
  -H "Authorization: Bearer <token>"
```

---

### 3. Estimation Endpoints

**POST Create Estimation**
```bash
curl -X POST http://localhost:5000/api/estimations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "estimatorId": "user-001",
    "projectName": "Office Building A",
    "billNumber": "BOQ-2024-001",
    "items": [
      {
        "wallType": "GYPSUM",
        "area": 100,
        "height": 10,
        "quantity": 1
      }
    ]
  }'
```

---

## Frontend Testing

### 1. Authentication Flow

**Test:** User Login Page
- [ ] Enter valid credentials → Should login
- [ ] Enter invalid password → Should show error
- [ ] Enter non-existent email → Should show error
- [ ] Check password visibility toggle
- [ ] Check remember me functionality

**Test:** Role-based Access Control
- [ ] Admin can access admin dashboard
- [ ] Supplier can access supplier panel
- [ ] User cannot access admin panel
- [ ] Unauthorized users redirected to login

---

### 2. Material Management (Admin)

**Test:** Material CRUD
- [ ] Create new material
  - [ ] Validate required fields
  - [ ] Check duplicate code detection
  - [ ] Verify material appears in list
  
- [ ] Edit material
  - [ ] Update price/details
  - [ ] Verify changes saved
  
- [ ] Delete material
  - [ ] Confirm deletion
  - [ ] Verify removal from list

**Test:** Material Approval
- [ ] Supplier submits material
- [ ] Admin receives submission
- [ ] Admin can approve/reject
- [ ] Supplier notified of status

---

### 3. Estimation Workflow

**Test:** Civil Wall Estimator
```
Step 1: Select Wall Type
  - [ ] Gypsum Wall
  - [ ] Plywood Wall
  - [ ] Glass Partition
  - [ ] Hybrid (Gypsum + Plywood)
  - [ ] Hybrid (Gypsum + Glass)

Step 2: Enter Specifications
  - [ ] Area (sq ft)
  - [ ] Height (ft)
  - [ ] Configuration/Thickness
  - [ ] Quantity

Step 3: Review Calculations
  - [ ] All materials displayed
  - [ ] Quantities calculated correctly
  - [ ] Prices shown per material
  - [ ] Total cost calculated

Step 4: Select Suppliers
  - [ ] Choose shop for each material
  - [ ] Prices update based on shop
  - [ ] Total recalculated

Step 5: Generate Bill
  - [ ] Bill preview shown
  - [ ] All details correct
  - [ ] Save as PDF
  - [ ] Save to database
```

**Test:** Plumbing Estimator
- [ ] Select system type
- [ ] Enter specifications
- [ ] Verify material calculations
- [ ] Generate BOQ

**Test:** Doors Estimator
- [ ] Select door type
- [ ] Specify dimensions
- [ ] Verify hardware calculations
- [ ] Generate BOQ

---

## Database Testing

### 1. Connection Testing

**File:** `scripts/diagnose-db.cjs`

**Run test:**
```bash
node scripts/diagnose-db.cjs
```

**What it tests:**
- ✅ PostgreSQL connection
- ✅ Database existence
- ✅ Tables exist
- ✅ Insert/read operations
- ✅ Clean up test data

**Expected Output:**
```
--- PostgreSQL Connection ---
✅ Connection established

--- Database Info ---
database: boq
version: PostgreSQL 15.x

--- Schema Verification ---
✅ shops table exists
✅ materials table exists
✅ users table exists

--- Testing INSERT ---
✅ Insert successful

--- Testing SELECT ---
✅ Data retrieved successfully
```

---

### 2. Schema Validation

**File:** `verify-schema.mjs`

**Run test:**
```bash
node verify-schema.mjs
```

**Validates:**
- ✅ All required tables exist
- ✅ All required columns present
- ✅ Correct data types
- ✅ Foreign keys configured
- ✅ Indexes created

---

### 3. Data Integrity Tests

**Test:** Referential Integrity
```sql
-- Verify shop_id references valid shops
SELECT m.id, m.name, m.shop_id 
FROM materials m 
LEFT JOIN shops s ON m.shop_id = s.id 
WHERE s.id IS NULL AND m.shop_id IS NOT NULL;

-- Should return 0 rows
```

**Test:** Constraint Violations
```sql
-- Try to insert duplicate material code
INSERT INTO materials (id, name, code, shop_id) 
VALUES ('test-id', 'Test', 'DUP-001', 'shop-001');
-- Should fail with unique constraint error
```

---

## End-to-End Testing

### Complete User Journey: Civil Wall Estimation

**Scenario:** New user creates a BOQ for gypsum wall

**Setup:**
```bash
# Start all services
docker-compose up -d postgres
npm run dev
npm run dev:client
```

**Steps:**

1. **Authentication**
   - [ ] Navigate to login page
   - [ ] Login as user@example.com
   - [ ] Verify redirect to dashboard

2. **Create Estimation**
   - [ ] Click "New Estimation"
   - [ ] Enter project name: "Test Project"
   - [ ] Select estimator type: "Civil Wall"

3. **Configure Wall**
   - [ ] Select wall type: "Gypsum"
   - [ ] Enter area: 100 sq ft
   - [ ] Enter height: 10 ft
   - [ ] Select configuration: "Single Layer"

4. **Review Materials**
   - [ ] Verify gypsum boards calculated
   - [ ] Verify rockwool calculated
   - [ ] Verify channels, studs, tape, compound
   - [ ] Verify screws calculated
   - [ ] Check all quantities are positive

5. **Select Suppliers**
   - [ ] Select shop 1 for gypsum board
   - [ ] Select shop 2 for rockwool (if available)
   - [ ] Verify prices update
   - [ ] Check total recalculates

6. **Generate BOQ**
   - [ ] Review bill preview
   - [ ] Verify all details correct
   - [ ] Download PDF
   - [ ] Save to database

7. **Verification**
   - [ ] Navigate to saved BOQs
   - [ ] Verify created BOQ appears
   - [ ] Open and compare details
   - [ ] Check bill date/due date

---

## Performance Testing

### 1. Load Testing - Material Search

**Test:** Search with 1000+ materials
```javascript
// Time the search operation
console.time('search');
const results = await searchMaterials('gypsum', { limit: 100 });
console.timeEnd('search');

// Expected: < 200ms
```

**Acceptance Criteria:**
- [ ] Search returns in < 200ms
- [ ] Results are relevant
- [ ] No timeout errors

---

### 2. Load Testing - Bill Generation

**Test:** Generate Bill with 50+ materials
```javascript
// Time bill generation
console.time('generate-bill');
const bill = await generateBill(estimationId);
console.timeEnd('generate-bill');

// Expected: < 1000ms
```

**Acceptance Criteria:**
- [ ] Bill generates in < 1 second
- [ ] All materials included
- [ ] Calculations accurate
- [ ] No memory leaks

---

### 3. Concurrent User Test

**Test:** 5 simultaneous users
```bash
# Use Apache Bench
ab -n 100 -c 5 http://localhost:5000/api/materials
```

**Acceptance Criteria:**
- [ ] No errors
- [ ] Response time < 500ms
- [ ] Database connections stable

---

## Testing Checklist

### Pre-Release Testing

**Unit Tests**
- [ ] Authentication (login, token validation)
- [ ] Material CRUD operations
- [ ] Calculation accuracy (all wall types)
- [ ] Material validation
- [ ] Price calculations

**Integration Tests**
- [ ] Material template workflow
- [ ] Shop material assignment
- [ ] Estimation creation flow
- [ ] Bill generation flow
- [ ] User role permissions

**API Tests**
- [ ] All endpoints respond correctly
- [ ] Auth token validation working
- [ ] CORS configured properly
- [ ] Error responses appropriate
- [ ] Rate limiting works (if configured)

**Frontend Tests**
- [ ] All pages load without errors
- [ ] Forms validate correctly
- [ ] Navigation works
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Accessibility (keyboard navigation, screen readers)

**Database Tests**
- [ ] Connection established
- [ ] Schema validation passed
- [ ] Data integrity maintained
- [ ] Backup/restore working
- [ ] Query performance acceptable

**E2E Tests**
- [ ] Complete estimation workflow
- [ ] Bill generation and saving
- [ ] User role access control
- [ ] Material approval workflow
- [ ] Multi-shop scenarios

**Performance Tests**
- [ ] Page load time < 3s
- [ ] Search response < 200ms
- [ ] Bill generation < 1s
- [ ] Concurrent users (5+) handled
- [ ] No memory leaks

**Browser Compatibility**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Chrome Mobile

---

### Bug Tracking Template

When you find a bug, document it like this:

```markdown
## Bug: [Title]

**Severity:** [Critical/High/Medium/Low]
**Module:** [Auth/Materials/Estimations/etc]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Environment:**
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Version: X.X.X

**Attachments:**
[Screenshots/Logs]
```

---

## Test Execution Summary

| Test Category | Status | Last Run | Coverage |
|--------------|--------|----------|----------|
| Authentication | ⏳ Pending | - | 80% |
| Material CRUD | ⏳ Pending | - | 75% |
| Estimations | ⏳ Pending | - | 70% |
| Calculations | ⏳ Pending | - | 85% |
| API Endpoints | ⏳ Pending | - | 80% |
| Frontend | ⏳ Pending | - | 60% |
| Database | ⏳ Pending | - | 90% |
| E2E Flows | ⏳ Pending | - | 65% |

---

## Continuous Improvement

### Metrics to Track
- [ ] Test coverage percentage
- [ ] Defect density (bugs per 1000 lines)
- [ ] Mean time to resolution (MTTR)
- [ ] Test execution time
- [ ] Pass/fail rate trends

### Regular Testing Schedule
- **Daily:** Unit tests, smoke tests
- **Weekly:** Full regression testing
- **Before Release:** E2E + performance testing
- **Monthly:** Security audit, load testing

---

## Contact & Support

For testing questions or issues:
1. Check existing test files
2. Review this documentation
3. Run diagnostic scripts
4. Check logs in `server-dev.log`

---

**Last Updated:** January 10, 2026
**Version:** 1.0
