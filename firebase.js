const admin = require("firebase-admin");

// Firebase service account key import
const serviceAccount = require("./serviceAccountKey.json");

// Firebase initialize
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firestore database instance
const db = admin.firestore();

// Export database
module.exports = db;
