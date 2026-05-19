require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// ব্রেভো SMTP কনফিগারেশন
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false, // ৫৮৭ পোর্টের জন্য false হবে
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

// UptimeRobot এবং সার্ভার চেক করার জন্য একটি রুট হোম এন্ডপয়েন্ট
app.get('/', (req, res) => {
  res.send('Somiti OTP Server is Running Live 24/7!');
});

// অ্যান্ড্রয়েড অ্যাপ থেকে ওটিপি পাঠানোর মেইন এন্ডপয়েন্ট
app.post('/send-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required!' });
  }

  // ইমেইলের ফরম্যাট বা ডিজাইন (HTML)
  const mailOptions = {
    from: `"Somiti App" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: '🔒 আপনার অ্যাকাউন্ট ভেরিফিকেশন ওটিপি (OTP)',
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">সমিতি অ্যাপ ভেরিফিকেশন</h2>
                <p>আসসালামু আলাইকুম,</p>
                <p>আপনার অ্যাকাউন্টটি ভেরিফাই করার জন্য নিচে একটি ওয়ান-টাইম পাসওয়ার্ড (OTP) দেওয়া হলো। কোডটি কারো সাথে শেয়ার করবেন না।</p>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="font-size: 12px; color: #777; text-align: center;">এই কোডটির মেয়াদ মাত্র ৫ মিনিট। যদি আপনি এই রিকোয়েস্ট না করে থাকেন, তবে ইমেইলটি ইগনোর করুন।</p>
            </div>
        `
  };

  // মেইল পাঠানো শুরু
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
    console.log('Email sent successfully:', info.response);
    res.status(200).json({ success: true, message: 'OTP sent successfully to ' + email });
  });
});

// সার্ভার পোর্ট লিসেনিং
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
