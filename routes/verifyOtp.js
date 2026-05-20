const express = require("express");

const router = express.Router();

const db = require("../firebase");


// ==============================
// Verify OTP Route
// ==============================

router.post("/", async (req, res) => {

  try {

    const email = req.body.email;

    const enteredOtp = req.body.otp;

    // Validation
    if (!email || !enteredOtp) {

      return res.status(400).json({

        success: false,

        message: "Email and OTP are required"

      });

    }

    // Firestore থেকে data আনো
    const doc = await db
      .collection("otp_verifications")
      .doc(email)
      .get();

    // User data না থাকলে
    if (!doc.exists) {

      return res.status(404).json({

        success: false,

        message: "No OTP found"

      });

    }

    const data = doc.data();

    // Too many wrong attempts
    if (data.attempts >= 5) {

      return res.status(429).json({

        success: false,

        message:
          "Too many attempts. Try again later."

      });

    }

    // Already used?
    if (data.used) {

      return res.status(400).json({

        success: false,

        message: "OTP already used"

      });

    }

    // Expired?
    if (Date.now() > data.expiresAt) {

      return res.status(400).json({

        success: false,

        message: "OTP expired"

      });

    }

    // OTP mismatch?
    if (enteredOtp !== data.otp) {

      // attempts বাড়াও
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

    // Success হলে used=true
    await db
      .collection("otp_verifications")
      .doc(email)
      .update({

        used: true

      });

    console.log(
      "OTP VERIFIED SUCCESSFULLY!"
    );

    // Success response
    res.status(200).json({

      success: true,

      message:
        "OTP verified successfully"

    });

  } catch (error) {

    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Internal Server Error"

    });

  }

});


// Export router
module.exports = router;
