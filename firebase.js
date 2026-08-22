const admin = require("firebase-admin");

let serviceAccount;


// ==============================
// Render ENV support
// ==============================

if (process.env.FIREBASE_SERVICE_ACCOUNT) {

  serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );

}

// ==============================
// Local JSON file support
// ==============================

else {

  serviceAccount = require(
    "./serviceAccountKey.json"
  );

}


// Initialize Firebase
admin.initializeApp({

  credential: admin.credential.cert(
    serviceAccount
  )

});


// Firestore DB
const db = admin.firestore();

module.exports = db;
