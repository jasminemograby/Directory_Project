// Profile Approval Controller - HR approval of employee profiles
const { query } = require('../config/database');

/**
 * Get pending profiles for HR approval
 * Returns all employees with profile_status = 'pending' in the HR's company
 */
const getPendingProfiles = async (req, res) => {
  try {
    // Get HR's company ID from query or from employee lookup
    const hrEmail = req.query.hrEmail || req.user?.email;
    
    if (!hrEmail) {
      return res.status(400).json({
        success: false,
        error: 'HR email is required'
      });
    }

    const normalizedEmail = hrEmail.trim().toLowerCase();

    // Get HR's company ID from settings first
    let companyId = null;
    const hrCheck = await query(
      `SELECT company_id 
       FROM company_settings 
       WHERE setting_key = 'hr_email' 
       AND LOWER(TRIM(setting_value)) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    if (hrCheck.rows.length > 0) {
      companyId = hrCheck.rows[0].company_id;
    } else {
      // Fallback: check employees table (in case settings missing)
      const employeeCheck = await query(
        `SELECT company_id 
         FROM employees 
         WHERE LOWER(email) = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [normalizedEmail]
      );

      if (employeeCheck.rows.length > 0) {
        companyId = employeeCheck.rows[0].company_id;
        console.warn(`[ProfileApproval] HR email missing in company_settings, using employees fallback for ${normalizedEmail}`);
      } else {
        return res.status(404).json({
          success: false,
          error: 'HR not found or not authorized'
        });
      }
    }

    // Get all pending profiles in the company
    // IMPORTANT: Only show profiles that have completed enrichment (OAuth + Gemini processing)
    // A profile must have processed data (bio) to appear in pending approvals
    // This means the employee must have:
    // 1. Logged in to their profile
    // 2. Connected LinkedIn and/or GitHub (OAuth)
    // 3. Completed enrichment (Gemini AI processing)
    // Only then will it appear for HR approval
    // 
    // CRITICAL: Filter by company_id FIRST to prevent cross-company data leakage
    console.log(`[ProfileApproval] Fetching pending profiles for company: ${companyId}`);
    
    const pendingResult = await query(
      `SELECT DISTINCT
        e.id,
        e.name,
        e.email,
        e.role,
        e.type,
        e."current_role",
        e.target_role,
        e.profile_status,
        e.created_at,
        e.company_id,
        d.name as department_name,
        t.name as team_name,
        CASE 
          WHEN edp.bio IS NOT NULL THEN true 
          ELSE false 
        END as has_processed_data,
        CASE 
          WHEN edr.id IS NOT NULL THEN true 
          ELSE false 
        END as has_raw_data
       FROM employees e
       INNER JOIN external_data_processed edp ON e.id = edp.employee_id AND edp.bio IS NOT NULL
       LEFT JOIN departments d ON e.department_id = d.id AND d.company_id = e.company_id
       LEFT JOIN teams t ON e.team_id = t.id AND t.department_id = e.department_id
       LEFT JOIN external_data_raw edr ON e.id = edr.employee_id
       WHERE e.company_id = $1 
       AND e.profile_status = 'pending'
       ORDER BY e.created_at DESC`,
      [companyId]
    );

    console.log(`[ProfileApproval] Found ${pendingResult.rows.length} pending profiles for company ${companyId}`);
    
    // Additional validation: Ensure all returned profiles belong to the correct company
    const invalidProfiles = pendingResult.rows.filter(emp => emp.company_id !== companyId);
    if (invalidProfiles.length > 0) {
      console.error(`[ProfileApproval] ❌ SECURITY ISSUE: Found ${invalidProfiles.length} profiles with wrong company_id!`, invalidProfiles);
      // Filter them out
      pendingResult.rows = pendingResult.rows.filter(emp => emp.company_id === companyId);
    }

    // Final validation: Double-check company_id before returning
    const validProfiles = pendingResult.rows
      .filter(emp => {
        if (emp.company_id !== companyId) {
          console.error(`[ProfileApproval] ❌ Filtered out profile ${emp.id} (${emp.email}) - wrong company_id: ${emp.company_id} (expected: ${companyId})`);
          return false;
        }
        return true;
      })
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role, // Professional job title
        type: emp.type, // Employee type (regular, internal_instructor, external_instructor)
        currentRole: emp.current_role,
        targetRole: emp.target_role,
        profileStatus: emp.profile_status,
        departmentName: emp.department_name,
        teamName: emp.team_name,
        createdAt: emp.created_at
      }));

    console.log(`[ProfileApproval] Returning ${validProfiles.length} valid pending profiles for company ${companyId}`);

    res.json({
      success: true,
      data: {
        pendingProfiles: validProfiles
      }
    });
  } catch (error) {
    console.error('[ProfileApprovalController] Error getting pending profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending profiles'
    });
  }
};

/**
 * Approve employee profile
 * Updates profile_status to 'approved'
 */
const approveProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { notes } = req.body; // Optional approval notes

    // Verify employee exists
    const employeeResult = await query(
      `SELECT id, company_id, profile_status 
       FROM employees 
       WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const employee = employeeResult.rows[0];

    // Update profile status to approved
    await query(
      `UPDATE employees 
       SET profile_status = 'approved', 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [employeeId]
    );

    // TODO: Log approval action (audit log)

    res.json({
      success: true,
      data: {
        employeeId: employee.id,
        profileStatus: 'approved',
        message: 'Profile approved successfully'
      }
    });
  } catch (error) {
    console.error('[ProfileApprovalController] Error approving profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve profile'
    });
  }
};

/**
 * Reject employee profile
 * Updates profile_status to 'rejected' with optional reason
 */
const rejectProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { reason } = req.body; // Rejection reason

    // Verify employee exists
    const employeeResult = await query(
      `SELECT id, company_id, profile_status 
       FROM employees 
       WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Update profile status to rejected
    await query(
      `UPDATE employees 
       SET profile_status = 'rejected', 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [employeeId]
    );

    // TODO: Store rejection reason (could add rejection_reason column or use audit log)
    // TODO: Log rejection action (audit log)

    res.json({
      success: true,
      data: {
        employeeId: employee.id,
        profileStatus: 'rejected',
        message: 'Profile rejected',
        reason: reason || null
      }
    });
  } catch (error) {
    console.error('[ProfileApprovalController] Error rejecting profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject profile'
    });
  }
};

/**
 * Get employee profile details for approval review
 */
const getProfileForApproval = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee profile with all relevant data
    const employeeResult = await query(
      `SELECT 
        e.id,
        e.name,
        e.email,
        e.role,
        e.type,
        e."current_role",
        e.target_role,
        e.profile_status,
        e.created_at,
        e.company_id,
        d.name as department_name,
        t.name as team_name,
        c.name as company_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN teams t ON e.team_id = t.id
       LEFT JOIN companies c ON e.company_id = c.id
       WHERE e.id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const employee = employeeResult.rows[0];

    // Get external data links
    const linksResult = await query(
      `SELECT link_type, url 
       FROM external_data_links 
       WHERE employee_id = $1`,
      [employeeId]
    );

    // Get processed data (bio, projects) if available
    const processedResult = await query(
      `SELECT bio, processed_at 
       FROM external_data_processed 
       WHERE employee_id = $1`,
      [employeeId]
    );

    res.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role, // Professional job title
          type: employee.type, // Employee type
          currentRole: employee.current_role,
          targetRole: employee.target_role,
          profileStatus: employee.profile_status,
          departmentName: employee.department_name,
          teamName: employee.team_name,
          companyName: employee.company_name,
          createdAt: employee.created_at
        },
        externalLinks: linksResult.rows.map(link => ({
          type: link.link_type,
          url: link.url
        })),
        processedData: processedResult.rows.length > 0 ? {
          bio: processedResult.rows[0].bio,
          processedAt: processedResult.rows[0].processed_at
        } : null
      }
    });
  } catch (error) {
    console.error('[ProfileApprovalController] Error getting profile for approval:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile details'
    });
  }
};

module.exports = {
  getPendingProfiles,
  approveProfile,
  rejectProfile,
  getProfileForApproval
};

