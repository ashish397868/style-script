export function welcomeEmailTemplate(name){
    return `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6b21a8, #9333ea); padding: 20px 30px; color: #fff;">
      <h1 style="margin: 0;">Welcome, ${name}!</h1>
      <p style="margin: 5px 0 0;">Thanks for joining <strong>ScriptStyle</strong> – Where fashion meets comfort!</p>
    </div>

    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #444;">
        We're excited to have you on board. Whether you're upgrading your everyday look or shopping for a special occasion, we’ve got styles that speak your language.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://scriptstyle.com/shop" style="background: #6b21a8; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-size: 16px;">
          🛍️ Start Shopping Now
        </a>
      </div>

      <p style="font-size: 15px; color: #555;">
        Need help or have questions? Our team is just a message away. Feel free to reply to this email or visit our support center.
      </p>

      <p style="font-size: 15px; color: #555;">Happy styling,<br><strong>The ScriptStyle Team</strong></p>
    </div>

    <div style="background: #f3f4f6; padding: 15px 30px; text-align: center; font-size: 13px; color: #777;">
      You’re receiving this email because you signed up at ScriptStyle.<br>
      <a href="https://scriptstyle.com/unsubscribe" style="color: #6b21a8; text-decoration: none;">Unsubscribe</a>
    </div>
  </div>`
}