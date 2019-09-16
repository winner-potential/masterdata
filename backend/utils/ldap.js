var ldap = require("ldapjs");
const log = require("debug")("masterdata:utils:ldap");
var connect = function(config) {
  var bind = function(dn, password) {
    return new Promise(function(resolve, reject) {
      if(!client) {
        reject("Client not connected")
        return;
      }
      client.bind(dn, password, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  log("Connect to ldap backend: %o", config.url)
  var client;
  try {
    client = ldap.createClient({
      url: config.url
    }).on('error', function(error) {
      log("Error while connecting to ldap: %o", error);
      client = undefined;
    });
  } catch (e) {
    log("Error while connecting to ldap: %o", e.message);
  }

  return {
    bind: bind,
    close: function() {
      if(client) {
        client.destroy();
      }
    },
    search: function(attributes, filter, base) {
      if(!client) {
        reject("Client not connected")
        return;
      }
      var opts = {
        scope: "sub",
        attributes: attributes || []
      };

      // Add filter if exists
      if (filter) {
        opts.filter = filter;
      }

      return new Promise(function(resolve, reject) {
        var list = [];
        client.search(base, opts, function(err, res) {
          res.on("searchEntry", function(entry) {
            if (entry.object.dn != base) {
              var element = {};
              element.dn = entry.object.dn;
              for (var k in opts.attributes) {
                element[opts.attributes[k]] = entry.object[opts.attributes[k]];
              }
              if (Object.keys(element).length != 0) {
                list.push(element);
              }
            }
          });
          res.on("error", function(err) {
            reject(err);
          });
          res.on("end", function(result) {
            resolve(list);
          });
        });
      });
    }
  };
};
module.exports = connect;
