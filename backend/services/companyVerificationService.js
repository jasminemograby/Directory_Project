// Company Verification Service
const { query } = require('../config/database');
const emailService = require('./emailService');

/**
 * Verify company domain
 * This is a simplified verification - in production, you would:
 * 1. Check if domain exists (DNS lookup)
 * 2. Check if domain has email service (MX records)
 * 3. Verify domain ownership (email verification, DNS TXT records, etc.)
 * 
 * For testing/MVP: All valid domain formats are automatically verified after 5 seconds
 */
const verifyDomain = async (companyId, domain, hrEmail) => {
  try {
    // Simulate domain verification process
    // In production, this would make actual DNS/MX record checks
    
    // For MVP/Testing: Accept any valid domain format
    // Domain format is already validated in the validator
    const domainParts = domain.split('.');
    const isValid = domainParts.length >= 2 && domainParts[domainParts.length - 1].length >= 2;

    if (isValid) {
      // Simulate async verification (would take time in real scenario)
      // For testing: All valid domains are automatically verified
      setTimeout(async () => {
        try {
          await query(
            `UPDATE companies 
             SET verification_status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            ['verified', companyId]
          );
          // Send success email (optional)
          // await emailService.sendVerificationSuccessEmail(hrEmail, domain);
        } catch (error) {
          console.error('Error updating verification status:', error);
        }
      }, 5000); // Simulate 5 second verification delay
    } else {
      // Invalid domain format
      await query(
        `UPDATE companies 
         SET verification_status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        ['rejected', companyId]
      );

      // Send rejection email
      await emailService.sendVerificationRejectionEmail(hrEmail, domain, 'Invalid domain format');
    }
  } catch (error) {
    console.error('Domain verification error:', error);
    // Mark as rejected on error
    await query(
      `UPDATE companies 
       SET verification_status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      ['rejected', companyId]
    );
  }
};

module.exports = {
  verifyDomain,
};

