const config = require('./config.json');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const BlockListener = require('./services/BlockListener')


global.appRoot = path.resolve(__dirname);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


require('./routes')(app);

app.listen(config.port, () => {
  console.log('Server is running on port ' + config.port);
});





