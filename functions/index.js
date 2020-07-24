const functions = require('firebase-functions');

const { db } = require('./util/admin');

const { addUrl } = require('./handlers/urls');

const { signup, login } = require('./handlers/users');

const FBAuth = require('./util/fbAuth');

///! SERVER
const express = require('express');

const app = express();

/// baseUrl: ***/api

/// URL routes
app.post('/url', FBAuth, addUrl);

/// Users route
app.post('/signup', signup);
app.post('/login', login);

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

exports.api = functions.https.onRequest(app);

///! SERVER
