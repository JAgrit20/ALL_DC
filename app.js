const express = require('express');
const path = require('path');
const app = express();
var fs = require('fs');
var https = require('https');
var credentials = {key: fs.readFileSync('privkey_webapp.pem'), cert:  fs.readFileSync('fullchain_webapp.pem')};
app.use(express.static(path.join(__dirname, '/DCWebapp-bk/build/')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '/DCWebapp-bk/build/', 'index.html'));
});
var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(9000);
