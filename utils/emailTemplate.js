function getEmailTemplate(otp) {
  return `
    <h1>Your OTP is ${otp}</h1>
  `;
}

module.exports = getEmailTemplate;
