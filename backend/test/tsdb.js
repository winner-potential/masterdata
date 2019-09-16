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
  let defaultObject01, defaultObject02;
  let defaultObject01Id, defaultObject02Id, defaultObject01MetricId, defaultObject02RelationId;
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
                          defaultObject01Id = post._id;
                          defaultObject01MetricId = post.metrics[0]._id;
                          defaultObject02 = {
                            name: "test2",
                            description: "something2",
                            template: documentTemplateId,
                            attributes: [{ name: "name", value: "123" }],
                            relations: [{ identifier: metricTemplateId, document: defaultObject01Id, link: defaultObject01MetricId }]
                          };
                          Document.create(defaultObject02, (err, post) => {
                            defaultObject02Id = post._id;
                            defaultObject02RelationId = post.relations[0]._id;
                            done();
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

  describe("/POST query metric", () => {
    it("it should match a metric", done => {
      session().then(sess => {
        sess.post("/api/v1.0/tsdb/query/metric/" + defaultObject01MetricId).send({}).end((err, res) => {
          res.should.have.status(200);
          done();
        });
      });
    });
  });

  describe("/POST query relation", () => {
    it("it should match a relation", done => {
      session().then(sess => {
        sess.post("/api/v1.0/tsdb/query/relation/" + defaultObject02RelationId).send({}).end((err, res) => {
          res.should.have.status(200);
          done();
        });
      });
    });
  });
});
