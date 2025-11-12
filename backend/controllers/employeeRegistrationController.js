// Employee Registration Controller
const { query } = require('../config/database');
const authServiceIntegration = require('../services/authServiceIntegration');
const sendPulseService = require('../services/sendPulseService');

/**
 * Check employee registration status after company setup
 * @param {string} companyId - Company ID
 * @returns {Promise<{registered: Array, unregistered: Array}>}
 */
const checkCompanyEmployeesRegistration = async (companyId) => {
  try {
    // Get all employees for the company
    const employeesResult = await query(
      `SELECT id, name, email, company_id 
       FROM employees 
       WHERE company_id = $1`,
      [companyId]
    );

    if (employeesResult.rows.length === 0) {
      return { registered: [], unregistered: [] };
    }

    const employees = employeesResult.rows;
    const emails = employees.map(emp => emp.email);

    // Check registration status with Auth Service
    const registrationStatuses = await authServiceIntegration.checkMultipleEmployees(emails);

    // Separate registered and unregistered employees
    const registered = [];
    const unregistered = [];

    registrationStatuses.forEach((status, index) => {
      const employee = employees[index];
      if (status.isRegistered) {
        registered.push({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          userId: status.userId,
        });
      } else {
        unregistered.push({
          id: employee.id,
          name: employee.name,
          email: employee.email,
        });
      }
    });

    return { registered, unregistered };
  } catch (error) {
    console.error('Error checking employee registration:', error.message);
    throw error;
  }
};

/**
 * Send in-app notification to HR about unregistered employees
 * Notification is stored in database and sent via SendPulse Push API (if available)
 * @param {string} companyId - Company ID
 * @param {Array} unregisteredEmployees - List of unregistered employees
 */
const notifyHRAboutUnregisteredEmployees = async (companyId, unregisteredEmployees) => {
  try {
    if (unregisteredEmployees.length === 0) {
      return { success: true, message: 'No unregistered employees to notify' };
    }

    // Get company and HR information
    const companyResult = await query(
      `SELECT c.id, c.name, cs.setting_value as hr_email
       FROM companies c
       LEFT JOIN company_settings cs ON c.id = cs.company_id AND cs.setting_key = 'hr_email'
       WHERE c.id = $1`,
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      throw new Error('Company not found');
    }

    const company = companyResult.rows[0];
    const hrEmail = company.hr_email;

    if (!hrEmail) {
      console.warn(`No HR email found for company ${companyId}`);
      return { success: false, error: 'HR email not found' };
    }

    // Send in-app notification via SendPulse (Push API)
    const notificationResult = await sendPulseService.sendUnregisteredEmployeesNotification(
      hrEmail,
      company.name,
      unregisteredEmployees
    );

    // Store notification record in database (main storage for in-app notifications)
    try {
      const employeeList = unregisteredEmployees
        .map((emp, index) => `${index + 1}. ${emp.name} (${emp.email})`)
        .join('\n');

      const notificationMessage = `The following employees from ${company.name} have not yet registered in the system:\n\n${employeeList}\n\nPlease contact these employees and request that they complete their registration so we can create their profiles and associate them with the company.`;

      if (notificationResult.success) {
        await query(
          `INSERT INTO notifications (company_id, type, recipient_email, message, status, message_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
          [
            companyId,
            'unregistered_employees',
            hrEmail,
            notificationMessage,
            'sent',
            notificationResult.messageId || null,
          ]
        );
      } else {
        // Store failed notification
        await query(
          `INSERT INTO notifications (company_id, type, recipient_email, message, status, created_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
          [
            companyId,
            'unregistered_employees',
            hrEmail,
            `Failed to send notification: ${notificationResult.error || 'Unknown error'}`,
            'failed',
          ]
        );
      }
    } catch (dbError) {
      // Don't fail if notification tracking fails
      console.warn('Failed to store notification record:', dbError.message);
    }

    return notificationResult;
  } catch (error) {
    console.error('Error notifying HR about unregistered employees:', error.message);
    // Don't throw - notification failure shouldn't break the flow
    return { success: false, error: error.message };
  }
};

/**
 * API endpoint: Check employee registration for a company
 */
const checkEmployeesRegistration = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const result = await checkCompanyEmployeesRegistration(companyId);

    res.json({
      success: true,
      data: {
        companyId,
        registered: result.registered,
        unregistered: result.unregistered,
        total: result.registered.length + result.unregistered.length,
      },
    });
  } catch (error) {
    console.error('Error in checkEmployeesRegistration:', error.message);
    next(error);
  }
};

/**
 * API endpoint: Trigger notification to HR about unregistered employees
 */
const triggerHRNotification = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Check registration status
    const registrationResult = await checkCompanyEmployeesRegistration(companyId);

    if (registrationResult.unregistered.length === 0) {
      return res.json({
        success: true,
        message: 'All employees are registered',
        data: {
          companyId,
          unregisteredCount: 0,
        },
      });
    }

    // Send notification to HR
    const notificationResult = await notifyHRAboutUnregisteredEmployees(
      companyId,
      registrationResult.unregistered
    );

    res.json({
      success: notificationResult.success,
      data: {
        companyId,
        unregisteredCount: registrationResult.unregistered.length,
        unregisteredEmployees: registrationResult.unregistered,
        notificationSent: notificationResult.success,
      },
      message: notificationResult.success
        ? `In-app notification sent to HR about ${registrationResult.unregistered.length} unregistered employee(s)`
        : 'Failed to send notification',
    });
  } catch (error) {
    console.error('Error in triggerHRNotification:', error.message);
    next(error);
  }
};

module.exports = {
  checkCompanyEmployeesRegistration,
  notifyHRAboutUnregisteredEmployees,
  checkEmployeesRegistration,
  triggerHRNotification,
};

