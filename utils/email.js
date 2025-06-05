/**
 * Email Service Utility
 * 
 * This module provides functionality for sending emails using AWS SES
 * with support for email templates and variable substitution.
 */

const fs = require('fs').promises;
const path = require('path');
const { SES } = require('@aws-sdk/client-ses');
const config = require('../config');

// Initialize AWS SES client
const sesClient = new SES({
  region: config.aws.ses.region,
  credentials: {
    accessKeyId: config.aws.ses.accessKeyId,
    secretAccessKey: config.aws.ses.secretAccessKey
  }
});

/**
 * Load an email template from the templates directory
 * @param {string} templateName - Name of the template file (without extension)
 * @returns {Promise<string>} - The template content
 */
const loadTemplate = async (templateName) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
    const template = await fs.readFile(templatePath, 'utf8');
    return template;
  } catch (error) {
    throw new Error(`Failed to load email template: ${error.message}`);
  }
};

/**
 * Replace template variables with actual values
 * @param {string} template - Email template with variables in {{variable}} format
 * @param {Object} data - Object containing variable values
 * @returns {string} - Processed template with variables replaced
 */
const processTemplate = (template, data = {}) => {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const value = data[variable.trim()];
    return value !== undefined ? value : match;
  });
};

/**
 * Send an email using a template
 * @param {Object} options - Email sending options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.templateName - Name of the template file (without extension)
 * @param {Object} options.templateData - Data to populate the template variables
 * @param {string} [options.from] - Sender email address (defaults to config)
 * @param {string} [options.replyTo] - Reply-to email address
 * @param {Array<string>} [options.cc] - CC recipients
 * @param {Array<string>} [options.bcc] - BCC recipients
 * @returns {Promise<Object>} - SES send response
 */
const sendTemplatedEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  from = `"${config.aws.ses.senderName}" <${config.aws.ses.senderEmail}>`,
  replyTo,
  cc,
  bcc
}) => {
  try {
    // Load and process the template
    const template = await loadTemplate(templateName);
    const htmlBody = processTemplate(template, templateData);

    // Prepare email parameters
    const params = {
      Source: from,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Add optional parameters if provided
    if (replyTo) {
      params.ReplyToAddresses = Array.isArray(replyTo) ? replyTo : [replyTo];
    }

    if (cc && cc.length > 0) {
      params.Destination.CcAddresses = cc;
    }

    if (bcc && bcc.length > 0) {
      params.Destination.BccAddresses = bcc;
    }

    // Send the email
    const result = await sesClient.sendEmail(params);
    return result;
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send a simple email without a template
 * @param {Object} options - Email sending options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} [options.html] - HTML email body
 * @param {string} [options.from] - Sender email address (defaults to config)
 * @param {string} [options.replyTo] - Reply-to email address
 * @param {Array<string>} [options.cc] - CC recipients
 * @param {Array<string>} [options.bcc] - BCC recipients
 * @returns {Promise<Object>} - SES send response
 */
const sendEmail = async ({
  to,
  subject,
  text,
  html,
  from = `"${config.aws.ses.senderName}" <${config.aws.ses.senderEmail}>`,
  replyTo,
  cc,
  bcc
}) => {
  try {
    // Prepare email parameters
    const params = {
      Source: from,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: text,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Add HTML body if provided
    if (html) {
      params.Message.Body.Html = {
        Data: html,
        Charset: 'UTF-8'
      };
    }

    // Add optional parameters if provided
    if (replyTo) {
      params.ReplyToAddresses = Array.isArray(replyTo) ? replyTo : [replyTo];
    }

    if (cc && cc.length > 0) {
      params.Destination.CcAddresses = cc;
    }

    if (bcc && bcc.length > 0) {
      params.Destination.BccAddresses = bcc;
    }

    // Send the email
    const result = await sesClient.sendEmail(params);
    return result;
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  loadTemplate,
  processTemplate
};