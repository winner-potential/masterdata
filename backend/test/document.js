//Require the dev-dependencies
let chai = require("chai");
chai.should();

let session = require("./utils/session");

let Document = require("../models/document");
let DocumentTemplate = require("../models/template/document");
let MetricTemplate = require("../models/template/metric");
let TagTemplate = require("../models/template/tag");

describe("Documents", () => {
  let tagTemplateId, metricTemplateId, documentTemplateId;
  let defaultObject;
  beforeEach(done => {
    TagTemplate.remove({}, err => {
      DocumentTemplate.remove({}, err => {
        MetricTemplate.remove({}, err => {
          Document.remove({}, err => {
            if (err) console.error(err);
            TagTemplate.create(
              {
                name: "test",
                description: "something"
              },
              function(err, post) {
                if (err) console.error(err);
                tagTemplateId = post._id;
                MetricTemplate.create(
                  {
                    name: "test",
                    description: "something",
                    tags: [tagTemplateId]
                  },
                  function(err, post) {
                    if (err) console.error(err);
                    metricTemplateId = post._id;
                    DocumentTemplate.create(
                      {
                        name: "test",
                        description: "something",
                        identifier: "id",
                        attributes: [{ name: "id", type: "string" }],
                        metrics: [metricTemplateId]
                      },
                      function(err, post) {
                        if (err) console.error(err);
                        documentTemplateId = post._id;
                        defaultObject = {
                          name: "test",
                          description: "something",
                          template: documentTemplateId,
                          attributes: [{ name: "id", value: "123" }],
                          metrics: [{ identifier: metricTemplateId, key: "foo", tags: [{ identifier: tagTemplateId, value: "bar" }] }]
                        };
                        done();
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    });
  });

  /*
  * Test the /GET route
  */
  describe("/GET documents", () => {
    it("it should GET all the documents", done => {
      session()
        .then(sess => {
          sess.get("/api/v1.0/document").end((err, res) => {
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
          sess.get("/api/v1.0/document/5b48a8951c1e49438352cc35").end((err, res) => {
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
            .post("/api/v1.0/document")
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
    it("it should fail POST with empty document", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
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
            .post("/api/v1.0/document")
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
    it("it should POST one document and find this with /", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.get("/api/v1.0/document").end((err, res) => {
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
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.get(`/api/v1.0/document/${res.body._id}`).end((err, res) => {
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
    it("it should POST two document and find this with /childs/:id", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              var id = res.body._id;
              var child = {
                name: defaultObject.name + "X",
                parent: id,
                template: defaultObject.template,
                attributes: defaultObject.attributes,
                metrics: defaultObject.metrics
              };
              sess
                .post("/api/v1.0/document/")
                .send(child)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a("object");
                  res.body.should.have.property("name");
                  res.body.name.should.be.eql("testX");
                  sess.get("/api/v1.0/document/childs/" + id).end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);
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
    it("it should POST document and find this with /find-with-metric-template/:metric/:search", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              var child = {
                name: defaultObject.name + "X",
                template: defaultObject.template,
                attributes: defaultObject.attributes,
                metrics: [] // without metrics!
              };
              sess
                .post("/api/v1.0/document/")
                .send(child)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a("object");
                  res.body.should.have.property("name");
                  res.body.name.should.be.eql("testX");
                  sess.get("/api/v1.0/document/find-with-metric-template/" + defaultObject.metrics[0].identifier + "/Te").end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);
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
    it("it should POST two document and find one", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              var id = res.body._id;
              var child = {
                name: defaultObject.name + "X",
                parent: id,
                template: defaultObject.template,
                attributes: defaultObject.attributes,
                metrics: defaultObject.metrics
              };
              sess
                .post("/api/v1.0/document/")
                .send(child)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a("object");
                  res.body.should.have.property("name");
                  res.body.name.should.be.eql("testX");
                  sess.get("/api/v1.0/document/find/X").end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);
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
  * Test the /PUT route
  */
  describe("/PUT document", () => {
    it("it should fail PUT non existing document", done => {
      session()
        .then(sess => {
          sess
            .put("/api/v1.0/document/5b48a8951c1e49438352cc35")
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
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/document/${res.body._id}`)
                .send(defaultObject)
                .end((err, res) => {
                  res.should.have.status(200);
                  sess.get(`/api/v1.0/document/${res.body._id}`).end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("name");
                    res.body.should.have.property("description");
                    res.body.should.have.property("_id");
                    res.body.name.should.be.eql("test");
                    res.body.description.should.be.eql("something");
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
          sess.delete("/api/v1.0/document/5b48a8951c1e49438352cc35").end((err, res) => {
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
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess.delete(`/api/v1.0/document/${res.body._id}`).end((err, res) => {
                res.should.have.status(200);
                sess.get(`/api/v1.0/document/${res.body._id}`).end((err, res) => {
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

  describe("Test for Viewer", () => {
    it("it should fail DELETE", done => {
      session(true)
        .then(sess => {
          sess.delete("/api/v1.0/document/5b48a8951c1e49438352cc35").end((err, res) => {
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
            .put("/api/v1.0/document/5b48a8951c1e49438352cc35")
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
            .post("/api/v1.0/document")
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
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              session(true)
                .then(sess => {
                  sess.get("/api/v1.0/document/").end((err, res) => {
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
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              session(true)
                .then(sess => {
                  sess.get("/api/v1.0/document/" + res.body._id).end((err, res) => {
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
