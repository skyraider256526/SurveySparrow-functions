const functions = require('firebase-functions');

const { addUrl, getUrls, deleteUrl } = require('./handlers/urls');

const { signup, login, getUserDetails } = require('./handlers/users');

const FBAuth = require('./util/fbAuth');

///! SERVER
const express = require('express');

const app = express();

/// baseUrl: ***/api

/// URL routes
app.post('/url', FBAuth, addUrl);
app.get('/urls', FBAuth, getUrls);
app.delete('/url/:id', FBAuth, deleteUrl);

/// Users route
app.post('/signup', signup);
app.post('/login', login);
app.get('/user', FBAuth, getUserDetails);

/// ROOT
app.get('/', (request, response) => {
  response.send('HI');
});

exports.api = functions.https.onRequest(app);

///! SERVER
