const crypto = require("crypto");

// Secure random OTP generate
function generateOtp() {

  return crypto
    .randomInt(100000, 999999)
    .toString();

}

// OTP expiry time (5 min)
function getExpiryTime() {

  return Date.now() + (5 * 60 * 1000);

}

module.exports = {
  generateOtp,
  getExpiryTime
};
