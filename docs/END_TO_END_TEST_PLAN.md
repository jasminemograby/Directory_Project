# 🧪 END TO END Test Plan - Directory Microservice

**תאריך:** 2025-01-XX  
**מטרה:** לבדוק את כל הפלו מההתחלה עד הסוף

---

## 📋 Test Scenarios

### 1. ✅ Company Registration Flow - Complete

#### Test Case 1.1: Basic Registration (Step 1)
**Steps:**
1. Navigate to `/company/register`
2. Fill in:
   - Company Name: "Test Company"
   - Industry: "Technology"
   - Domain: "testcompany.com"
   - HR Name: "John Doe"
   - HR Email: "john@testcompany.com" (with live check)
   - HR Role: "HR Manager"
3. Click "Submit"

**Expected:**
- ✅ Live email check shows "✓ Email is available" (green)
- ✅ Form validates all required fields
- ✅ Redirects to Verification page
- ✅ Registration ID stored in localStorage

**Validation:**
- ✅ Email uniqueness check works (try duplicate email - should show error)
- ✅ All fields required validation works
- ✅ Domain format validation works

---

#### Test Case 1.2: Verification Flow
**Steps:**
1. After Step 1, user sees Verification page
2. Polling checks verification status
3. When verified, redirects to Step 4

**Expected:**
- ✅ Polling works correctly
- ✅ Status updates in real-time
- ✅ Redirects to Step 4 when verified

---

#### Test Case 1.3: Full Company Setup (Step 4)
**Steps:**
1. Fill in Company Settings:
   - Company Size: 50
   - Learning Path Policy: Manual
   - Decision Maker: Select from employees
   - Passing Grade: 70
   - Max Attempts: 3
   - Exercise Limit: Checked, value: 4
   - Public Publish: Yes
   - Company Bio: "Test company description"
   - Primary KPI: "Employee skill development"
2. Add Employees:
   - Employee 1: Regular Employee (no manager)
   - Employee 2: Internal Trainer (with AI Enable checked)
   - Employee 3: Manager (Department Manager of "Engineering")
3. Add Departments:
   - Department: "Engineering" (with manager: Employee 3)
   - Team: "Backend" (with manager: Employee 4)
4. Click "Submit Registration"

**Expected:**
- ✅ All fields save correctly
- ✅ Employees created with correct types
- ✅ Manager assignments work
- ✅ Departments/Teams created with managers
- ✅ Redirects to HR Dashboard
- ✅ Company ID and HR Employee ID stored

**Validation:**
- ✅ If departments exist, each must have manager (validation works)
- ✅ If teams exist, each must have manager (validation works)
- ✅ Decision Maker required if Manual approval
- ✅ AI Enable only shows for Trainers
- ✅ Manager fields only show if isManager checked

---

### 2. ✅ Employee Registration with Manager Assignment

#### Test Case 2.1: Regular Employee (No Manager)
**Steps:**
1. In Step 4, click "Add Employee"
2. Fill in:
   - Name: "Alice Smith"
   - Email: "alice@testcompany.com"
   - Current Role: "Developer"
   - Target Role: "Senior Developer"
   - Type: Regular Employee
   - Department: (Optional - leave empty)
   - Team: (Optional - leave empty)
   - Is Manager: (Unchecked)
3. Click "Add"

**Expected:**
- ✅ Employee added successfully
- ✅ No manager fields shown
- ✅ Department/Team optional (can be empty)

---

#### Test Case 2.2: Trainer with AI Enable
**Steps:**
1. Click "Add Employee"
2. Fill in:
   - Name: "Bob Trainer"
   - Email: "bob@testcompany.com"
   - Current Role: "Senior Developer"
   - Target Role: "Tech Lead"
   - Type: Internal Instructor
   - AI Enable: Checked
3. Click "Add"

**Expected:**
- ✅ Employee added as Trainer
- ✅ AI Enable checkbox appears (conditional)
- ✅ AI Enable saved to database

---

#### Test Case 2.3: Manager Assignment
**Steps:**
1. Click "Add Employee"
2. Fill in:
   - Name: "Charlie Manager"
   - Email: "charlie@testcompany.com"
   - Current Role: "Team Lead"
   - Target Role: "Engineering Manager"
   - Type: Regular Employee
   - Is Manager: Checked
   - Manager Type: Department Manager
   - Which Department: "Engineering"
3. Click "Add"

**Expected:**
- ✅ Manager fields appear (conditional)
- ✅ Manager Type dropdown appears
- ✅ Department dropdown appears (filtered)
- ✅ Employee saved as manager
- ✅ Department updated with manager_id

---

### 3. ✅ Department/Team Optional Flow

#### Test Case 3.1: Company Without Departments/Teams
**Steps:**
1. In Step 4, add employees WITHOUT creating departments/teams
2. Leave Department/Team fields empty for all employees
3. Submit registration

**Expected:**
- ✅ Registration succeeds
- ✅ Employees created without department/team assignment
- ✅ No validation errors about missing managers

---

#### Test Case 3.2: Company With Departments/Teams (Must Have Managers)
**Steps:**
1. Create Department "Engineering" (no manager assigned)
2. Try to submit

**Expected:**
- ✅ Validation error: "The following departments are missing a manager: Engineering"
- ✅ Cannot submit until manager assigned

**Steps (Continue):**
3. Assign Employee 3 as Department Manager of "Engineering"
4. Create Team "Backend" under "Engineering" (no manager)
5. Try to submit

**Expected:**
- ✅ Validation error: "The following teams are missing a manager: Engineering → Backend"
- ✅ Cannot submit until team manager assigned

**Steps (Continue):**
6. Assign Employee 4 as Team Manager of "Backend"
7. Submit

**Expected:**
- ✅ Registration succeeds
- ✅ All departments/teams have managers

---

### 4. ✅ Live Email Uniqueness Checks

#### Test Case 4.1: HR Email Check (Step 1)
**Steps:**
1. In Step 1, type HR Email: "existing@company.com"
2. Wait 500ms (debounce)

**Expected:**
- ✅ Shows "Checking email availability..."
- ✅ Then shows "❌ This email is already registered..." (if exists)
- ✅ Or "✓ Email is available" (if new)
- ✅ Input border turns red/green accordingly

---

#### Test Case 4.2: Employee Email Check (Step 4)
**Steps:**
1. In Step 4, add Employee 1 with email "alice@testcompany.com"
2. Click "Add Employee" again
3. Type email: "alice@testcompany.com"

**Expected:**
- ✅ Shows "❌ This email is already in use in this company"
- ✅ Input border turns red
- ✅ Cannot save duplicate email

---

### 5. ✅ Conditional Logic Tests

#### Test Case 5.1: Decision Maker Field
**Steps:**
1. In Step 4, select Learning Path Policy: "Auto"
2. Check Decision Maker field

**Expected:**
- ✅ Decision Maker field HIDDEN (not shown)

**Steps (Continue):**
3. Select Learning Path Policy: "Manual"
4. Check Decision Maker field

**Expected:**
- ✅ Decision Maker field SHOWN
- ✅ Required validation works

---

#### Test Case 5.2: Exercise Limit Field
**Steps:**
1. In Step 4, find "Limit Number of Exercises" checkbox
2. Check if checkbox is unchecked

**Expected:**
- ✅ Exercise Limit number field HIDDEN

**Steps (Continue):**
3. Check "Limit Number of Exercises" checkbox

**Expected:**
- ✅ Exercise Limit number field SHOWN
- ✅ Default value: 4

---

#### Test Case 5.3: Manager Fields
**Steps:**
1. In Employee Form, check "Is this person a manager?"

**Expected:**
- ✅ Manager Type dropdown appears
- ✅ Manager Of dropdown appears (conditional on type)

**Steps (Continue):**
2. Uncheck "Is this person a manager?"

**Expected:**
- ✅ Manager fields HIDDEN
- ✅ Manager Type and Manager Of reset

---

#### Test Case 5.4: AI Enable Field
**Steps:**
1. In Employee Form, select Type: "Regular Employee"

**Expected:**
- ✅ AI Enable checkbox HIDDEN

**Steps (Continue):**
2. Select Type: "Internal Instructor"

**Expected:**
- ✅ AI Enable checkbox SHOWN
- ✅ Can check/uncheck

---

### 6. ✅ Validation Rules Tests

#### Test Case 6.1: Required Fields
**Steps:**
1. Try to submit Step 1 without filling required fields

**Expected:**
- ✅ Validation errors for all required fields
- ✅ Cannot submit

---

#### Test Case 6.2: Email Format
**Steps:**
1. Type invalid email: "notanemail"

**Expected:**
- ✅ Validation error: "Invalid email format"

---

#### Test Case 6.3: Manager Assignment Validation
**Steps:**
1. Check "Is Manager" but don't select Manager Type

**Expected:**
- ✅ Validation error: "Manager type is required"

**Steps (Continue):**
2. Select Manager Type but don't select Manager Of

**Expected:**
- ✅ Validation error: "Please select which department/team this employee manages"

---

### 7. ✅ Backend Integration Tests

#### Test Case 7.1: Company Registration API
**Steps:**
1. Submit Step 1 registration
2. Check backend logs

**Expected:**
- ✅ Company created in database
- ✅ Company settings saved
- ✅ Registration ID returned

---

#### Test Case 7.2: Step 4 Registration API
**Steps:**
1. Submit Step 4 with all data
2. Check backend logs

**Expected:**
- ✅ All employees created
- ✅ Departments/Teams created
- ✅ Manager assignments saved
- ✅ Company settings saved
- ✅ HR employee created
- ✅ Transaction succeeds (all or nothing)

---

#### Test Case 7.3: Email Uniqueness API
**Steps:**
1. Call `/api/company/check-email?email=test@example.com`

**Expected:**
- ✅ Returns `{ success: true, available: true/false }`
- ✅ Checks both HR emails and employee emails

---

## ✅ Checklist - All Tests

- [ ] Test Case 1.1: Basic Registration (Step 1)
- [ ] Test Case 1.2: Verification Flow
- [ ] Test Case 1.3: Full Company Setup (Step 4)
- [ ] Test Case 2.1: Regular Employee (No Manager)
- [ ] Test Case 2.2: Trainer with AI Enable
- [ ] Test Case 2.3: Manager Assignment
- [ ] Test Case 3.1: Company Without Departments/Teams
- [ ] Test Case 3.2: Company With Departments/Teams (Must Have Managers)
- [ ] Test Case 4.1: HR Email Check (Step 1)
- [ ] Test Case 4.2: Employee Email Check (Step 4)
- [ ] Test Case 5.1: Decision Maker Field
- [ ] Test Case 5.2: Exercise Limit Field
- [ ] Test Case 5.3: Manager Fields
- [ ] Test Case 5.4: AI Enable Field
- [ ] Test Case 6.1: Required Fields
- [ ] Test Case 6.2: Email Format
- [ ] Test Case 6.3: Manager Assignment Validation
- [ ] Test Case 7.1: Company Registration API
- [ ] Test Case 7.2: Step 4 Registration API
- [ ] Test Case 7.3: Email Uniqueness API

---

## 🐛 Known Issues to Verify

1. **Database Connection** - Verify no connection errors
2. **Email Uniqueness** - Verify per-company constraint works
3. **Transaction Rollback** - Verify partial failures don't corrupt data
4. **Navigation** - Verify all redirects work correctly
5. **State Management** - Verify conditional fields show/hide correctly

---

**Status:** Ready for Testing  
**Next:** Run all test cases and document results

