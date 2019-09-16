const express = require("express");
const router = express.Router();
const ldap = require("../utils/ldap.js");
const configLoader = require("../config.js");
const jwt = require("jsonwebtoken");
const log = require("debug")("masterdata:authentification");

// Add new entry
router.post("/", function(req, res, next) {
  var admins = {};
  configLoader()
    .then(config => {
      if (config.ldap && config.ldap.group) {
        try {
          (config.ldap.group.admins || []).forEach(group => {
            admins[group] = true;
          });
        } catch (e) {
          log("Error while reading admin list %o", e);
        }
      }
      if (config.development) {
        var token = jwt.sign(
          {
            username: req.body.username,
            admin: true
          },
          config.secret,
          { expiresIn: 60 * 60 }
        );
        res.json({ success: true, token: token });
        return;
      }
      if (!config.ldap) {
        res.status(500).json({ message: "LDAP backend isn't configurated" });
        return;
      }
      var dn = (config.ldap.dn || "dc=unknown").replace(":username:", req.body.username);
      var conn = ldap({
        url: config.ldap.url
      });
      conn
        .bind(dn, req.body.password)
        .then(result => {
          var tokenData = {
            username: req.body.username,
            admin: false
          };
          var submit = function() {
            var token = jwt.sign(tokenData, config.secret, { expiresIn: 60 * 60 });
            res.json({ success: true, token: token });
            conn.close();
          };
          if (config.ldap.group) {
            conn
              .search(["cn"], (config.ldap.group.filter || "").replace(":username:", req.body.username), config.ldap.group.base)
              .then(res => {
                res.forEach(entry => {
                  if (admins[entry.cn]) {
                    tokenData.admin = true;
                  }
                });
                submit();
              })
              .catch(err => {
                log("Error while fetching groups %o", err);
                submit();
              });
          } else {
            submit();
          }
        })
        .catch(error => {
          log("Error while authentification for %o: %o", req.body.username, error.message);
          res.status(400).json({ message: "failed authentification" });
          conn.close();
        });
    })
    .catch(err => {
      log("Error while loading configuration: %o", err);
    });
});

module.exports = router;
