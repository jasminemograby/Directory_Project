// Company Registration Controller
const { query, transaction } = require('../config/database');
const companyVerificationService = require('../services/companyVerificationService');

const registerCompanyStep1 = async (req, res, next) => {
  try {
    const { companyName, industry, hrName, hrEmail, hrRole, domain } = req.body;

    console.log('Registering company:', { companyName, industry, hrEmail, domain });

    // Create company registration record
    let result;
    try {
      result = await query(
        `INSERT INTO companies (name, industry, domain, verification_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, industry, domain, verification_status`,
        [companyName, industry, domain, 'pending']
      );
      console.log('Company created successfully:', result.rows[0].id);
    } catch (dbError) {
      console.error('Database error creating company:', {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
        hint: dbError.hint
      });
      throw dbError;
    }

    const company = result.rows[0];

    // Store HR information in company settings
    // Employee record will be created later after verification
    try {
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
      console.log('HR settings saved successfully');
    } catch (dbError) {
      console.error('Database error saving HR settings:', {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail
      });
      throw dbError;
    }

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
      const companyResult = await client.query(
        'SELECT id, verification_status FROM companies WHERE id = $1',
        [registrationId]
      );

      if (companyResult.rows.length === 0) {
        throw new Error('Company registration not found');
      }

      const company = companyResult.rows[0];

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
      
      for (const emp of employees) {
        // Check if employee with this email already exists (email is UNIQUE globally)
        const existingEmp = await client.query(
          `SELECT id, company_id FROM employees WHERE email = $1`,
          [emp.email]
        );

        let employeeId;
        if (existingEmp.rows.length > 0) {
          const existingEmployee = existingEmp.rows[0];
          // If employee exists in the same company, use existing ID
          if (existingEmployee.company_id === company.id) {
            employeeId = existingEmployee.id;
            employeeMap.set(emp.email, employeeId);
            
            // Don't skip - we still need to update managers and external links
            // Continue to the manager update section below
          } else {
            // Employee exists in a different company - this is an error (email must be unique globally)
            throw new Error(`Employee with email ${emp.email} already exists in another company. Email must be unique across all companies.`);
          }
        } else {
          // Employee doesn't exist, create new one
          // Find department and team IDs from the maps
          const deptInfo = emp.departmentId ? departmentMap.get(emp.departmentId) : null;
          const departmentId = deptInfo ? deptInfo.dbId : null;
          const teamInfo = emp.teamId ? teamMap.get(emp.teamId) : null;
          const teamId = teamInfo ? teamInfo.dbId : null;

          try {
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
                emp.email,
                emp.currentRole,
                emp.targetRole,
                emp.type,
                departmentId,
                teamId,
                'pending',
              ]
            );
            
            employeeId = empResult.rows[0].id;
            employeeMap.set(emp.email, employeeId);
          } catch (insertError) {
            // If insert fails due to duplicate, check again (race condition)
            if (insertError.code === '23505' && insertError.constraint === 'employees_email_key') {
              const retryCheck = await client.query(
                `SELECT id, company_id FROM employees WHERE email = $1`,
                [emp.email]
              );
              if (retryCheck.rows.length > 0) {
                const retryEmployee = retryCheck.rows[0];
                if (retryEmployee.company_id === company.id) {
                  employeeId = retryEmployee.id;
                  employeeMap.set(emp.email, employeeId);
                  // Don't continue - we still need to update managers
                } else {
                  throw new Error(`Employee with email ${emp.email} already exists in another company. Email must be unique across all companies.`);
                }
              } else {
                // This shouldn't happen, but if it does, re-throw the error
                throw insertError;
              }
            } else {
              // Not a duplicate email error, re-throw
              throw insertError;
            }
          }
        }
        
        // At this point, employeeId is set (either from existing or newly created)

        // Update department manager if this employee is a department manager
        for (const [deptKey, deptInfo] of departmentMap.entries()) {
          const managerEmail = deptInfo.managerEmail ? deptInfo.managerEmail.trim() : null;
          const empEmail = emp.email ? emp.email.trim() : null;
          const isMatch = managerEmail && empEmail && managerEmail.toLowerCase() === empEmail.toLowerCase();
          
          if (isMatch) {
            await client.query(
              `UPDATE departments SET manager_id = $1 WHERE id = $2`,
              [employeeId, deptInfo.dbId]
            );
          }
        }

        // Update team manager if this employee is a team manager
        for (const [teamKey, teamInfo] of teamMap.entries()) {
          const teamManagerEmail = teamInfo.managerEmail ? teamInfo.managerEmail.trim() : null;
          const empEmail = emp.email ? emp.email.trim() : null;
          if (teamManagerEmail && empEmail && teamManagerEmail.toLowerCase() === empEmail.toLowerCase()) {
            await client.query(
              `UPDATE teams SET manager_id = $1 WHERE id = $2`,
              [employeeId, teamInfo.dbId]
            );
          }
        }

        // Store external data links
        if (emp.externalLinks) {
          const linkTypes = ['linkedin', 'github', 'credly', 'youtube', 'orcid', 'crossref'];
          for (const linkType of linkTypes) {
            if (emp.externalLinks[linkType]) {
              await client.query(
                `INSERT INTO external_data_links (employee_id, link_type, url, created_at)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
                [employeeId, linkType, emp.externalLinks[linkType]]
              );
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

      return { companyId: company.id };
    });

    res.status(201).json({
      success: true,
      data: {
        companyId: result.companyId,
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

