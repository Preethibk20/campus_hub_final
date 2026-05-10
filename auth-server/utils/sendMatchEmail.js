const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

const sendMatchEmail = async (email, fromUserName, postTitle) => {
  await transporter.sendMail({
    from: `"Campus Hub" <campus.hub2005@gmail.com>`,
    to: email,
    subject: "Someone wants to team up with you on Campus Hub!",
    html: `
      <h2>Good news!</h2>
      <p><strong>${fromUserName}</strong> wants to team up with you for your Hackathon post: <strong>${postTitle}</strong>.</p>
      <p>Log in to Campus Hub to view their request and decide to accept or reject.</p>
      <br/>
      <p>Best,<br>Campus Hub Team</p>
    `
  });
};

module.exports = sendMatchEmail;
