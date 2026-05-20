const express = require("express");

const router = express.Router();

const db = require("../firebase");

const {
  generateOtp,
  getExpiryTime
} = require("../services/otpService");


// ==============================
// Send OTP Route
// ==============================

router.post("/", async (req, res) => {

  try {

    const email = req.body.email;

    // Email validation
    if (!email) {

      return res.status(400).json({

        success: false,

        message: "Email is required"

      });

    }

    // Existing OTP document check
    const existingDoc = await db
      .collection("otp_verifications")
      .doc(email)
      .get();

    if (existingDoc.exists) {

      const existingData = existingDoc.data();

      // 30 sec resend cooldown
      if (
        Date.now() - existingData.lastSentAt
        < 30000
      ) {

        return res.status(429).json({

          success: false,

          message:
            "Please wait before requesting another OTP"

        });

      }

    }

    // Generate secure OTP
    const otp = generateOtp();

    // OTP data
    const otpData = {

      otp: otp,

      createdAt: Date.now(),

      expiresAt: getExpiryTime(),

      used: false,

      attempts: 0,

      lastSentAt: Date.now()

    };

    // Save OTP to Firestore
    await db
      .collection("otp_verifications")
      .doc(email)
      .set(otpData);

    console.log("OTP Saved!");

    console.log(otpData);


    // ==============================
    // Email Content
    // ==============================

    const plainTextContent =
      `আসসালামু আলাইকুম,

সমিতি অ্যাপে আপনার ভেরিফিকেশন ওটিপি (OTP) কোড হলো:

${otp}

এই কোডটির মেয়াদ মাত্র ৫ মিনিট।`;



    const emailHtml = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 10px;
      ">

        <h2 style="
          color: #4CAF50;
          text-align: center;
        ">
          সমিতি অ্যাপ ভেরিফিকেশন
        </h2>

        <p>
          আসসালামু আলাইকুম,
        </p>

        <p>
          আপনার অ্যাকাউন্টটি ভেরিফাই করার জন্য নিচে একটি OTP কোড দেওয়া হলো।
        </p>

        <div style="
          background: #f4f4f4;
          padding: 15px;
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #333;
          border-radius: 5px;
          margin: 20px 0;
        ">
          ${otp}
        </div>

        <p style="
          font-size: 12px;
          color: #777;
          text-align: center;
        ">
          এই কোডটির মেয়াদ মাত্র ৫ মিনিট।
          কারো সাথে শেয়ার করবেন না।
        </p>

      </div>
    `;


    // ==============================
    // Send Email via Brevo API
    // ==============================

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {

        method: "POST",

        headers: {

          "accept": "application/json",

          "api-key": process.env.BREVO_PASS,

          "content-type": "application/json"

        },

        body: JSON.stringify({

          sender: {

            name: "Somiti App",

            email: process.env.SENDER_EMAIL

          },

          to: [

            {
              email: email
            }

          ],

          subject:
            "সমিতি অ্যাপ OTP ভেরিফিকেশন",

          textContent: plainTextContent,

          htmlContent: emailHtml

        })

      }
    );

    const data = await response.json();

    // Brevo error
    if (!response.ok) {

      console.error(
        "Brevo API Error:",
        data
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to send OTP email",

        error: data

      });

    }

    console.log(
      "Email sent successfully:",
      data
    );

    // Final success response
    res.status(200).json({

      success: true,

      message:
        "OTP sent successfully"

    });

  } catch (error) {

    console.error(
      "SEND OTP ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Internal Server Error"

    });

  }

});


// Export router
module.exports = router;
