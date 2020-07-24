const admin = require('firebase-admin');

///! FIRESTORE ACCESS
admin.initializeApp();
const db = admin.firestore();
///! FIRESTORE ACCESS

module.exports = { admin, db };
