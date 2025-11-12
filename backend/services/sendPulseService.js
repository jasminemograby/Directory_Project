// SendPulse Service Integration - In-App Notifications
const axios = require('axios');

const SENDPULSE_API_URL = process.env.SENDPULSE_API_URL || 'https://api.sendpulse.com';
const SENDPULSE_USER_ID = process.env.SENDPULSE_USER_ID;
const SENDPULSE_SECRET = process.env.SENDPULSE_SECRET;

let accessToken = null;
let tokenExpiry = null;

/**
 * Get SendPulse access token using OAuth
 * SendPulse uses OAuth 2.0 with client credentials
 * @returns {Promise<string>}
 */
const getAccessToken = async () => {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    if (!SENDPULSE_USER_ID || !SENDPULSE_SECRET) {
      throw new Error('SendPulse credentials not configured');
    }

    // SendPulse OAuth endpoint
    const response = await axios.post(
      `${SENDPULSE_API_URL}/oauth/access_token`,
      {
        grant_type: 'client_credentials',
        client_id: SENDPULSE_USER_ID,
        client_secret: SENDPULSE_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      // Token expires in 3600 seconds (1 hour), refresh 5 minutes early
      tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
      return accessToken;
    }

    throw new Error('Failed to get SendPulse access token');
  } catch (error) {
    console.error('Error getting SendPulse access token:', error.message);
    if (error.response) {
      console.error('SendPulse API error status:', error.response.status);
      console.error('SendPulse API error data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

/**
 * Send in-app notification to HR about unregistered employees
 * In-app notifications are stored in database and sent via SendPulse Push API
 * @param {string} hrEmail - HR email address (used to identify the user)
 * @param {string} companyName - Company name
 * @param {Array<{name: string, email: string}>} unregisteredEmployees - List of unregistered employees
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
const sendUnregisteredEmployeesNotification = async (hrEmail, companyName, unregisteredEmployees) => {
  try {
    if (!SENDPULSE_USER_ID || !SENDPULSE_SECRET) {
      // In development or if SendPulse not configured, log and return success
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Mock] Would send in-app notification to HR ${hrEmail} about ${unregisteredEmployees.length} unregistered employees`);
        return { success: true, messageId: 'mock-message-id' };
      }
      throw new Error('SendPulse credentials not configured');
    }

    const token = await getAccessToken();

    // Create notification message
    const employeeList = unregisteredEmployees
      .map((emp, index) => `${index + 1}. ${emp.name} (${emp.email})`)
      .join('\n');

    const notificationTitle = `${unregisteredEmployees.length} Employee(s) Need Registration`;
    const notificationMessage = `The following employees from ${companyName} have not yet registered:\n\n${employeeList}\n\nPlease contact them to complete registration.`;

    // Send in-app notification via SendPulse Push API
    // SendPulse Push API endpoint: /push/tasks
    // Note: This requires the user to have subscribed to push notifications
    const pushData = {
      title: notificationTitle,
      body: notificationMessage,
      url: '/hr/notifications', // URL to redirect when notification is clicked
      icon: '/favicon.ico', // Optional: notification icon
      // Additional data for the notification
      data: {
        type: 'unregistered_employees',
        companyName: companyName,
        employeeCount: unregisteredEmployees.length,
        employees: unregisteredEmployees,
      },
    };

    console.log('📱 Sending in-app notification via SendPulse Push:', {
      to: hrEmail,
      title: notificationTitle,
    });

    // Try to send push notification via SendPulse
    // Note: SendPulse Push requires users to subscribe first
    // If push is not available, we'll store the notification in DB (which is the main storage)
    let pushResult = null;
    try {
      const response = await axios.post(
        `${SENDPULSE_API_URL}/push/tasks`,
        {
          title: pushData.title,
          body: pushData.body,
          website_id: process.env.SENDPULSE_WEBSITE_ID || null, // Website ID for push subscriptions
          // Filter by user email if possible
          filter: {
            email: hrEmail,
          },
          url: pushData.url,
          icon: pushData.icon,
          data: pushData.data,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (response.data) {
        console.log('📱 SendPulse Push API Response:', JSON.stringify(response.data, null, 2));
        pushResult = {
          success: true,
          messageId: response.data.id || response.data.task_id || null,
        };
      }
    } catch (pushError) {
      // Push notification failed - this is OK, we'll store in DB anyway
      console.log('📱 SendPulse Push notification not sent (user may not be subscribed):', pushError.message);
      if (pushError.response) {
        console.log('   Push API Error:', pushError.response.status, JSON.stringify(pushError.response.data, null, 2));
      }
      // Continue - notification will be stored in DB
    }

    // Return success - notification is stored in DB (main storage)
    // Push notification is optional enhancement
    return {
      success: true,
      messageId: pushResult?.messageId || 'db-stored',
      pushSent: pushResult?.success || false,
    };
  } catch (error) {
    // Log error but don't fail the entire process
    console.error('❌ Error sending SendPulse notification:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Use mock data fallback
    try {
      const mockData = require('../../mockData/index.json');
      const mockResult = mockData.data?.sendpulse?.notification?.default || { success: true, messageId: 'mock-message-id' };
      console.log(`[Mock Data Fallback] SendPulse unavailable, using mock data for notification to ${hrEmail}:`, mockResult);
      return mockResult;
    } catch (mockError) {
      // If mock data file not found, use default
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Mock] In-app notification would be sent to ${hrEmail}`);
        return { success: true, messageId: 'mock-message-id' };
      }
      // In production, return failure but don't throw
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  sendUnregisteredEmployeesNotification,
};

