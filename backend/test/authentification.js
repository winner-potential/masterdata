const chai = require("chai");
chai.should();

const session = require("./utils/session");
const server = require("../service");

describe("Authentification", () => {
  /*
  * Test the /GET route
  */
  describe("Authentificate", () => {
    it("it should work", done => {
      session().then(sess => {
        sess.chai()
          .post("/api/v1.0/authentificate")
          .send({
            username: process.env.TEST_USER,
            password: process.env.TEST_PASS
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("token");
            done();
          });
      });
    });
    it("it should fail authentification", done => {
      session().then(sess => {
        sess.chai()
          .post("/api/v1.0/authentificate")
          .send({
            username: "...",
            password: "..."
          })
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
    });
    it("it should fail GET all the tags", done => {
      session().then(sess => {
        sess.chai()
          .get("/api/v1.0/template/tag")
          .end((err, res) => {
            res.should.have.status(403);
            done();
          });
      });
    });
    it("it should fail GET all the tags with fake token", done => {
      session().then(sess => {
        sess.chai()
          .get("/api/v1.0/template/tag")
          .set("x-access-token", "xxx")
          .end((err, res) => {
            res.should.have.status(403);
            done();
          });
      });
    });
  });
});
