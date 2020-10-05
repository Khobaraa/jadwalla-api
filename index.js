'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const server = require('./src/server');

const MONGOOSE_URL = process.env.MONGOOSE_URL;

const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose.connect(MONGOOSE_URL, mongooseOptions);

server.start(3000);

// http server for socket.io

// server.http.listen(PORT, () => {
//   console.log('http server connected');
// });

