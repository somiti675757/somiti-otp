const admin = require("firebase-admin");


// Firebase credentials from Render ENV
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);


// Initialize Firebase
admin.initializeApp({

  credential: admin.credential.cert(
    serviceAccount
  )

});


// Firestore database
const db = admin.firestore();

module.exports = db;
