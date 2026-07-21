const admin = require("firebase-admin");

const serviceAccount = require("./safespeak-21f59-firebase-adminsdk-829uf-265fd69059.json"); // download from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;