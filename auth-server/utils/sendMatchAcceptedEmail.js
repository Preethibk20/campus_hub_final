const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

const sendMatchAcceptedEmail = async (email, postTitle) => {
  try {
    await transporter.sendMail({
      from: `"Campus Hub" <campus.hub2005@gmail.com>`,
      to: email,
      subject: `Match Request Accepted! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2e7d32;">Great news!</h2>
          <p>Your request to join the team for <strong>"${postTitle}"</strong> has been accepted.</p>
          <p>You can now go to the dashboard and start collaborating with your new teammates.</p>
          <br/>
          <p style="color: #666; font-size: 0.9em;">Happy Hacking!<br/>The Campus Hub Team</p>
        </div>
      `
    });
    console.log(`[MAIL] Match accepted email sent to ${email}`);
  } catch (error) {
    console.error(`[MAIL ERROR] Failed to send match accepted email to ${email}:`, error.message);
  }
};

module.exports = sendMatchAcceptedEmail;
