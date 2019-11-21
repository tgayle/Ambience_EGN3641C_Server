require('dotenv').load();

import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import * as fireorm from "fireorm";
import * as admin from "firebase-admin";
import {
  tokenGenerator,
  makeCall,
  placeCall,
  incoming,
  welcome,
} from './src/server';

import roomRoute from './src/roomRoute';
import serviceAccount from './firestore.creds.json';

// Create Express webapp
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.send(welcome());
});

app.post('/', function(request, response) {
  response.send(welcome());
});

app.get('/accessToken', function(request, response) {
  tokenGenerator(request, response);
});

app.post('/accessToken', function(request, response) {
  tokenGenerator(request, response);
});

app.get('/makeCall', function(request, response) {
  makeCall(request, response);
});

app.post('/makeCall', function(request, response) {
  makeCall(request, response);
});

app.get('/placeCall', placeCall);

app.post('/placeCall', placeCall);

app.get('/incoming', function(request, response) {
  response.send(incoming());
});

app.post('/incoming', function(request, response) {
  response.send(incoming());
});

app.use('/room', roomRoute);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const firestore = admin.firestore();
firestore.settings({
  timestampsInSnapshots: true,
  
});

fireorm.initialize(firestore, {validateModels: false});

// Create an http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Express server running on *:' + port);
});


/*
TODO: Fetch this data from android
*/