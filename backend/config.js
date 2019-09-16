const client = require("cloud-config-client");
const parser = require("properties-to-object");
const log = require("debug")("masterdata:config");

const Promise = require("promise");

var config = undefined;

var defaultConfig = function() {
  config = {
    ldap: {
      url: process.env.LDAP_URL || "ldap://127.0.0.1:" + (process.env.LDAP_PORT || 9000),
      dn: process.env.LDAP_DN || "uid=:username:,ou=people,dc=example,dc=com",
      group: {
        filter: process.env.LDAP_GROUP_FILTER || "(memberuid=:username:)",
        base: process.env.LDAP_GROUP_BASE || "ou=groups,dc=example,dc=com",
        admins: (process.env.LDAP_GROUP_ADMINS || "").replace(/\s/g, "").split(",")
      }
    },
    development: process.env.PROFILE == "dev",
    tsdb: {
      url: process.env.TSDB_URL,
      username: process.env.TSDB_USERNAME,
      password: process.env.TSDB_PASSWORD
    },
    secret: process.env.SECRET || "SOME-REALLY-GOOD-SECRET",
    images: {
      folder: process.env.IMG_FOLDER || "./img"
    }
  };
};

var loading; // current loading process

var loader = () => { // start new loading
  loading = load();
};

var load = () => { // do load
  return new Promise(function(resolve, reject) {
    if (process.env.CONFIG_HOST && process.env.NODE_ENV != "test") {
      log("Load configuration from %o with profile %o", process.env.CONFIG_HOST, process.env.PROFILE || "dev");
      client
        .load({
          endpoint: process.env.CONFIG_HOST,
          auth: {
            user: process.env.CONFIG_USER || "root",
            pass: process.env.CONFIG_PASS || "s3cr3t"
          },
          profiles: process.env.PROFILE || "dev",
          application: process.env.APPLICATION || "service.masterdata"
        })
        .then(c => {
          log("Configuration loaded successfully");
          var a = {};
          c.forEach((k, v) => {
            a[k] = v;
          });
          config = parser(a);
          resolve(config);
          setTimeout(loader, 60000 * 15);
        })
        .catch(error => {
          log("Error while loading configuration, redo in 5000ms", error.message);
          reject();
          setTimeout(loader, 5000);
        });
    } else {
      log("Running with default configuration");
      defaultConfig();
      resolve(config);
    }
  });
};

loader(); // initial loading

module.exports = function() {
  return new Promise(function(resolve, reject) {
    if (config) {
      resolve(config);
      return;
    }
    loading.then(resolve).catch(reject);
  });
};
