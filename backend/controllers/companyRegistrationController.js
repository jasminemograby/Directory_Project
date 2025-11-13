// Company Registration Controller
const { query, transaction } = require('../config/database');
const companyVerificationService = require('../services/companyVerificationService');

const registerCompanyStep1 = async (req, res, next) => {
  try {
    const { companyName, industry, hrName, hrEmail, hrRole, domain } = req.body;

    // Create company registration record
    const result = await query(
      `INSERT INTO companies (name, industry, domain, verification_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, industry, domain, verification_status`,
      [companyName, industry, domain, 'pending']
    );

    const company = result.rows[0];

    // Store HR information in company settings
    // Employee record will be created later after verification
    await query(
      `INSERT INTO company_settings (company_id, setting_key, setting_value, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP),
              ($4, $5, $6, CURRENT_TIMESTAMP),
              ($7, $8, $9, CURRENT_TIMESTAMP)`,
      [
        company.id, 'hr_name', hrName,
        company.id, 'hr_email', hrEmail,
        company.id, 'hr_role', hrRole,
      ]
    );

    // Initiate domain verification (async)
    companyVerificationService.verifyDomain(company.id, domain, hrEmail)
      .catch((error) => {
        console.error('Domain verification error:', error);
      });
    res.status(201).json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        domain: company.domain,
        verification_status: company.verification_status,
      },
      message: 'Company registration submitted. Verification in progress.',
    });
  } catch (error) {
    console.error('Company registration error:', error.message);
    next(error);
  }
};

const registerCompanyStep4 = async (req, res, next) => {
  try {

    const { registrationId, employees, departments = [], learningPathPolicy, decisionMakerId = null, primaryKPI, exerciseLimit, passingGrade, maxAttempts } = req.body;

    const result = await transaction(async (client) => {
      // Get company
      console.log(`[Step4] Looking for company with ID: ${registrationId}`);
      const companyResult = await client.query(
        'SELECT id, verification_status FROM companies WHERE id = $1',
        [registrationId]
      );

      if (companyResult.rows.length === 0) {
        console.error(`[Step4] Company not found with ID: ${registrationId}`);
        throw new Error('Company registration not found');
      }

      const company = companyResult.rows[0];
      console.log(`[Step4] Found company: ${company.id}, verification_status: ${company.verification_status}`);

      if (company.verification_status !== 'verified') {
        throw new Error('Company must be verified before completing setup');
      }

      // Create departments and teams first (only if provided)
      const departmentMap = new Map();
      const teamMap = new Map();
      
      // Only create departments if they exist and are not empty
      if (departments && departments.length > 0) {
        for (const dept of departments) {
          // Validate department data
          if (!dept.name || !dept.name.trim()) {
            continue;
          }

          // Check if department already exists (by name and company_id) to avoid duplicates
          // Use LOWER() for case-insensitive comparison
          const existingDept = await client.query(
            `SELECT id FROM departments WHERE company_id = $1 AND LOWER(TRIM(name)) = LOWER(TRIM($2))`,
            [company.id, dept.name]
          );

          let deptId;
          if (existingDept.rows.length > 0) {
            // Department already exists, use existing ID
            deptId = existingDept.rows[0].id;
          } else {
            // Find department manager UUID (managerId is email, need to find employee UUID)
            let deptManagerId = null;
            if (dept.managerId) {
              // managerId is email, find the employee UUID
              const managerEmp = employees.find((e) => e.email === dept.managerId);
              if (managerEmp) {
                // We'll set this after creating employees
                deptManagerId = dept.managerId; // Store email temporarily
              }
            }

            const deptResult = await client.query(
              `INSERT INTO departments (company_id, name, manager_id, created_at)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
               RETURNING id`,
              [company.id, dept.name.trim(), null] // manager_id will be updated after employees are created
            );
            deptId = deptResult.rows[0].id;
          }
          
          // Always set the manager email in the map (even if department already exists)
          const managerEmail = dept.managerId ? dept.managerId.trim() : null;
          departmentMap.set(dept.id, { dbId: deptId, managerEmail: managerEmail });

          // Create teams for this department
          if (dept.teams && dept.teams.length > 0) {
            for (const team of dept.teams) {
              // Validate team data
              if (!team.name || !team.name.trim()) {
                continue;
              }

              // Check if team already exists (by name and department_id) to avoid duplicates
              // Use LOWER() for case-insensitive comparison
              const existingTeam = await client.query(
                `SELECT id FROM teams WHERE department_id = $1 AND LOWER(TRIM(name)) = LOWER(TRIM($2))`,
                [deptId, team.name]
              );

              let teamId;
              if (existingTeam.rows.length > 0) {
                // Team already exists, use existing ID
                teamId = existingTeam.rows[0].id;
              } else {
                // Find team manager UUID
                let teamManagerId = null;
                if (team.managerId) {
                  const managerEmp = employees.find((e) => e.email === team.managerId);
                  if (managerEmp) {
                    teamManagerId = team.managerId; // Store email temporarily
                  }
                }

                const teamResult = await client.query(
                  `INSERT INTO teams (department_id, name, manager_id, created_at)
                   VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                   RETURNING id`,
                  [deptId, team.name.trim(), null] // manager_id will be updated after employees are created
                );
                teamId = teamResult.rows[0].id;
              }
              
              // Always set the manager email in the map (even if team already exists)
              teamMap.set(team.id, { dbId: teamId, managerEmail: team.managerId || null });
            }
          }
        }
      }

      // Create employees with department/team assignment
      const employeeMap = new Map(); // Map email to employee ID for decision maker lookup
      
      // Get HR email from company_settings to exclude it from employees list if present
      const hrSettingsCheck = await client.query(
        `SELECT setting_value FROM company_settings 
         WHERE company_id = $1 AND setting_key = 'hr_email' 
         LIMIT 1`,
        [company.id]
      );
      const hrEmailFromSettings = hrSettingsCheck.rows.length > 0 
        ? hrSettingsCheck.rows[0].setting_value?.trim().toLowerCase() 
        : null;
      
      for (const emp of employees) {
        // Normalize email (trim and lowercase) for comparison
        const normalizedEmail = emp.email ? emp.email.trim().toLowerCase() : null;
        if (!normalizedEmail) {
          throw new Error(`Invalid email for employee: ${emp.name || 'Unknown'}`);
        }

        // Skip HR email if it appears in employees list - it will be created separately
        if (hrEmailFromSettings && normalizedEmail === hrEmailFromSettings) {
          console.log(`[Step4] Skipping HR email from employees list: ${normalizedEmail} (will be created separately)`);
          // Still check if it exists and add to employeeMap for manager lookups
          const hrCheck = await client.query(
            `SELECT id FROM employees WHERE LOWER(TRIM(email)) = $1 AND company_id = $2`,
            [normalizedEmail, company.id]
          );
          if (hrCheck.rows.length > 0) {
            employeeMap.set(normalizedEmail, hrCheck.rows[0].id);
            console.log(`[Step4] HR employee already exists, added to map: ${hrCheck.rows[0].id}`);
          }
          continue; // Skip creating this employee - HR will be created separately
        }

        // Check if employee with this email already exists (email is UNIQUE globally)
        // Use case-insensitive comparison
        const existingEmp = await client.query(
          `SELECT id, company_id, email FROM employees WHERE LOWER(TRIM(email)) = $1`,
          [normalizedEmail]
        );

        let employeeId;
        if (existingEmp.rows.length > 0) {
          const existingEmployee = existingEmp.rows[0];
          // If employee exists in the same company, use existing ID
          if (existingEmployee.company_id === company.id) {
            employeeId = existingEmployee.id;
            employeeMap.set(normalizedEmail, employeeId);
            console.log(`[Step4] Employee already exists in same company: ${employeeId} (${existingEmployee.email})`);
            
            // Don't skip - we still need to update managers and external links
            // Continue to the manager update section below
          } else {
            // Employee exists in a different company - this is an error (email must be unique globally)
            throw new Error(`Employee with email ${existingEmployee.email} already exists in another company (ID: ${existingEmployee.company_id}). Email must be unique across all companies.`);
          }
        } else {
          // Employee doesn't exist, create new one
          // Find department and team IDs from the maps
          const deptInfo = emp.departmentId ? departmentMap.get(emp.departmentId) : null;
          const departmentId = deptInfo ? deptInfo.dbId : null;
          const teamInfo = emp.teamId ? teamMap.get(emp.teamId) : null;
          const teamId = teamInfo ? teamInfo.dbId : null;

          try {
            console.log(`[Step4] Creating employee: ${emp.email} for company ${company.id}`);
            // Use normalized email for insert
            const empResult = await client.query(
              `INSERT INTO employees (
                company_id, name, email, role, target_role, type,
                department_id, team_id, profile_status, created_at, updated_at
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING id`,
              [
                company.id,
                emp.name,
                normalizedEmail, // Use normalized email
                emp.currentRole,
                emp.targetRole,
                emp.type,
                departmentId,
                teamId,
                'pending',
              ]
            );
            
            employeeId = empResult.rows[0].id;
            employeeMap.set(normalizedEmail, employeeId);
            console.log(`[Step4] Employee created successfully: ${employeeId} (${emp.email})`);
          } catch (insertError) {
            console.error(`[Step4] Error creating employee ${emp.email}:`, {
              code: insertError.code,
              constraint: insertError.constraint,
              message: insertError.message,
              detail: insertError.detail
            });
            // If insert fails due to duplicate, check again (race condition)
            if (insertError.code === '23505' && insertError.constraint === 'employees_email_key') {
              try {
                // Use case-insensitive comparison
                const retryCheck = await client.query(
                  `SELECT id, company_id, email FROM employees WHERE LOWER(TRIM(email)) = $1`,
                  [normalizedEmail]
                );
                if (retryCheck.rows.length > 0) {
                  const retryEmployee = retryCheck.rows[0];
                  if (retryEmployee.company_id === company.id) {
                    employeeId = retryEmployee.id;
                    employeeMap.set(normalizedEmail, employeeId);
                    console.log(`[Step4] Employee found after duplicate error: ${employeeId} (${retryEmployee.email})`);
                    // Don't continue - we still need to update managers
                  } else {
                    throw new Error(`Employee with email ${retryEmployee.email} already exists in another company (ID: ${retryEmployee.company_id}). Email must be unique across all companies.`);
                  }
                } else {
                  // This shouldn't happen, but if it does, re-throw the error
                  console.error(`[Step4] Duplicate constraint error but employee not found: ${normalizedEmail}`);
                  throw insertError;
                }
              } catch (retryError) {
                // If retry query fails (transaction might be aborted), re-throw original error
                if (retryError.message?.includes('aborted') || retryError.code === '25P02') {
                  throw insertError; // Re-throw original error to trigger rollback
                }
                throw retryError;
              }
            } else {
              // Not a duplicate email error, re-throw
              throw insertError;
            }
          }
        }
        
        // At this point, employeeId is set (either from existing or newly created)

        // Update department manager if this employee is a department manager
        if (employeeId) {
          try {
            for (const [deptKey, deptInfo] of departmentMap.entries()) {
              const managerEmail = deptInfo.managerEmail ? deptInfo.managerEmail.trim() : null;
              const empEmail = emp.email ? emp.email.trim() : null;
              const isMatch = managerEmail && empEmail && managerEmail.toLowerCase() === empEmail.toLowerCase();
              
              if (isMatch && deptInfo.dbId) {
                await client.query(
                  `UPDATE departments SET manager_id = $1 WHERE id = $2`,
                  [employeeId, deptInfo.dbId]
                );
              }
            }

            // Update team manager if this employee is a team manager
            for (const [teamKey, teamInfo] of teamMap.entries()) {
              const teamManagerEmail = teamInfo.managerEmail ? teamInfo.managerEmail.trim().toLowerCase() : null;
              const empEmailNormalized = normalizedEmail;
              if (teamManagerEmail && empEmailNormalized && teamManagerEmail === empEmailNormalized && teamInfo.dbId) {
                await client.query(
                  `UPDATE teams SET manager_id = $1 WHERE id = $2`,
                  [employeeId, teamInfo.dbId]
                );
              }
            }
          } catch (updateError) {
            // Log but don't fail transaction for manager updates
            console.warn(`Failed to update managers for employee ${employeeId}:`, updateError.message);
            // If transaction is aborted, re-throw to trigger rollback
            if (updateError.message?.includes('aborted') || updateError.code === '25P02') {
              throw updateError;
            }
          }
        }

        // Store external data links
        if (emp.externalLinks && employeeId) {
          const linkTypes = ['linkedin', 'github', 'credly', 'youtube', 'orcid', 'crossref'];
          for (const linkType of linkTypes) {
            if (emp.externalLinks[linkType]) {
              try {
                await client.query(
                  `INSERT INTO external_data_links (employee_id, link_type, url, created_at)
                   VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                   ON CONFLICT DO NOTHING`,
                  [employeeId, linkType, emp.externalLinks[linkType]]
                );
              } catch (linkError) {
                // Log but don't fail transaction for external links
                console.warn(`Failed to insert external link ${linkType} for employee ${employeeId}:`, linkError.message);
              }
            }
          }
        }
      }

      // Find decision maker UUID if provided (only for manual approval)
      let decisionMakerUUID = null;
      if (learningPathPolicy === 'manual' && decisionMakerId) {
        // Check if it's already a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(decisionMakerId)) {
          decisionMakerUUID = decisionMakerId;
        } else {
          // It's an email, find the employee UUID
          decisionMakerUUID = employeeMap.get(decisionMakerId) || null;
          if (!decisionMakerUUID) {
            throw new Error(`Decision maker with email ${decisionMakerId} not found in employees list`);
          }
        }
      }

      // Update company with learning path policy and KPI
      await client.query(
        `UPDATE companies 
         SET learning_path_approval_policy = $1, 
             decision_maker_id = $2,
             primary_kpi = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [learningPathPolicy, decisionMakerUUID, primaryKPI || null, company.id]
      );

      // Save organizational settings (Exercise limit, Passing grade, Max attempts)
      if (exerciseLimit !== undefined && exerciseLimit !== null && exerciseLimit !== '') {
        await client.query(
          `INSERT INTO company_settings (company_id, setting_key, setting_value, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (company_id, setting_key) 
           DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP`,
          [company.id, 'exercise_limit', exerciseLimit.toString()]
        );
      }

      if (passingGrade !== undefined && passingGrade !== null && passingGrade !== '') {
        await client.query(
          `INSERT INTO company_settings (company_id, setting_key, setting_value, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (company_id, setting_key) 
           DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP`,
          [company.id, 'passing_grade', passingGrade.toString()]
        );
      }

      if (maxAttempts !== undefined && maxAttempts !== null && maxAttempts !== '') {
        await client.query(
          `INSERT INTO company_settings (company_id, setting_key, setting_value, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (company_id, setting_key) 
           DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP`,
          [company.id, 'max_attempts', maxAttempts.toString()]
        );
      }

      // Create HR employee profile if not already created
      // Get HR info from company_settings
      const hrSettingsResult = await client.query(
        `SELECT setting_key, setting_value 
         FROM company_settings 
         WHERE company_id = $1 AND setting_key IN ('hr_name', 'hr_email', 'hr_role')`,
        [company.id]
      );

      const hrSettings = {};
      hrSettingsResult.rows.forEach(row => {
        hrSettings[row.setting_key] = row.setting_value;
      });

      if (hrSettings.hr_email) {
        // Check if HR employee already exists (either created in employees loop or already exists)
        // Use employeeMap to check if HR was already created in the employees loop
        const hrEmailNormalized = hrSettings.hr_email.trim().toLowerCase();
        let hrEmployeeId = null;
        
        // First check if HR was created in the employees loop (use normalized email)
        if (employeeMap.has(hrEmailNormalized)) {
          hrEmployeeId = employeeMap.get(hrEmailNormalized);
          console.log(`ℹ️ HR employee already created in employees loop: ${hrEmployeeId}`);
        }
        
        // If not found in employeeMap, check database
        if (!hrEmployeeId) {
          const hrEmployeeCheck = await client.query(
            `SELECT id FROM employees WHERE LOWER(TRIM(email)) = $1 AND company_id = $2`,
            [hrEmailNormalized, company.id]
          );

          if (hrEmployeeCheck.rows.length > 0) {
            hrEmployeeId = hrEmployeeCheck.rows[0].id;
            employeeMap.set(hrEmailNormalized, hrEmployeeId);
            console.log(`ℹ️ HR employee already exists in database: ${hrEmployeeId}`);
          }
        }

        // Only create if HR doesn't exist
        if (!hrEmployeeId) {
          try {
            const hrEmailNormalized = hrSettings.hr_email.trim().toLowerCase();
            const hrEmployeeResult = await client.query(
              `INSERT INTO employees (
                company_id, name, email, role, target_role, type,
                department_id, team_id, profile_status, created_at, updated_at
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING id`,
              [
                company.id,
                hrSettings.hr_name || 'HR Manager',
                hrEmailNormalized, // Use normalized email
                hrSettings.hr_role || 'HR Manager',
                hrSettings.hr_role || 'HR Manager', // target_role same as current role
                'regular', // HR is regular employee by default
                null, // No department/team assignment for HR
                null,
                'pending', // Profile status pending until enrichment
              ]
            );

            hrEmployeeId = hrEmployeeResult.rows[0].id;
            employeeMap.set(hrEmailNormalized, hrEmployeeId);
            console.log(`✅ HR employee profile created: ${hrEmployeeId} for ${hrSettings.hr_email}`);
          } catch (insertError) {
            // If insert fails due to duplicate (race condition), try to get existing
            if (insertError.code === '23505' && insertError.constraint === 'employees_email_key') {
              // Check if transaction is still active before querying
              try {
                const hrEmailNormalized = hrSettings.hr_email.trim().toLowerCase();
                const retryCheck = await client.query(
                  `SELECT id FROM employees WHERE LOWER(TRIM(email)) = $1 AND company_id = $2`,
                  [hrEmailNormalized, company.id]
                );
                if (retryCheck.rows.length > 0) {
                  hrEmployeeId = retryCheck.rows[0].id;
                  employeeMap.set(hrEmailNormalized, hrEmployeeId);
                  console.log(`ℹ️ HR employee created by another process: ${hrEmployeeId}`);
                } else {
                  // If not found, the transaction might be aborted - re-throw to trigger rollback
                  throw insertError;
                }
              } catch (retryError) {
                // If retry query also fails (transaction aborted), re-throw original error
                if (retryError.message?.includes('aborted') || retryError.code === '25P02') {
                  throw insertError; // Re-throw original error to trigger rollback
                }
                throw retryError;
              }
            } else {
              throw insertError;
            }
          }
        }
      }

      console.log(`[Step4] Transaction completed successfully for company: ${company.id}`);
      
      // CRITICAL: Verify company exists in DB before returning
      const verifyCompany = await client.query(
        'SELECT id, name, verification_status FROM companies WHERE id = $1',
        [company.id]
      );
      
      if (verifyCompany.rows.length === 0) {
        console.error(`[Step4] CRITICAL ERROR: Company ${company.id} not found in DB after transaction!`);
        throw new Error('Company not found after transaction commit');
      }
      
      console.log(`[Step4] Verified company exists in DB: ${verifyCompany.rows[0].id} | ${verifyCompany.rows[0].name}`);
      
      return { companyId: company.id };
    });

    console.log(`[Step4] Company setup completed. Company ID: ${result.companyId}`);
    
    // CRITICAL: Verify company exists AFTER transaction using connection pool
    try {
      const postTransactionCheck = await query(
        'SELECT id, name, verification_status FROM companies WHERE id = $1',
        [result.companyId]
      );
      
      if (postTransactionCheck.rows.length === 0) {
        console.error(`[Step4] CRITICAL ERROR: Company ${result.companyId} not found in DB after transaction using connection pool!`);
        console.error(`[Step4] This indicates a connection pool or transaction isolation issue`);
      } else {
        console.log(`[Step4] Post-transaction verification: Company found via connection pool: ${postTransactionCheck.rows[0].id} | ${postTransactionCheck.rows[0].name}`);
      }
    } catch (verifyError) {
      console.error(`[Step4] Error verifying company after transaction:`, verifyError.message);
    }

    // After company setup, check employee registration status (async - don't block response)
    const employeeRegistrationController = require('./employeeRegistrationController');
    employeeRegistrationController.checkCompanyEmployeesRegistration(result.companyId)
      .then(async (registrationResult) => {
        if (registrationResult.unregistered.length > 0) {
          // Send in-app notification to HR about unregistered employees
          await employeeRegistrationController.notifyHRAboutUnregisteredEmployees(
            result.companyId,
            registrationResult.unregistered
          );
        }
      })
      .catch((error) => {
        // Log error but don't fail the registration
        console.error('Error checking employee registration:', error.message);
      });

    // Get HR employee ID to return to frontend
    const hrEmployeeResult = await query(
      `SELECT id FROM employees 
       WHERE company_id = $1 
       AND email = (SELECT setting_value FROM company_settings WHERE company_id = $1 AND setting_key = 'hr_email' LIMIT 1)
       LIMIT 1`,
      [result.companyId]
    );

    const hrEmployeeId = hrEmployeeResult.rows.length > 0 ? hrEmployeeResult.rows[0].id : null;

    // Get HR email from company_settings to return to frontend
    const hrEmailResult = await query(
      `SELECT setting_value FROM company_settings 
       WHERE company_id = $1 AND setting_key = 'hr_email' 
       LIMIT 1`,
      [result.companyId]
    );
    const hrEmail = hrEmailResult.rows.length > 0 ? hrEmailResult.rows[0].setting_value : null;

    res.status(201).json({
      success: true,
      data: {
        companyId: result.companyId,
        hrEmployeeId: hrEmployeeId, // Return HR employee ID so frontend can store it
        hrEmail: hrEmail, // Return HR email so frontend can store it
      },
      message: 'Company setup completed successfully.',
    });
  } catch (error) {
    console.error('Company registration error:', error.message);
    next(error);
  }
};

const checkVerificationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkStatus, emailUpdate } = req.body;

    const result = await query(
      'SELECT id, name, domain, verification_status FROM companies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company registration not found',
      });
    }

    const company = result.rows[0];

    // If email update requested, handle it (would integrate with email service)
    if (emailUpdate) {
      // Store preference for email updates
      // This would be handled by email service
    }

    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        verification_status: company.verification_status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCompanyStep1,
  registerCompanyStep4,
  checkVerificationStatus,
};

