var _ = require("underscore");

function validateAcl(input) {
  if (!_.isArray(input)) {
    return null;
  }

  const result = [];
  for (let i in input) {
    const acl = input[i];
    if (_.isString(acl)) {
      result.push({ pattern: acl });
    } else if (_.isObject(acl)) {
      for (let key in acl) {
        if ("pattern" === key) {
          const val = acl[key];
          if (!_.isString(val)) {
            return null;
          }
        } else if ("max_qos" === key) {
          const val = acl[key];
          if (val != 0 && val != 1 && val != 2) {
            return null;
          }
        } else if ("max_payload_size" === key) {
          const val = acl[key];
          if (!Number.isInteger(val) || val <= 0) {
            return null;
          }
        } else if ("allowed_retain" === key) {
          const val = acl[key];
          if (!_.isBoolean(val)) {
            return null;
          }
        } else {
          return null;
        }
      }
      result.push(acl);
    }
  }

  return result;
}

module.exports = {
  validateAcl,
};
