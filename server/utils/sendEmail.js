const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // Gmail ID
    pass: process.env.EMAIL_PASSWORD,   // Gmail ka App Password
  },
});

async function sendEmail({ to, subject, text, html }) {
  try {
    // Email ke options banao
    const mailOptions = {
      from: process.env.EMAIL_USER, // kisne bheja
      to,                           // kisko bhejna hai
      subject,                      // subject kya hoga
      text,                         // plain text
      html,                         // ya HTML body
    };

    // Email bhejo
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId); // confirmation
    return info;
  } catch (error) {
    console.error('Error sending email:', error); 
    throw error;
  }
}

module.exports = sendEmail;