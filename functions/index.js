const functions = require('firebase-functions');
const admin = require('firebase-admin');

///! FIRESTORE ACCESS
admin.initializeApp();
const db = admin.firestore();
///! FIRESTORE ACCESS

///! AUTHENTICATION
const firebaseConfig = {
  apiKey: 'AIzaSyDKyhHWKoMoaYXjYCNE25fwixeM8G3ufck',
  authDomain: 'surveysparrow-7b88e.firebaseapp.com',
  databaseURL: 'https://surveysparrow-7b88e.firebaseio.com',
  projectId: 'surveysparrow-7b88e',
  storageBucket: 'surveysparrow-7b88e.appspot.com',
  messagingSenderId: '548826752650',
  appId: '1:548826752650:web:92915c926261b74c35ef73',
  measurementId: 'G-3W92K4W18W',
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
///! AUTHENTICATION

///! SERVER
const express = require('express');

const app = express();

/// baseUrl: ***/api

/// ROOT
app.get('/', (request, response) => {
  response.send('HI');
});

/// ALL USERS
app.get('/users', (request, response) => {
  db.collection('users')
    .get()
    .then(data => {
      let users = [];
      data.forEach(doc => {
        users.push(doc.data());
      });
      return response.json(users);
    })
    .catch(err => console.error(err));
});

/// SIGN UP
app.post('/signup', (request, response) => {
  const newUser = {
    username: request.body.username,
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
  };

  let token, userId;
  //TODO:validate the user name
  db.doc(`/users/${newUser.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return response
          .status(400)
          .json({ username: `${newUser.username} is already taken` });
      } else {
        firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
          })
          .then(idToken => {
            token = idToken;
            const userCredentials = {
              username: newUser.username,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId,
            };
            return db.doc(`/users/${newUser.username}`).create(userCredentials);
          })
          .then(() => response.status(201).json({ token }))
          .catch(err => {
            if (err.code == 'auth/email-already-in-use') {
              console.error('aeaefefef');
              return response
                .status(400)
                .json({ email: `${newUser.email} is already in use` });
            } else response.status(500).json({ error: err.code });
          });
      }
    });
});

exports.api = functions.https.onRequest(app);

///! SERVER
