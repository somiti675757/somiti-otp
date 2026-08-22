const express = require("express");

const router = express.Router();

const db = require("../firebase");


// ==============================
// Verify OTP Route
// ==============================

router.post("/", async (req, res) => {

  try {

    const email = String(req.body.email || "").trim();

    const enteredOtp = String(req.body.otp || "").trim();


    // Validation
    if (!email || !enteredOtp) {

      return res.status(400).json({

        success: false,

        message: "Email and OTP are required"

      });

    }


    // OTP অবশ্যই 6 digit হতে হবে
    if (!/^\d{6}$/.test(enteredOtp)) {

      return res.status(400).json({

        success: false,

        message: "OTP must be 6 digits"

      });

    }


    // ==============================
    // Firestore থেকে OTP data আনো
    // ==============================

    const doc = await db
      .collection("otp_verifications")
      .doc(email)
      .get();


    // OTP data না থাকলে
    if (!doc.exists) {

      return res.status(404).json({

        success: false,

        message: "No OTP found"

      });

    }


    const data = doc.data();


    // ==============================
    // Too many wrong attempts
    // ==============================

    if (data.attempts >= 5) {

      return res.status(429).json({

        success: false,

        message:
          "Too many attempts. Try again later."

      });

    }


    // ==============================
    // Already used?
    // ==============================

    if (data.used) {

      return res.status(400).json({

        success: false,

        message: "OTP already used"

      });

    }


    // ==============================
    // Expired?
    // ==============================

    if (Date.now() > data.expiresAt) {

      return res.status(400).json({

        success: false,

        message: "OTP expired"

      });

    }


    // ==============================
    // OTP compare
    // ==============================

    const savedOtp = String(data.otp || "").trim();


    if (enteredOtp !== savedOtp) {

      const newAttempts = data.attempts + 1;


      await db
        .collection("otp_verifications")
        .doc(email)
        .update({

          attempts: newAttempts

        });


      return res.status(400).json({

        success: false,

        message:
          `Wrong OTP. Attempts: ${newAttempts}/5`

      });

    }


    // ==============================
    // OTP verified successfully
    // ==============================

    await db
      .collection("otp_verifications")
      .doc(email)
      .update({

        used: true

      });


    console.log(
      "OTP VERIFIED SUCCESSFULLY!"
    );


    // ==============================
    // Success response
    // ==============================

    return res.status(200).json({

      success: true,

      message:
        "OTP verified successfully"

    });


  } catch (error) {

    console.error(
      "VERIFY OTP ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message: "Internal Server Error"

    });

  }

});


// ==============================
// Export router
// ==============================

module.exports = router;