let session = require('./utils/session')

//Require the dev-dependencies
let chai = require("chai");
chai.should();

let TagTemplate = require("../models/template/tag");


describe("Tag Templates", () => {
  var defaultObject = {
    name: "test",
    description: "something"
  };
  beforeEach(done => {
    TagTemplate.remove({}, err => {
      done();
    });
  });

  /*
  * Test the /GET route
  */
  describe("/GET tags", () => {
    it("it should GET all the tags", done => {
      session()
        .then(sess => {
          sess.get("/api/v1.0/template/tag").end((err, res) => {
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
    it("it should fail GET non existing tag", done => {
      session()
        .then(sess => {
          sess.get("/api/v1.0/template/tag/5b48a8951c1e49438352cc35").end((err, res) => {
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
  describe("/POST tag", () => {
    it("it should POST one tag", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("name");
              res.body.name.should.be.eql("test");
              res.body.should.have.property("description");
              res.body.description.should.be.eql("something");
              res.body.should.have.property("_id");
              done();
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail POST empty tag", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/tag")
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
    it("it should POST one tag and find this with /", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.get("/api/v1.0/template/tag").end((err, res) => {
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
    it("it should POST one tag and find this with /:id", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.get(`/api/v1.0/template/tag/${res.body._id}`).end((err, res) => {
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
  describe("/PUT tag", () => {
    it("it should fail PUT non existing tag", done => {
      session()
        .then(sess => {
          sess
            .put("/api/v1.0/template/tag/5b48a8951c1e49438352cc35")
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
    it("it should POST and PUT one the tag", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/template/tag/${res.body._id}`)
                .send({
                  name: "test2",
                  description: "something2"
                })
                .end((err, res) => {
                  res.should.have.status(200);
                  sess.get(`/api/v1.0/template/tag/${res.body._id}`).end((err, res) => {
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
    it("it should fail POST and PUT with empty tag", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/template/tag/${res.body._id}`)
                .send({})
                .end((err, res) => {
                  res.should.have.status(400);
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
  * Test the /DELETE route
  */
  describe("/DELETE tag", () => {
    it("it should fail DELETE non existing tag", done => {
      session()
        .then(sess => {
          sess
            .delete("/api/v1.0/template/tag/5b48a8951c1e49438352cc35")
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
    it("it should POST and DELETE one tag", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .delete(`/api/v1.0/template/tag/${res.body._id}`)
                .end((err, res) => {
                  res.should.have.status(200);
                  sess.get(`/api/v1.0/template/tag/${res.body._id}`).end((err, res) => {
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
          sess
            .delete("/api/v1.0/template/tag/5b48a8951c1e49438352cc35")
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
    it("it should fail PUT", done => {
      session(true)
        .then(sess => {
          sess
            .put("/api/v1.0/template/tag/5b48a8951c1e49438352cc35")
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
            .post("/api/v1.0/template/tag")
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
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              session(true)
                .then(sess => {
                  sess.get("/api/v1.0/template/tag/").end((err, res) => {
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
            .post("/api/v1.0/template/tag")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              session(true)
                .then(sess => {
                  sess.get("/api/v1.0/template/tag/" + res.body._id).end((err, res) => {
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
