const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

const sendTeamCompleteEmail = async (email, postTitle) => {
  await transporter.sendMail({
    from: `"Campus Hub" <campus.hub2005@gmail.com>`,
    to: email,
    subject: "Your Hackathon Team is Complete! 🎉",
    html: `
      <h2>Great news!</h2>
      <p>Your team for the Hackathon post: <strong>${postTitle}</strong> is now complete!</p>
      <p>Log in to Campus Hub to view your team members and start building.</p>
      <br/>
      <p>Best,<br>Campus Hub Team</p>
    `
  });
};

module.exports = sendTeamCompleteEmail;
