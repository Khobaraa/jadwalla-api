'use strict';

// Server files include authentication, their middlewares, and socket.io server connection with express.
// The rest could be handled through routing

// requirements constants
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.set('view engine', 'ejs');

require('./apps/chat/chat')(io);
const chatRouter = require('./routes/chat');
const notFoundHandler = require('./auth/middleware/404');
const serverErrorHandler = require('./auth/middleware/500');
const usersModel = require('./auth/models/users-model');
const basicAuth = require('./auth/middleware/basic');
const bearerAuth = require('./auth/middleware/bearer');
const aclMiddleWare = require('./auth/middleware/acl-middleware');
const oauth = require('./auth/middleware/oauth');



// Global MiddleWare where you could call it anywhere and has a global scope
app.use(express.json());
app.use(cors());
app.use(serverErrorHandler);
app.use(express.static('./public'));
app.use(chatRouter);

// routes as MiddleWare
// generic model
app.post('/signup', postAuthDetails);
app.post('/signin', basicAuth, verifyAuthDetails);
app.get('/oauth', oauth, (req, res) => {
  res.status(200).send(req.token);
});

app.get('/users/', bearerAuth, aclMiddleWare('read'), getUserDetails);
app.get('/users/:id', bearerAuth, aclMiddleWare('read'), getUserDetails);
app.put('/users/:id', bearerAuth, aclMiddleWare('update'), updateUserDetails);
app.delete('/users/:id', bearerAuth, aclMiddleWare('delete'), deleteUserDetails);


///////////////////////////////////////////
// const http = require('http');
// const http = require('http').Server(app);
// const io = require('socket.io')(http);

io.on('connection', (socket) => {
  socket.on('notification', msg => {
    console.log(msg); 
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// custom all containing route

// For dashboard
const dashboard = require('./routes/dashboard');
app.use('/', dashboard);

//For template
const template = require('./routes/template');
app.use('/', template);

// For notification
// const notification = require('./notification/notification');
// app.use('/', notification);

app.use('*', notFoundHandler);
// ----------------------------------- functions categories ----------------------------------- //
async function postAuthDetails(req, res, next) {
  console.log('here in post');
  usersModel.create(req.body).then(user => {
    res.status(200).send(user);  
  }).catch(err=> {
    console.log(err);
    next(err);
  });
}

function verifyAuthDetails(req, res, next) {
  if (req.token) {
    res.status(200).send({
      token: req.token,
      user: req.user,
    });
  } else {
    res.status(401).send('User Does Not Exists!');
  }
}

function getUserDetails(req, res, next) {
  let id = req.params.id;
  usersModel.get(id).then(data => {
    let output = {
      count: 0,
      results: [],
    };

    output.count = data.length;
    output.results = data;
    res.status(200).json(output);
  }).catch(err=> {
    console.log(err);
    next(err);
  });
}

function updateUserDetails(req, res, next) {
  let id = req.params.id;
  usersModel.update(id).then(data => {
    res.status(200).json(data);
  }).catch(err=> {
    console.log(err);
    next(err);
  });
}

function deleteUserDetails(req, res, next) {
  let id = req.params.id;
  usersModel.delete(id).then(data => {
    res.status(200).json(data);
  }).catch(err=> {
    console.log(err);
    next(err);
  });
}



module.exports = {
  server: http,
  start: port => {
    let PORT = port || 3000;
    http.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  },
  http : http,
};