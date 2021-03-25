'use strict';

// Express
var express = require('express');
const EXPRESS_PORT = 3000;
const EXPRESS_HOST = '0.0.0.0';

// Underscore
var _ = require('underscore');

// MySQL
var mysql = require('mysql');
var mysqlConfig = {};
mysqlConfig.host = !_.isEmpty(process.env.MYSQL_HOST)
  ? process.env.MYSQL_HOST
  : 'localhost';
mysqlConfig.port = !_.isEmpty(process.env.MYSQL_PORT)
  ? process.env.MYSQL_PORT
  : 3306;
mysqlConfig.database = !_.isEmpty(process.env.MYSQL_DB)
  ? process.env.MYSQL_DB
  : 'vmq_mysql';
mysqlConfig.user = !_.isEmpty(process.env.MYSQL_USER)
  ? process.env.MYSQL_USER
  : 'vmq_mysql';
mysqlConfig.password = !_.isEmpty(process.env.MYSQL_PASSWORD)
  ? process.env.MYSQL_PASSWORD
  : 'vmq_mysql';

var mysqlPool = mysql.createPool(mysqlConfig);

// Auth
var auth = require('./auth.js');

// Validation
var validation = require('./validation.js');

// App
var app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.send('ok');
});

app.get('/account/count', (req, res) => {
  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    auth.countAccount(connection, function (result) {
      connection.release();
      res.send('' + result);
    });
  });
});

app.post('/account/exist', (req, res) => {
  const body = req.body;
  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    auth.accountExist(connection, body.username, function (code) {
      connection.release();
      res.send(code == 0);
    });
  });
});

app.post('/account/change/password', (req, res) => {
  const body = req.body;
  if (!_.isString(body.username) || !_.isString(body.password)) {
    res.sendStatus(400);
    return;
  }

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    auth.changePasswordAccount(
      connection,
      body.username,
      body.password,
      function (code) {
        connection.release();
        if (code == 0) {
          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      }
    );
  });
});

app.post('/account/remove', (req, res) => {
  const body = req.body;
  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    auth.deleteAccount(connection, body.username, function (code) {
      connection.release();
      if (code == 0) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    });
  });
});

app.post('/account/remove/group', (req, res) => {
  const body = req.body;
  if (!_.isString(body.group)) {
    res.sendStatus(400);
    return;
  }

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    auth.deleteAccountByGroup(connection, body.group, function (code) {
      connection.release();
      if (code == 0) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    });
  });
});

app.post('/account/clear', (req, res) => {
  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    auth.clearAccount(connection, function (code) {
      connection.release();
      if (code == 0) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    });
  });
});

app.get('/su/list', (req, res) => {
  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    auth.listSU(connection, function (result) {
      connection.release();
      const arr = [];
      for (let i in result) {
        arr.push(result[i].username);
      }
      res.send(arr);
    });
  });
});

app.post('/su/add', (req, res) => {
  const body = req.body;
  if (!_.isString(body.username) || !_.isString(body.password)) {
    res.sendStatus(400);
    return;
  }

  let mountpoint = '';
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    auth.createSU(connection, mountpoint, body.username, body.password, function (code) {
      connection.release();
      if (code == 0) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    });
  });
});

app.post('/user/add', (req, res) => {
  const body = req.body;
  if (
    !_.isString(body.username) ||
    !_.isString(body.group) ||
    !_.isString(body.password) ||
    !_.isArray(body.publish_acl) ||
    !_.isArray(body.subscribe_acl)
  ) {
    res.sendStatus(400);
    return;
  }

  let mountpoint = '';
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  // Validate acls
  const publish_acl = validation.validateAcl(body.publish_acl);
  const subscribe_acl = validation.validateAcl(body.subscribe_acl);
  if (publish_acl == null || subscribe_acl == null) {
    res.sendStatus(400);
    return;
  }

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    auth.createUser(
      connection,
      mountpoint,
      body.username,
      body.group,
      body.password,
      publish_acl,
      subscribe_acl,
      function (code) {
        connection.release();
        if (code == 0) {
          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      }
    );
  });
});

// Main
app.listen(EXPRESS_PORT, EXPRESS_HOST, function () {
  console.log('##################################################');
  console.log('');
  console.log('Listening on ' + EXPRESS_HOST + ':' + EXPRESS_PORT);
  console.log('');
  console.log('##################################################');
});
