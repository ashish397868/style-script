const nodemailer = require('nodemailer');

// Configure transporter (using Gmail SMTP example here)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // Your email address
    pass: process.env.EMAIL_PASSWORD,  // Your email password or app password
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body (optional)
 * @param {string} html - HTML body (optional)
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = sendEmail;
