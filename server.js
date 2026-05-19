require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// UptimeRobot এবং সার্ভার চেক করার জন্য একটি রুট হোম এন্ডপয়েন্ট
app.get('/', (req, res) => {
  res.send('Somiti OTP Server is Running Live 24/7!');
});

// অ্যান্ড্রয়েড অ্যাপ থেকে ওটিপি পাঠানোর মেইন এন্ডপয়েন্ট
app.post('/send-otp', async (req, res) => {
  // রিকোয়েস্ট বডি থেকে ডেটা নেওয়া
  const currentEmail = req.body.email;
  const currentOtp = req.body.otp;

  if (!currentEmail || !currentOtp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required!' });
  }

  // প্লেইন টেক্সট ফরম্যাট (ব্যাকআপ হিসেবে)
  const plainTextContent = `আসসালামু আলাইকুম, সমিতি অ্যাপে আপনার ভেরিফিকেশন ওটিপি (OTP) কোড হলো: ${currentOtp}। এই কোডটির মেয়াদ মাত্র ৫ মিনিট।`;

  // এইচটিএমএল ফরম্যাট
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">সমিতি অ্যাপ ভেরিফিকেশন</h2>
        <p>আসসালামু আলাইকুম,</p>
        <p>আপনার অ্যাকাউন্টটি ভেরিফাই করার জন্য নিচে একটি ওয়ান-тайম পাসওয়ার্ড (OTP) দেওয়া হলো। কোডটি কারো সাথে শেয়ার করবেন না।</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
            ${currentOtp}
        </div>
        <p style="font-size: 12px; color: #777; text-align: center;">এই কোডটির মেয়াদ মাত্র ৫ মিনিট। যদি আপনি এই রিকোয়েস্ট না করে থাকেন, তবে ইমেইলটি ইগনোর করুন।</p>
    </div>
  `;

  // ব্রেভো HTTP API এর মাধ্যমে মেইল পাঠানোর কনফিগারেশন
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_PASS,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: "Somiti App",
          email: process.env.SENDER_EMAIL || "somiti5757@gmail.com"
        },
        to: [{ email: currentEmail }],
        subject: '🔒 আপনার অ্যাকাউন্ট ভেরিফিকেশন ওটিপি (OTP)',
        textContent: plainTextContent, // টেক্সট কন্টেন্ট যুক্ত করা হলো
        htmlContent: emailHtml
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error:', data);
      return res.status(500).json({ success: false, message: 'Failed to send OTP via API', error: data });
    }

    console.log('Email sent successfully via API:', data);
    res.status(200).json({ success: true, message: 'OTP sent successfully to ' + currentEmail });

  } catch (error) {
    console.error('Network Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// সার্ভার পোর্ট লিসেনিং
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
