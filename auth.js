// Underscore
var _ = require("underscore");
var crypto = require("crypto");

// SHA256
function buildSha256(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Count Account
function countAccount(mysqlConnection, callback) {
  const searchSql = "SELECT count(username) FROM vmq_auth_acl";
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback(0);
      return;
    }
    callback(result[0]["count(username)"]);
  });
}

// Account Exist
function accountExist(mysqlConnection, username, callback) {
  const searchSql =
    "SELECT username, group_ FROM vmq_auth_acl WHERE username = '" +
    username +
    "'";
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(result.length > 0 ? 0 : -2);
  });
}

// Change Password Account
function changePasswordAccount(mysqlConnection, username, password, callback) {
  username = username.trim();
  password = password.trim();

  const sha256 = buildSha256(password);
  const updateSql =
    "UPDATE vmq_auth_acl SET password = '" +
    sha256 +
    "' WHERE username = '" +
    username +
    "'";

  mysqlConnection.query(updateSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }

    if (result.affectedRows != 1) {
      callback(-2);
      return;
    }

    callback(0);
  });
}

// Delete Account
function deleteAccount(mysqlConnection, username, callback) {
  username = username.trim();

  const deleteSql =
    "DELETE FROM vmq_auth_acl WHERE username = '" + username + "'";
  mysqlConnection.query(deleteSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(0);
  });
}

// Delete Account by group
function deleteAccountByGroup(mysqlConnection, group, callback) {
  group = group.trim();

  const deleteSql = "DELETE FROM vmq_auth_acl WHERE group_ = '" + group + "'";
  mysqlConnection.query(deleteSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(0);
  });
}

// Clear Account
function clearAccount(mysqlConnection, callback) {
  const deleteSql = "DELETE FROM vmq_auth_acl";
  mysqlConnection.query(deleteSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(0);
  });
}

// List Super User
function listSU(mysqlConnection, callback) {
  const searchSql = "SELECT username FROM vmq_auth_acl WHERE group_ = 'su'";
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback([]);
      return;
    }
    callback(result);
  });
}

// Create Super User
function createSU(mysqlConnection, username, password, callback) {
  username = username.trim();
  password = password.trim();

  const searchSql =
    "SELECT * FROM vmq_auth_acl WHERE username = '" + username + "'";
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }

    if (result.length != 0) {
      callback(-2);
      return;
    }

    const sha256 = buildSha256(password);
    const insertSql =
      "INSERT INTO vmq_auth_acl (mountpoint, group_, username, password, publish_acl, subscribe_acl) " +
      "VALUES ('" +
      username +
      "', 'su', '" +
      username +
      "', '" +
      sha256 +
      "', " +
      '\'[{"pattern":"#"}]\', ' +
      '\'[{"pattern":"#"}]\')';

    mysqlConnection.query(insertSql, function (err, result) {
      if (err) {
        callback(-3);
        return;
      }

      callback(0);
    });
  });
}

// Create User
function createUser(
  mysqlConnection,
  username,
  group,
  password,
  publish_acl,
  subscribe_acl,
  callback
) {
  username = username.trim();
  group = group.trim();
  password = password.trim();

  const searchSql =
    "SELECT * FROM vmq_auth_acl WHERE username = '" + username + "'";
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }

    if (result.length != 0) {
      callback(-2);
      return;
    }

    const publish_acl_saves = [];
    for (let i in publish_acl) {
      publish_acl_saves.push({ pattern: publish_acl[i] });
    }

    const subscribe_acl_saves = [];
    for (let i in subscribe_acl) {
      subscribe_acl_saves.push({ pattern: subscribe_acl[i] });
    }

    const sha256 = buildSha256(password);
    const insertSql =
      "INSERT INTO vmq_auth_acl (mountpoint, group_, username, password, publish_acl, subscribe_acl) " +
      "VALUES ('" +
      username +
      "', '" +
      group +
      "', '" +
      username +
      "', '" +
      sha256 +
      "', '" +
      JSON.stringify(publish_acl_saves) +
      "', '" +
      JSON.stringify(subscribe_acl_saves) +
      "')";

    mysqlConnection.query(insertSql, function (err, result) {
      if (err) {
        callback(-3);
        return;
      }
      callback(0);
    });
  });
}

module.exports = {
  countAccount,
  accountExist,
  changePasswordAccount,
  deleteAccount,
  deleteAccountByGroup,
  clearAccount,
  listSU,
  createSU,
  createUser,
};
