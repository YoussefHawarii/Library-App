import eventEmitter  from "events";
import { sendEmail, subjects } from "./sendEmails.js";
import { generateOTPHTML, generateThankYouHTML } from "./generateHTML.js";

export const emailEmitter = new eventEmitter();

emailEmitter.on("sendOTPEmail", async ({ email, otp, username }) => {
  try {
    await sendEmail({ to: email, subject: subjects.register, html: generateOTPHTML(username, otp) });
  } catch (err) {
    // This handler runs detached from the request (emitted fire-and-forget
    // from sendOTP), so an unhandled rejection here would crash the whole
    // process rather than fail just this request. The OTP is already
    // persisted before the email is sent, so log and move on instead.
    console.error("Failed to send OTP email:", err.message);
  }
});

emailEmitter.on("sendThankYouEmail", async ({ email, username }) => {
  try {
    await sendEmail({ to: email, subject: subjects.signupThankYou, html: generateThankYouHTML(username) });
  } catch (err) {
    console.error("Failed to send thank-you email:", err.message);
  }
});
