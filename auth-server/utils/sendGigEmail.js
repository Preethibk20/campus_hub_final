const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

const sendGigEmail = async (toEmail, type, details) => {
  let subject = "";
  let html = "";

  if (type === 'NEW_INTEREST') {
     subject = "New application for your Gig! 🚀";
     html = `
        <h2>Great news!</h2>
        <p>Someone is interested in your gig: <strong>${details.gigTitle}</strong>.</p>
        <p><strong>${details.applicantName}</strong> has just expressed interest. Log in to your dashboard to view their profile and accept the application.</p>
        <br/>
        <a href="http://localhost:3000/dashboard/my-gigs" style="background:#2563eb; color:white; padding:12px 24px; text-decoration:none; border-radius:12px; font-weight:bold;">View Applications</a>
        <br/><br/>
        <p>Best regards,<br>The Campus Hub Team</p>
     `;
  } else if (type === 'ACCEPTED') {
     subject = "Your Gig application was accepted! 🎉";
     html = `
        <h2>Congratulations!</h2>
        <p>Your application for the gig <strong>${details.gigTitle}</strong> has been <strong>ACCEPTED</strong> by ${details.posterName}.</p>
        <p>You can now reach out to them and start collaborating!</p>
        <br/>
        <p>Best regards,<br>The Campus Hub Team</p>
     `;
  }

  try {
    await transporter.sendMail({
      from: `"Campus Hub" <campus.hub2005@gmail.com>`,
      to: toEmail,
      subject: subject,
      html: html
    });
    console.log(`[EMAIL] ${type} sent to ${toEmail}`);
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send gig email:", error.message);
  }
};

module.exports = sendGigEmail;
