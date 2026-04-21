import eventEmitter  from "events";
import { sendEmail, subjects } from "./sendEmails.js";
import { generateOTPHTML, generateThankYouHTML } from "./generateHTML.js";

export const emailEmitter = new eventEmitter();

emailEmitter.on("sendOTPEmail", async ({ email, otp, username }) => {
  await sendEmail({ to: email, subject: subjects.register, html: generateOTPHTML(username, otp) });
});

emailEmitter.on("sendThankYouEmail", async ({ email, username }) => {
  await sendEmail({ to: email, subject: subjects.signupThankYou, html: generateThankYouHTML(username) });
});
