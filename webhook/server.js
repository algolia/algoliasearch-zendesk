const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express()
const port = 3000;

const options = {
  key: fs.readFileSync("cert/server.key"),
  cert: fs.readFileSync("cert/server.cert"),
};

const functions = require('./indexFunctions');

app.get('/', (req, res) => {
  res.send("Hello world");
});

app.use(express.static('public'));

app.get('/webhook', (req, res) => {
  console.log("webhook called ", req.query);
  res.send("Thanks");
  functions.indexTicket(req.query.ticketId);

});

https.createServer(options, app).listen(port, () => {
  console.log('HTTPS Server listening on port ' + port);
});