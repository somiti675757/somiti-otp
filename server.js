require("dotenv").config();

const express = require("express");

const sendOtpRoute = require("./routes/sendOtp");

const verifyOtpRoute = require("./routes/verifyOtp");

const app = express();


// ==============================
// Middleware
// ==============================

app.use(express.json());


// ==============================
// Health Check Route
// ==============================

app.get("/", (req, res) => {

  res.send(
    "Somiti OTP Server is Running Live 24/7!"
  );

});


// ==============================
// OTP Routes
// ==============================

// Send OTP
app.use("/send-otp", sendOtpRoute);

// Verify OTP
app.use("/verify-otp", verifyOtpRoute);


// ==============================
// 404 Route
// ==============================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route not found"

  });

});


// ==============================
// Global Error Handler
// ==============================

app.use((err, req, res, next) => {

  console.error("SERVER ERROR:", err);

  res.status(500).json({

    success: false,

    message: "Internal Server Error"

  });

});


// ==============================
// Server Start
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Somiti OTP Server running on port ${PORT}`
  );

});
