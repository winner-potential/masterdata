process.env.LDAP_PORT = 9001;
process.env.NODE_ENV = "test";
process.env.DATABASE = process.env.DATABASE || "mongodb://localhost/masterdata-test";
process.env.TSDB_URL = process.env.TSDB_URL || "http://localhost:2999";

const log = require("debug")("masterdata:test:utils:session");
log("Create session helper for tests");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../service");
const ldapServer = require("./ldap");
const tsdbServer = require("./tsdb");
const waitPort = require("wait-port");
chai.use(chaiHttp);

const Promise = require("promise");

const session = function(viewer) {
  var token;
  return new Promise((resolve, reject) => {
    waitPort({
      port: parseInt(process.env.LDAP_PORT || 9000),
      timeout: 10000,
      output: "silent"
    }).then(open => {
      waitPort({
        port: parseInt(process.env.PORT || 3000),
        timeout: 10000,
        output: "silent"
      }).then(open => {
        waitPort({
          port: parseInt(process.env.PORT || 2999),
          timeout: 10000,
          output: "silent"
        }).then(open => {
          chai
            .request(server)
            .post("/api/v1.0/authentificate")
            .send({
              username: viewer ? process.env.TEST_VIEWER : process.env.TEST_USER,
              password: process.env.TEST_PASS
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("token");
              token = res.body.token;
              resolve({
                chai: function() {
                  return chai.request(server);
                },
                get: function(path) {
                  return chai
                    .request(server)
                    .get(path)
                    .set("x-access-token", token);
                },
                put: function(path) {
                  return chai
                    .request(server)
                    .put(path)
                    .set("x-access-token", token);
                },
                post: function(path) {
                  return chai
                    .request(server)
                    .post(path)
                    .set("x-access-token", token);
                },
                delete: function(path) {
                  return chai
                    .request(server)
                    .delete(path)
                    .set("x-access-token", token);
                }
              });
            });
        });
      });
    });
  });
};

module.exports = session;
