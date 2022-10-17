"use strict";

// Express
var _express = require("express");
const EXPRESS_PORT = 3000;
const EXPRESS_HOST = "0.0.0.0";

// Underscore
var _ = require("underscore");

// Env
var _mountpoint = !_.isEmpty(process.env.mountpoint)
  ? process.env.DEFAULT_MOUNTPOINT
  : "";

// Env MySQL
var _mysql = require("mysql");
var _mysqlConfig = {};
_mysqlConfig.host = !_.isEmpty(process.env.MYSQL_HOST)
  ? process.env.MYSQL_HOST
  : "localhost";
_mysqlConfig.port = !_.isEmpty(process.env.MYSQL_PORT)
  ? process.env.MYSQL_PORT
  : 3306;
_mysqlConfig.database = !_.isEmpty(process.env.MYSQL_DB)
  ? process.env.MYSQL_DB
  : "vmq_mysql";
_mysqlConfig.user = !_.isEmpty(process.env.MYSQL_USER)
  ? process.env.MYSQL_USER
  : "vmq_mysql";
_mysqlConfig.password = !_.isEmpty(process.env.MYSQL_PASSWORD)
  ? process.env.MYSQL_PASSWORD
  : "vmq_mysql";

var _mysqlPool = _mysql.createPool(_mysqlConfig);

// Query
var _query = require("./query.js");

// Validation
var _validation = require("./validation.js");

// App
var _app = _express();
_app.use(_express.json());

_app.get("/health", (req, res) => {
  res.send("ok");
});

_app.get("/account/count", (req, res) => {
  const query = req.query;
  var mountpoint = _mountpoint;
  if (_.isString(query.mountpoint)) {
    mountpoint = query.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    _query.countAccount(connection, mountpoint, function (result) {
      connection.release();
      res.send("" + result);
    });
  });
});

_app.get("/account/list", (req, res) => {
  const query = req.query;
  var mountpoint = _mountpoint;
  if (_.isString(query.mountpoint)) {
    mountpoint = query.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.listAccount(connection, mountpoint, function (result) {
      connection.release();
      const arr = [];
      for (var i in result) {
        arr.push(result[i].username);
      }
      res.send(arr);
    });
  });
});

_app.post("/account/exist", (req, res) => {
  const body = req.body;
  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }

  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    _query.accountExist(connection, mountpoint, body.username, function (code) {
      connection.release();
      res.send(code == 0);
    });
  });
});

_app.post("/account/update/password", (req, res) => {
  const body = req.body;
  if (!_.isString(body.username) || !_.isString(body.password)) {
    res.sendStatus(400);
    return;
  }

  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.updatePasswordAccount(
      connection,
      mountpoint,
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

_app.post("/account/remove", (req, res) => {
  const body = req.body;
  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }

  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.deleteAccount(
      connection,
      mountpoint,
      body.username,
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

_app.post("/account/remove/group", (req, res) => {
  const body = req.body;
  if (!_.isString(body.group)) {
    res.sendStatus(400);
    return;
  }

  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.deleteAccountByGroup(
      connection,
      mountpoint,
      body.group,
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

_app.post("/account/clear", (req, res) => {
  const body = req.body;
  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.clearAccount(connection, mountpoint, function (code) {
      connection.release();
      if (code == 0) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    });
  });
});

_app.get("/su/list", (req, res) => {
  const query = req.query;
  var mountpoint = _mountpoint;
  if (_.isString(query.mountpoint)) {
    mountpoint = query.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.listSU(connection, mountpoint, function (result) {
      connection.release();
      const arr = [];
      for (var i in result) {
        arr.push(result[i].username);
      }
      res.send(arr);
    });
  });
});

_app.post("/su/add", (req, res) => {
  const body = req.body;
  if (!_.isString(body.username) || !_.isString(body.password)) {
    res.sendStatus(400);
    return;
  }

  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.createSU(
      connection,
      mountpoint,
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

_app.get("/user/list", (req, res) => {
  const query = req.query;
  var mountpoint = _mountpoint;
  if (_.isString(query.mountpoint)) {
    mountpoint = query.mountpoint;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.listUser(connection, mountpoint, function (result) {
      connection.release();
      const arr = [];
      for (var i in result) {
        arr.push(result[i].username);
      }
      res.send(arr);
    });
  });
});

_app.post("/user/add", (req, res) => {
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

  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  // Validate acls
  const publish_acl = _validation.validateAcl(body.publish_acl);
  const subscribe_acl = _validation.validateAcl(body.subscribe_acl);
  if (publish_acl == null || subscribe_acl == null) {
    res.sendStatus(400);
    return;
  }

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.createUser(
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

_app.post("/user/update/acl", (req, res) => {
  const body = req.body;
  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }

  var mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  // Validate acls
  const publish_acl = _validation.validateAcl(body.publish_acl);
  const subscribe_acl = _validation.validateAcl(body.subscribe_acl);

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.updateAclUser(
      connection,
      mountpoint,
      body.username,
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
_app.listen(EXPRESS_PORT, EXPRESS_HOST, function () {
  console.log("##################################################");
  console.log("");
  console.log("Listening on " + EXPRESS_HOST + ":" + EXPRESS_PORT);
  console.log("");
  console.log("##################################################");
});
