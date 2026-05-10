const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"Campus Hub" <campus.hub2005@gmail.com>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Your OTP: ${otp}</h2>
      <p>This OTP is valid for 5 minutes.</p>
    `
  });
};

module.exports = sendOTP;
