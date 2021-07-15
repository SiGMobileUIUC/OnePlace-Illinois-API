const admin = require('firebase-admin');

const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

(async () => {
  const snapshot = await db.collection('users').where('born', '<', 1900).get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
})();
