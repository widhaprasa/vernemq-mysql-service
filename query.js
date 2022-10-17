var _ = require("underscore");
var crypto = require("crypto");

// Env
var _table = !_.isEmpty(process.env.MYSQL_DEFAULT_TABLE)
  ? process.env.MYSQL_DEFAULT_TABLE
  : "vmq_auth_acl";

// SHA256
function buildSha256(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Count Account
function countAccount(mysqlConnection, mountpoint, callback) {
  const searchSql = `SELECT count(username) FROM ${_table} WHERE mountpoint = '${mountpoint}'`;
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback(0);
      return;
    }
    callback(result[0]["count(username)"]);
  });
}

// Account Exist
function accountExist(mysqlConnection, mountpoint, username, callback) {
  username = username.trim();
  const searchSql = `SELECT mountpoint, username, FROM ${_table} WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(result.length > 0 ? 0 : -2);
  });
}

// Update Password Account
function updatePasswordAccount(
  mysqlConnection,
  mountpoint,
  username,
  password,
  callback
) {
  username = username.trim();
  password = password.trim();

  const sha256 = buildSha256(password);
  const updateSql = `UPDATE ${_table} SET password = '${sha256}' WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;

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
function deleteAccount(mysqlConnection, mountpoint, username, callback) {
  username = username.trim();

  const deleteSql = `DELETE FROM ${_table} WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;
  mysqlConnection.query(deleteSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(0);
  });
}

// Delete Account by group
function deleteAccountByGroup(mysqlConnection, mountpoint, group, callback) {
  group = group.trim();

  const deleteSql = `DELETE FROM $table WHERE mountpoint = '${mountpoint}' AND group_ = '${group}'`;
  mysqlConnection.query(deleteSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(0);
  });
}

// Clear Account
function clearAccount(mysqlConnection, mountpoint, callback) {
  const deleteSql = `DELETE FROM ${_table} WHERE mountpoint = '${mountpoint}'`;
  mysqlConnection.query(deleteSql, function (err, result) {
    if (err) {
      callback(-1);
      return;
    }
    callback(0);
  });
}

// List Super User
function listSU(mysqlConnection, mountpoint, callback) {
  const searchSql = `SELECT username FROM ${_table} WHERE mountpoint = '${mountpoint}' AND group_ = 'su'`;
  mysqlConnection.query(searchSql, function (err, result) {
    if (err) {
      callback([]);
      return;
    }
    callback(result);
  });
}

// Create Super User
function createSU(mysqlConnection, mountpoint, username, password, callback) {
  username = username.trim();
  password = password.trim();

  const searchSql = `SELECT * FROM ${_table} WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;
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
      `INSERT INTO ${_table} (mountpoint, group_, username, password, publish_acl, subscribe_acl) ` +
      `VALUES ('${mountpoint}', 'su', '${username}', '${sha256}', '[{"pattern":"#"}]', '[{"pattern":"#"}]')`;

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
  mountpoint,
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

  const searchSql = `SELECT * FROM ${_table} WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;
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
    const s_publish_acl = JSON.stringify(publish_acl);
    const s_subscribe_acl = JSON.stringify(subscribe_acl);
    const insertSql =
      `INSERT INTO ${_table} (mountpoint, group_, username, password, publish_acl, subscribe_acl) ` +
      `VALUES ('${mountpoint}', '${group}', '${username}', '${sha256}', '${s_publish_acl}', '${s_subscribe_acl}')`;

    mysqlConnection.query(insertSql, function (err, result) {
      if (err) {
        callback(-3);
        return;
      }
      callback(0);
    });
  });
}

// Update Acl User
function updateAclUser(
  mysqlConnection,
  mountpoint,
  username,
  publish_acl,
  subscribe_acl,
  callback
) {
  username = username.trim();

  var updateSql;
  if (!_.isEmpty(publish_acl) && !_.isEmpty(subscribe_acl)) {
    const s_publish_acl = JSON.stringify(publish_acl);
    const s_subscribe_acl = JSON.stringify(subscribe_acl);
    updateSql = `UPDATE ${_table} SET publish_acl = '${s_publish_acl}', subscribe_acl = '${s_subscribe_acl}' WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;
  } else if (!_.isEmpty(publish_acl)) {
    const s_publish_acl = JSON.stringify(publish_acl);
    updateSql = `UPDATE ${_table} SET publish_acl = '${s_publish_acl}' WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;
  } else if (!_.isEmpty(subscribe_acl)) {
    const s_subscribe_acl = JSON.stringify(subscribe_acl);
    updateSql = `UPDATE ${_table} SET subscribe_acl = '${s_subscribe_acl}' WHERE mountpoint = '${mountpoint}' AND username = '${username}'`;
  } else {
    callback(-3);
    return;
  }

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

module.exports = {
  countAccount,
  accountExist,
  updatePasswordAccount,
  deleteAccount,
  deleteAccountByGroup,
  clearAccount,
  listSU,
  createSU,
  createUser,
  updateAclUser,
};