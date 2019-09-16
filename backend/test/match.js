// I'm really sorry for this test-mess!

let session = require("./utils/session");

//Require the dev-dependencies
let chai = require("chai");
chai.should();

let Document = require("../models/document");
let DocumentTemplate = require("../models/template/document");
let MetricTemplate = require("../models/template/metric");
let TagTemplate = require("../models/template/tag");

describe("Match and Resolve", () => {
  let tagTemplateId, metricTemplateId, documentTemplateId;
  let defaultObject01, defaultObject02, defaultObject03;
  let defaultObjectId01, defaultObjectId02, defaultObjectId03, defaultObjectMetricId01, defaultObjectRelationId02;
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
              (err, post) => {
                if (err) console.error(err);
                tagTemplateId = post._id;
                MetricTemplate.create(
                  {
                    name: "testmetric",
                    description: "something",
                    tags: [tagTemplateId]
                  },
                  (err, post) => {
                    if (err) console.error(err);
                    metricTemplateId = post._id;
                    DocumentTemplate.create(
                      {
                        name: "testdoc",
                        description: "something",
                        identifier: "name",
                        attributes: [{ name: "name", type: "string" }, { name: "foo", type: "link" }, { name: "bar", type: "string" }],
                        metrics: [metricTemplateId]
                      },
                      (err, post) => {
                        if (err) console.error(err);
                        documentTemplateId = post._id;
                        defaultObject01 = {
                          name: "test1",
                          description: "something1",
                          template: documentTemplateId,
                          attributes: [{ name: "name", value: "123" }],
                          metrics: [{ identifier: metricTemplateId, key: "foo", tags: [{ identifier: tagTemplateId, value: "01_bar_:name:" }] }]
                        };
                        Document.create(defaultObject01, (err, post) => {
                          defaultObjectId01 = post._id;
                          defaultObjectMetricId01 = post.metrics[0]._id;
                          defaultObject02 = {
                            name: "test2",
                            description: "something2",
                            template: documentTemplateId,
                            parent: defaultObjectId01,
                            attributes: [{ name: "name", value: "xyz" }, { name: "bar", value: "wuff" }],
                            metrics: [{ identifier: metricTemplateId, key: "foo", tags: [{ identifier: tagTemplateId, value: "02_bar_:name:_:parent.name:" }] }],
                            relations: [{ identifier: metricTemplateId, document: defaultObjectId01, link: defaultObjectMetricId01 }]
                          };

                          Document.create(defaultObject02, (err, post) => {
                            defaultObjectId02 = post._id;
                            defaultObjectRelationId02 = post.relations[0]._id
                            defaultObject03 = {
                              name: "test3",
                              description: "something3",
                              template: documentTemplateId,
                              attributes: [{ name: "name", value: "xyz" }, { name: "foo", value: defaultObjectId02 }, { name: "bar", value: "linker" }],
                              metrics: [{ identifier: metricTemplateId, key: "foo", tags: [{ identifier: tagTemplateId, value: "03_bar_:name:_:foo.bar:" }] }]
                            };
                            Document.create(defaultObject03, (err, post) => {
                              defaultObjectId03 = post._id;
                              done();
                            });
                          });
                        });
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

  describe("/GET matched documents", () => {
    it("it should matche all documents", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(3);
          done();
        });
      });
    });
    it("it should fail matching 01", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc[]").end((err, res) => {
          res.should.have.status(400);
          done();
        });
      });
    });
    it("it should fail matching 02", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc[").end((err, res) => {
          res.should.have.status(400);
          done();
        });
      });
    });
    it("it should fail matching 03", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc]").end((err, res) => {
          res.should.have.status(400);
          done();
        });
      });
    });
    it("it should match one document", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc[name=123]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property("name");
          res.body[0].should.have.property("description");
          res.body[0].name.should.be.eql("test1");
          res.body[0].description.should.be.eql("something1");
          done();
        });
      });
    });
    it("it should match one child document", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc[name=123]/testdoc[name=xyz]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property("name");
          res.body[0].should.have.property("description");
          res.body[0].name.should.be.eql("test2");
          res.body[0].description.should.be.eql("something2");
          done();
        });
      });
    });
    it("it should match two documents", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc[name=xyz]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(2);
          res.body[0].name.should.be.eql("test2");
          res.body[1].name.should.be.eql("test3");
          done();
        });
      });
    });
    it("it should match wildcard child documents", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc[name=123]/*").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].name.should.be.eql("test2");
          done();
        });
      });
    });
    it("it should match deep wildcard child documents", done => {
      session().then(sess => {
        sess.get("/api/v1.0/document/match/testdoc[name=123]/**").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].name.should.be.eql("test2");
          done();
        });
      });
    });
  });

  describe("/GET matched metric", () => {
    it("it should match one metric", done => {
      session().then(sess => {
        sess.get("/api/v1.0/metric/match/testdoc[name=123]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property("key");
          res.body[0].key.should.be.eql("foo");
          done();
        });
      });
    });
  });

  describe("/GET resolve metric", () => {
    it("it should match one metric", done => {
      session().then(sess => {
        sess.get("/api/v1.0/metric/resolve/testdoc[name=123]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property("key");
          res.body[0].should.have.property("name");
          res.body[0].key.should.be.eql("foo");
          res.body[0].name.should.be.eql("testmetric");
          res.body[0].tags.should.be.a("array");
          res.body[0].tags.length.should.be.eql(2); // there is a relation added
          res.body[0].tags[0].name.should.be.eql("test");
          res.body[0].tags[0].value.should.be.eql("01_bar_123");
          done();
        });
      });
    });
    it("it should match one metric with parent", done => {
      session().then(sess => {
        sess.get("/api/v1.0/metric/resolve/testdoc[name=123]/testdoc[name=xyz]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].tags.should.be.a("array");
          res.body[0].tags.length.should.be.eql(1);
          res.body[0].tags[0].name.should.be.eql("test");
          res.body[0].tags[0].value.should.be.eql("02_bar_xyz_123");
          done();
        });
      });
    });
    it("it should match two metric", done => {
      session().then(sess => {
        sess.get("/api/v1.0/metric/resolve/testdoc[name=xyz]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(2);
          res.body[0].tags.should.be.a("array");
          res.body[0].tags.length.should.be.eql(1);
          res.body[0].tags[0].name.should.be.eql("test");
          res.body[0].tags[0].value.should.be.eql("02_bar_xyz_123");
          done();
        });
      });
    });
    it("it should match one metric and have relation", done => {
      session().then(sess => {
        sess.get("/api/v1.0/metric/resolve/testdoc[name=123]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].tags.should.be.a("array");
          res.body[0].tags.length.should.be.eql(2); // one tag in addition to relation tag
          res.body[0].tags[0].name.should.be.eql("test");
          res.body[0].tags[0].value.should.be.eql("01_bar_123");
          res.body[0].tags[1].name.should.be.eql("relation");
          res.body[0].tags[1].value.should.be.eql(defaultObjectRelationId02.toString());
          done();
        });
      });
    });
    it("it should match one metric and have link selector", done => {
      session().then(sess => {
        sess.get("/api/v1.0/metric/resolve/testdoc[bar=linker]").end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          res.body[0].tags.should.be.a("array");
          res.body[0].tags.length.should.be.eql(1); // one tag in addition to relation tag
          res.body[0].tags[0].name.should.be.eql("test");
          res.body[0].tags[0].value.should.be.eql("03_bar_xyz_wuff");
          done();
        });
      });
    });
  });
});
