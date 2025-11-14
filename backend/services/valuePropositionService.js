// Value Proposition Service - Generates career value proposition using Gemini AI
const geminiService = require('./geminiService');
const { query } = require('../config/database');

/**
 * Generate value proposition for employee based on current role and target role
 * @param {string} employeeId - Employee UUID
 * @param {string} currentRole - Current role in company
 * @param {string} targetRole - Target role for career progression
 * @returns {Promise<string>} AI-generated value proposition
 */
const generateValueProposition = async (employeeId, currentRole, targetRole) => {
  if (!currentRole || !targetRole) {
    console.warn('[ValueProposition] Missing currentRole or targetRole');
    return null;
  }

  try {
    // Get employee basic info for context
    const employeeResult = await query(
      `SELECT name, email FROM employees WHERE id = $1`,
      [employeeId]
    );

    const employee = employeeResult.rows[0];
    if (!employee) {
      console.warn(`[ValueProposition] Employee not found: ${employeeId}`);
      return null;
    }

    // Create prompt for Gemini
    const prompt = `You are a career development advisor. Based on the following information, generate a professional value proposition (2-3 sentences, maximum 150 words) that describes:

1. What the employee currently does in their current role
2. Where they are planning to progress (target role)
3. The value they bring and their career trajectory within the company

Employee Information:
- Name: ${employee.name || 'Employee'}
- Current Role: ${currentRole}
- Target Role: ${targetRole}

Generate a value proposition that:
- Is professional and concise
- Highlights the employee's current contributions
- Shows the planned career progression
- Emphasizes growth and development within the company
- Uses a positive, forward-looking tone

Generate ONLY the value proposition text, without any additional commentary, labels, or explanations.`;

    // Use Gemini to generate value proposition
    const valueProposition = await geminiService.generateFromCustomPrompt(prompt);

    return valueProposition;
  } catch (error) {
    console.error('[ValueProposition] Error generating value proposition:', error.message);
    return null;
  }
};

/**
 * Get or generate value proposition for employee
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<string>} Value proposition text
 */
const getValueProposition = async (employeeId) => {
  try {
    // Check if value proposition already exists in database
    const existingResult = await query(
      `SELECT value_proposition FROM employees WHERE id = $1 AND value_proposition IS NOT NULL`,
      [employeeId]
    );

    if (existingResult.rows.length > 0 && existingResult.rows[0].value_proposition) {
      return existingResult.rows[0].value_proposition;
    }

    // Get current role and target role from employee
    const employeeResult = await query(
      `SELECT current_role, target_role FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      console.warn(`[ValueProposition] Employee not found: ${employeeId}`);
      return null;
    }

    const { current_role, target_role } = employeeResult.rows[0];

    if (!current_role || !target_role) {
      console.warn(`[ValueProposition] Missing current_role or target_role for employee: ${employeeId}`);
      return null;
    }

    // Generate new value proposition
    const valueProposition = await generateValueProposition(employeeId, current_role, target_role);

    if (valueProposition) {
      // Save to database
      await query(
        `UPDATE employees SET value_proposition = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [valueProposition, employeeId]
      );
      console.log(`[ValueProposition] Generated and saved value proposition for employee: ${employeeId}`);
    }

    return valueProposition;
  } catch (error) {
    console.error('[ValueProposition] Error getting value proposition:', error.message);
    return null;
  }
};

module.exports = {
  generateValueProposition,
  getValueProposition
};

