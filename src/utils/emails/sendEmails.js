import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `Library App <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return info.rejected.length == 0 ? true : false;
};

export const subjects={
    register: "Registration OTP",
    signupThankYou: "Welcome to Library App - Account Created Successfully"
}