"use strict";

// Express
const _express = require("express");
const EXPRESS_PORT = 3000;
const EXPRESS_HOST = "0.0.0.0";

// Underscore
const _ = require("underscore");

// Env
const _mountpoint =
  process.env.mountpoint != null ? process.env.DEFAULT_MOUNTPOINT : "";

// Env MySQL
const _mysql = require("mysql");
const _mysqlConfig = {};
_mysqlConfig.host =
  process.env.MYSQL_HOST != null ? process.env.MYSQL_HOST : "localhost";
_mysqlConfig.port =
  process.env.MYSQL_PORT != null ? process.env.MYSQL_PORT : 3306;
_mysqlConfig.database =
  process.env.MYSQL_DB != null ? process.env.MYSQL_DB : "vmq_mysql";
_mysqlConfig.user =
  process.env.MYSQL_USER != null ? process.env.MYSQL_USER : "vmq_mysql";
_mysqlConfig.password =
  process.env.MYSQL_PASSWORD != null ? process.env.MYSQL_PASSWORD : "vmq_mysql";

const _mysqlPool = _mysql.createPool(_mysqlConfig);

// Query
const _query = require("./query.js");

// Validation
const _validation = require("./validation.js");

// App
const _app = _express();
_app.use(_express.json());

_app.get("/health", (req, res) => {
  res.send("ok");
});

_app.get("/account/count", (req, res) => {
  const query = req.query;
  let mountpoint = _mountpoint;
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
  let mountpoint = _mountpoint;
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
      for (let i in result) {
        arr.push(result[i].username);
      }
      res.send(arr);
    });
  });
});

_app.post("/account/exist", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }
  const username = body.username;

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    _query.accountExist(connection, mountpoint, username, function (code) {
      connection.release();
      res.send(code == 0);
    });
  });
});

_app.post("/account/update/password", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  if (!_.isString(body.username) || !_.isString(body.password)) {
    res.sendStatus(400);
    return;
  }
  const username = body.username;
  const password = body.password;

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.updatePasswordAccount(
      connection,
      mountpoint,
      username,
      password,
      function (code) {
        connection.release();
        if (code == 0) {
          res.sendStatus(200);
        } else {
          res.status(500).json({ code });
        }
      }
    );
  });
});

_app.post("/account/delete", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }
  const username = body.username;

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.deleteAccount(connection, mountpoint, username, function (code) {
      connection.release();
      if (code == 0) {
        res.sendStatus(200);
      } else {
        res.status(500).json({ code });
      }
    });
  });
});

_app.post("/account/delete/group", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  if (!_.isString(body.group)) {
    res.sendStatus(400);
    return;
  }
  const group = body.group;

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.deleteAccountByGroup(connection, mountpoint, group, function (code) {
      connection.release();
      if (code == 0) {
        res.sendStatus(200);
      } else {
        res.status(500).json({ code });
      }
    });
  });
});

_app.post("/account/clear", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
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
        res.status(500).json({ code });
      }
    });
  });
});

_app.get("/su/list", (req, res) => {
  const query = req.query;
  let mountpoint = _mountpoint;
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
      for (let i in result) {
        arr.push(result[i].username);
      }
      res.send(arr);
    });
  });
});

_app.post("/su/create", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  if (!_.isString(body.username) || !_.isString(body.password)) {
    res.sendStatus(400);
    return;
  }
  const username = body.username;
  const password = body.password;

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.createSU(
      connection,
      mountpoint,
      username,
      password,
      function (code) {
        connection.release();
        if (code == 0) {
          res.sendStatus(200);
        } else {
          res.status(500).json({ code });
        }
      }
    );
  });
});

_app.get("/user/list", (req, res) => {
  const query = req.query;
  let mountpoint = _mountpoint;
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
      for (let i in result) {
        arr.push(result[i].username);
      }
      res.send(arr);
    });
  });
});

_app.post("/user/create", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

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
  const username = body.username;
  const group = body.group;
  const password = body.password;

  // Validate acls
  const publishAcl = _validation.validateAcl(body.publish_acl);
  const subscribeAcl = _validation.validateAcl(body.subscribe_acl);
  if (publishAcl == null || subscribeAcl == null) {
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
      username,
      group,
      password,
      publishAcl,
      subscribeAcl,
      function (code) {
        connection.release();
        if (code == 0) {
          res.sendStatus(200);
        } else {
          res.status(500).json({ code });
        }
      }
    );
  });
});

_app.post("/user/update/acl", (req, res) => {
  const body = req.body;
  let mountpoint = _mountpoint;
  if (_.isString(body.mountpoint)) {
    mountpoint = body.mountpoint;
  }

  if (!_.isString(body.username)) {
    res.sendStatus(400);
    return;
  }
  const username = body.username;

  // Validate acls
  const publishAcl = _validation.validateAcl(body.publish_acl);
  const subscribeAcl = _validation.validateAcl(body.subscribe_acl);

  _mysqlPool.getConnection((err, connection) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    _query.updateAclUser(
      connection,
      mountpoint,
      username,
      publishAcl,
      subscribeAcl,
      function (code) {
        connection.release();
        if (code == 0) {
          res.sendStatus(200);
        } else {
          res.status(500).json({ code });
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
