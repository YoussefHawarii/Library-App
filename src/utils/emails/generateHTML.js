export const generateOTPHTML = (username, otp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Library App - OTP Verification</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: #f4f6fb;
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .wrapper {
      max-width: 500px;
      margin: 0 auto;
    }
    .container {
      background: #fff;
      padding: 40px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      text-align: center;
      width: 100%;
    }
    h2 {
      margin-bottom: 15px;
      color: #333;
      font-size: 24px;
    }
    p {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .otp-code {
      font-size: 28px;
      letter-spacing: 4px;
      margin: 25px 0;
      font-weight: bold;
      color: #007bff;
      background: #f0f7ff;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #007bff;
    }
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <h2>Hello, ${username}!</h2>
      <p>Your OTP verification code is:</p>
      <div class="otp-code">${otp}</div>
      <p>Please enter this code in the app to verify your identity.</p>
      <p style="margin-top: 15px; color: #999; font-size: 12px;">This code will expire in 10 minutes.</p>
      <div class="footer">
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const generateThankYouHTML = (username) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Library App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: #f4f6fb;
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .wrapper {
      max-width: 500px;
      margin: 0 auto;
    }
    .container {
      background: #fff;
      padding: 40px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      text-align: center;
      width: 100%;
    }
    .header {
      margin-bottom: 30px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    h1 {
      color: #007bff;
      font-size: 28px;
      margin-bottom: 10px;
    }
    h2 {
      color: #333;
      font-size: 22px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    p {
      color: #666;
      font-size: 14px;
      line-height: 1.8;
      margin-bottom: 15px;
    }
    .features {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      text-align: left;
    }
    .features h3 {
      color: #007bff;
      font-size: 16px;
      margin-bottom: 12px;
      text-align: center;
    }
    .feature-item {
      color: #555;
      font-size: 13px;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    .feature-item:before {
      content: "✓";
      color: #28a745;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .cta-button {
      display: inline-block;
      background: #007bff;
      color: #fff;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      margin: 20px 0;
      font-weight: 600;
    }
    .cta-button:hover {
      background: #0056b3;
    }
    .footer {
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
    }
    .footer p {
      margin-bottom: 8px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="icon">📚</div>
        <h1>Welcome to Library App</h1>
      </div>
      
      <h2>Hello, ${username}!</h2>
      <p>Thank you for signing up! We're excited to have you on board.</p>
      
      <p>Your account has been successfully created and is ready to use. You now have access to our entire library collection.</p>
      
      <div class="features">
        <h3>What You Can Do:</h3>
        <div class="feature-item">Browse thousands of books</div>
        <div class="feature-item">Borrow books and manage your collection</div>
        <div class="feature-item">Track your reading history</div>
        <div class="feature-item">Get personalized recommendations</div>
      </div>
      
      <p style="margin-top: 20px;">Get started by logging into your account and exploring our collection.</p>
      
      <a href="#" class="cta-button">Start Exploring</a>
      
      <p style="margin-top: 15px; font-size: 12px; color: #999;">If you have any questions, feel free to reach out to our support team.</p>
      
      <div class="footer">
        <p>© 2024 Library App. All rights reserved.</p>
        <p>This email was sent because you signed up for an account.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

