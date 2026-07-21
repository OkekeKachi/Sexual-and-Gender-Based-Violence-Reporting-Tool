const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendInviteEmail = async (email, link) => {
  await transporter.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "You're invited to SafeSpeak",
    html: `
      <h2>Welcome to SafeSpeak</h2>
      <p>You have been invited as a Caseworker.</p>
      <p>Click below to set your password:</p>
      <a href="${link}">Set Password</a>
    `
  });
};

module.exports = sendInviteEmail; // ✅ VERY IMPORTANT