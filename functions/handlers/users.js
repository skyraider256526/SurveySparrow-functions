const firebase = require('firebase');

const { db } = require('../util/admin');

const { validateSignUpData, validateLogInData } = require('../util/validators');

const config = require('../util/config');

// console.log(config);

firebase.initializeApp(config);
///! Signup

exports.signup = (request, response) => {
  const newUser = {
    username: request.body.username,
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
  };

  const { valid, errors } = validateSignUpData(newUser);

  if (!valid) return response.status(400).json(errors);

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
};

///! Signup

///! Login
exports.login = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  const { valid, errors } = validateLogInData(user);

  if (!valid) return response.status(400).json(errors);

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
};
///! Login
