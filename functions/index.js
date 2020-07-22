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

/// FBAuth
const FBAuth = (request, response, next) => {
  let idToken;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer ')
  )
    idToken = request.headers.authorization.split('Bearer ')[1];
  else {
    console.error('No token found');
    return response.status(403).json({ error: 'Unauthorized' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      console.log(decodedToken);
      request.user = decodedToken;
      return db
        .collection('users')
        .where('userId', '==', request.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      request.user.username = data.docs[0].data().username;
      return next();
    });
};

///# FBAuth

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
        users.push(doc.id);
      });
      return response.json(users);
    })
    .catch(err => console.error(err));
});

const isEmail = email => {
  const regEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return regEx.test(email);
};
const isEmpty = string => string.trim() === '';

/// SIGN UP
app.post('/signup', (request, response) => {
  const newUser = {
    username: request.body.username,
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = 'Must not be empty';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be an valid email  ';
  }

  if (newUser.password !== newUser.confirmPassword)
    errors.password = 'Password must match';
  if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if (isEmpty(newUser.username)) errors.username = 'Must not be empty';

  if (Object.keys(errors).length > 0) return response.status(400).json(errors);

  let token, userId;
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
              urlsRef: db.doc(`/urls/${userId}`),
            };
            // db.doc(`/urls/${userId}`).create({});
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
/// SIGN UP

/// LOG IN
app.post('/login', (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };
  let errors = {};

  if (isEmpty(user.email)) errors.email = 'Must not be empty';
  if (isEmpty(user.password)) errors.password = 'Must not be empty';

  if (Object.keys(errors).length > 0) return response.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => response.json({ token }))
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password')
        return response
          .status(403)
          .json({ general: 'Wrong credentials, please try again' });
      else return response.status(500).json({ error: err.code });
    });
});
///# LOG IN

/// ADD URL

app.post('/url', FBAuth, (request, response) => {
  db.doc(`urls/${request.user.uid}/urls/${request.body.url}`)
    .create({ shortUrl: 'testseeee' })
    .then(() => response.status(201).json({ message: 'Url stored' }))
    .catch(err => {
      console.error(err);
      response.status(500).json(err);
    });
});

///# ADD URL

exports.api = functions.https.onRequest(app);

///! SERVER
