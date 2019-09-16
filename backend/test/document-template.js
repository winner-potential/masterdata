//Require the dev-dependencies
let chai = require("chai");
chai.should();

let session = require("./utils/session");

let DocumentTemplate = require("../models/template/document");

describe("Document Templates", () => {
  var defaultObject = {
    name: "test",
    description: "something",
    identifier: "key1",
    attributes: [{ name: "key1", type: "string" }]
  };
  beforeEach(done => {
    DocumentTemplate.remove({}, err => {
      done();
    });
  });

  /*
  * Test the /GET route
  */
  describe("/GET documents", () => {
    it("it should GET all the documents", done => {
      session()
        .then(sess => {
          sess.get("/api/v1.0/template/document").end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eql(0);
            done();
          });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail GET non existing document", done => {
      session()
        .then(sess => {
          sess.get("/api/v1.0/template/document/5b48a8951c1e49438352cc35").end((err, res) => {
            res.should.have.status(404);
            done();
          });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
  });

  /*
  * Test the /POST route
  */
  describe("/POST document", () => {
    it("it should POST one document", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("name");
              res.body.name.should.be.eql("test");
              res.body.should.have.property("description");
              res.body.description.should.be.eql("something");
              res.body.should.have.property("identifier");
              res.body.identifier.should.be.eql("key1");
              res.body.attributes.should.be.a("array");
              res.body.attributes.length.should.be.eql(1);
              res.body.should.have.property("description");
              res.body.attributes[0].name.should.be.eql("key1");
              res.body.attributes[0].type.should.be.eql("string");
              res.body.should.have.property("_id");
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail POST with empty document", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send({})
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail POST with name", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send({
              name: "test"
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail POST with name and identifier", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send({
              name: "test",
              identifier: "xxx"
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail POST with name, identifier and bad attributes", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send({
              name: "test",
              identifier: "xxx",
              attributes: [{ name: "xxx" }]
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail POST with unknown identifier", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send({
              name: "test",
              identifier: "yyy",
              attributes: [{ name: "xxx", type: "string" }]
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should POST with parent identifier", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              sess
                .post("/api/v1.0/template/document")
                .send({
                  name: "test2",
                  extends: res.body._id,
                  identifier: defaultObject.attributes[0].name,
                  attributes: [{ name: defaultObject.attributes[0].name + "foo", type: "string" }]
                })
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a("object");
                  res.body.should.have.property("name");
                  res.body.name.should.be.eql("test2");
                  done();
                });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should POST one document and find this with /", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.get("/api/v1.0/template/document").end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("array");
                res.body.length.should.be.eql(1);
                res.body[0].should.have.property("name");
                res.body[0].should.have.property("description");
                res.body[0].name.should.be.eql("test");
                res.body[0].description.should.be.eql("something");
                done();
              });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should POST one document and find this with /:id", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.get(`/api/v1.0/template/document/${res.body._id}`).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("name");
                res.body.should.have.property("description");
                res.body.name.should.be.eql("test");
                res.body.description.should.be.eql("something");
                done();
              });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
  });

  /*
  * Test the /PUT route
  */
  describe("/PUT document", () => {
    it("it should fail PUT non existing document", done => {
      session()
        .then(sess => {
          sess
            .put("/api/v1.0/template/document/5b48a8951c1e49438352cc35")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should POST and PUT one the document", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/template/document/${res.body._id}`)
                .send({
                  name: "test2",
                  description: "something2",
                  identifier: "key1",
                  attributes: [{ name: "key1", type: "string" }]
                })
                .end((err, res) => {
                  res.should.have.status(200);
                  sess.get(`/api/v1.0/template/document/${res.body._id}`).end((err, res) => {
                    res.body.should.be.a("object");
                    res.body.should.have.property("name");
                    res.body.should.have.property("description");
                    res.body.should.have.property("_id");
                    res.body.name.should.be.eql("test2");
                    res.body.description.should.be.eql("something2");
                    done();
                  });
                });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
  });

  /*
  * Test the /DELETE route
  */
  describe("/DELETE document", () => {
    it("it should fail DELETE non existing document", done => {
      session()
        .then(sess => {
          sess.delete("/api/v1.0/template/document/5b48a8951c1e49438352cc35").end((err, res) => {
            res.should.have.status(404);
            done();
          });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should POST and DELETE one document", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.delete(`/api/v1.0/template/document/${res.body._id}`).end((err, res) => {
                res.should.have.status(200);
                sess.get(`/api/v1.0/template/document/${res.body._id}`).end((err, res) => {
                  res.should.have.status(404);
                  done();
                });
              });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
  });

  /*
  * Test the /DELETE route
  */
  describe("/DELETE, /PUT and /POST should not allowed for Viewer", () => {
    it("it should fail DELETE", done => {
      session(true)
        .then(sess => {
          sess.delete("/api/v1.0/template/document/5b48a8951c1e49438352cc35").end((err, res) => {
            res.should.have.status(403);
            done();
          });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail PUT", done => {
      session(true)
        .then(sess => {
          sess
            .put("/api/v1.0/template/document/5b48a8951c1e49438352cc35")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(403);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail POST", done => {
      session(true)
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(403);
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should GET list", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              session(true)
                .then(sess => {
                  sess.get("/api/v1.0/template/document/").end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property("name");
                    res.body[0].should.have.property("description");
                    res.body[0].should.have.property("_id");
                    res.body[0].name.should.be.eql(defaultObject.name);
                    res.body[0].description.should.be.eql(defaultObject.description);
                    done();
                  });
                })
                .catch(err => {
                  console.error(err);
                  done();
                });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should GET entry", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              session(true)
                .then(sess => {
                  sess.get("/api/v1.0/template/document/" + res.body._id).end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("name");
                    res.body.should.have.property("description");
                    res.body.should.have.property("_id");
                    res.body.name.should.be.eql(defaultObject.name);
                    res.body.description.should.be.eql(defaultObject.description);
                    done();
                  });
                })
                .catch(err => {
                  console.error(err);
                  done();
                });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
  });
});
