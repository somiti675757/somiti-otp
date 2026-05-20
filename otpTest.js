const {
  generateOtp,
  getExpiryTime
} = require("./services/otpService");

console.log("OTP:", generateOtp());

console.log("Expires At:", getExpiryTime());
