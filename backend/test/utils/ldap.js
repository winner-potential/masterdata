// This is a simple LDAP Server implementation for test cases

process.env.TEST_USER = "admini";
process.env.TEST_PASS = "passworti";
process.env.TEST_VIEWER = "looki";

const ldap = require("ldapjs");
const configLoader = require("../../config.js");
const server = ldap.createServer();
const log = require("debug")("masterdata:test:utils:ldap");

log("Start LDAP server");
configLoader()
  .then(cnf => {
    var testUser = cnf.ldap.dn.replace(":username:", process.env.TEST_USER);
    var testViewer = cnf.ldap.dn.replace(":username:", process.env.TEST_VIEWER);
    var bindBase = cnf.ldap.dn;
    var parts = bindBase.substr(bindBase.indexOf(":username:")).split(",");
    parts.splice(0, 1);
    bindBase = parts.join(",");
    server.bind(bindBase, (req, res, next) => {
      var dn = req.dn.toString().replace(/ /g, "");
      var pw = req.credentials;
      if (dn == testUser || dn == testViewer) {
        if (pw == process.env.TEST_PASS) {
          res.end();
          return;
        }
      }
      next(new ldap.LDAPError());
    });

    server.search(cnf.ldap.group.base, (req, res, next) => {
      var filter = req.filter.toString();
      if (filter == cnf.ldap.group.filter.replace(":username:", process.env.TEST_USER)) {
        res.send({
          dn: cnf.ldap.group.base,
          attributes: {
            cn: cnf.ldap.group.admins
          }
        });
      }
      res.end();
    });

    server.listen(process.env.LDAP_PORT || 9000, "127.0.0.1", function() {
      log("LDAP server listening at: %o", server.url);
    });
  })
  .catch(err => {
    log("Error while config ldap: %o", err);
  });

module.exports = server;
