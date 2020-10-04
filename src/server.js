'use strict';

// Server files include authentication, their middlewares, and socket.io server connection with express.
// The rest could be handled through routing

// requirements constants
const express = require('express');
const app = express();
const cors = require('cors');

const notFoundHandler = require('./auth/middleware/404');
const serverErrorHandler = require('./src/middleware/500');


// Global MiddleWare where you could call it anywhere and has a global scope
app.use(express.json());
app.use(cors());
app.use(serverErrorHandler);
app.use(express.static('./public'));

// custom all containing route
const v1Router = require('./routes/api-vs');
app.use('/api/v1', v1Router);

// error routes
app.use('*', notFoundHandler);


module.exports = {
  server: app, 
  start: port => {
    let PORT = port || process.env.port || 3000;
    app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`));
  },
};