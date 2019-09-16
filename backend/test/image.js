let session = require("./utils/session");

//Require the dev-dependencies
let log = require("debug")("masterdata:test:image");
let configLoader = require("../config.js");
let fs = require("fs-extra");
let chai = require("chai");
chai.should();

let Document = require("../models/document");
let DocumentTemplate = require("../models/template/document");
let MetricTemplate = require("../models/template/metric");
let TagTemplate = require("../models/template/tag");

let img =
  "data:image/gif;base64,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";
let img2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+Gkqr6gAAAYNpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAACiRdZHfK4NRGMc/hubHhCguXCyNK2OoxY2ypVFLmim/brbXu01t8/a+W5Jb5XZFiRu/LvgLuFWulSJScuHKNXHDej2vqS3Zc3rO8znfc56nc54DtnBSSRlVHkilM3oo4HPOzs077c/YaaOWZvoiiqGNTk0FKWsfd1RY8cZt1Sp/7l+rX1INBSpqhEcUTc8IjwsHVzOaxdvCrUoisiR8KtyjywWFby09WuAXi+MF/rJYD4f8YGsSdsZLOFrCSkJPCcvLcaWSWeX3PtZLHGp6Zlpip3gHBiEC+HAywRh+vPQzLLMXNwP0yooy+Z6f/ElWJFeRWWMNnWXiJMjQI2pWqqsSY6KrMpKsWf3/21cjNjhQqO7wQfWTab51gX0L8jnT/Dw0zfwRVD7CRbqYv3IAQ++i54qaax8aN+DssqhFd+B8E9oftIge+ZEqxW2xGLyeQMMctFxD3UKhZ7/7HN9DeF2+6gp296BbzjcufgNReWfcBC1/UwAAAwBQTFRFjIiHW1dVvru66OfmlI+PiIOCf3p5ZWBf9fX1e3Z1gHt7g359iYSDkIyLlZCQ1tXU+vr6Pzw7+fn5hYB/QT48JSIiPTk4VVFQcGtqiYSEhYCAeXRzmZWUnpqZoZ2dw8C//Pz8WlVVfXl4Y15dSERDuba29vX1tLGxdXFwX1pZm5eWp6Ojt7Szq6enjYiIo6CgzMnIz83My8jI0c7Oop6erquryMXE+/z8bWhn9PPzeHNzwr++5uXl4uDg2djXzcvKpaGh4N7e5eTkOTY1sK2s393dt7S0qaamUk5N4eDg0c/OfHd3qKWl+Pf36+vs/v793dvbnZiYv7y77u3tjoqJVE9Ou7e3xMHAsa6t1dPT9/f28O/vu7i38O/wTkpJ8vLz+Pf4rKmo5+bms6+vmpWVNTIxV1NSFBIQEg8OGxcXYl1cXFdWaWRjtrOyq6inMC0sMi8uFRMSKCUkamVl7ezsf3p6MS4tMzAvNTEwi4aFubW1ycbGZF9e9vX27+7ucW1s1NLR6ejo09HRg35+mJSTxcPCYFxbnpqatbKy2dfXJSMiu7m4vLm5zszL2tnZjomIlpKRd3JxeXV0bGdmioWFQz8+uba1Pzs6k4+OTktKwL28Ozg25OPi7+7t0M3NYV1cdG9uUU1Ly8jHRUFAbWhoLSoph4ODT0xLvbq5LisqSkZF4+Libmlo8PDw2tnZVlJRPTo5TEdGpKCfrqqpi4eGhoGAVVBPvbq6HRsaJSIhVVJQS0dGLywrhH9+a2ZlJyQk29nax8TDrKinX1taaGNicWxrZmFgXFhXXVlYx8XELiopKSYlREA/5eTjNjMykY2M6+rpIyAfOzc2ko6NOTU0TUhHSUVEKicmIh8ePjo5r6ysNzQzFhMTHxwbop2d4N/gv7y8R0NCGRcWd3JyTklIQj89a2ZmdnFwZ2Jhs7CvbmppQT08QDw7ysfHpJ+fraqqc25te3Z2xcPCHRoZGxgXGBYVFxQTLCkpl5OT4t/f1NHRr6yrh4KB0c/Qj4uKJkXJBERmxwAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAJcEhZcwAALiMAAC4jAXilP3YAAANPSURBVDiNY1AgABioqMCTyYGFlU164kROLm4eXr5+FwFkBUnCIqKXQtcsa7aSlJGV6+20D5dTOcoBU6CmrqHJlqLd4d6id8+o9+08A7n3By0VBCazQhVYWm2bdfZnp0GAbWdkp+u8MF259+0+7+wE7KZPgyjgP+Gr0Kkds+j9sloBgcZ2IQGFAN1AbaYShf6FUQICQAVhfxQE5IUUFHxdBAQEftXWqb7TjTxg76gmMPeJNUjB2ofaAgJRB2ccOpsMVFCbUrEtPSNTojZBQEDoUJuaAEMAY06uY6f7nrL0/TnJfgLeTwIX7CmrKJB0O5BgdmhXmxcDZw3rCjXL4ANNHWw3NFcLBIquV3fzdjX4GV5zZeqMPr4shm3cPjxp+yaE85sniM0D2hEgpBBc3Ha++WqWg4F05Vk2BkatafO8OJ9ozqr942wrIBCb7BisoNb7QL5X79L7s22+2gys0r+ZN70wF0j68MQSqF9XMU5X/m2ssd6ZZ0u+L9O03Mwwa/nvFaeu2UbOWqLcWVv34dm9tthOvW1iq6xXL3yXWOmzl0Eg9N6KzxcrdNSE7PdsO+Bbu1ry2qmjkc3FLKKXDiS0yj5hUNgUeihj14nQVS8k2LMfn3iRlTW97uTWU6cPn1JVqHWfmsygMCdVO+PK8/4/kbyr5nWI21g27rx58fSl88/aFRQ64wzMgUF9Kjc941vR7eyN07PWV2Q93H9DbKvNZTHleAEBU25QZPmeCyj8nAEDBYfvPZNSuJ+2sRMYJorbQXHBv1hAZDZj/myxq98WsHDpCgj8vKr9ulhBQKBuwbEEkAkRJxSC8i2m8908O71agPddfJV3heK9nnnve5ccLREAmXCZU0EgPPTul0cPzz1UvPTtzmn2ebr/5I4FfpcCRihIAecER4FfkWq9m/8J8/DcW3HAmEkvJdD7xTFrAQGIgsl5dg1z5fojDAIiGxpiNqf867cPnJrTWycAU/BKTsBa26DP9ixzo21va1C1k+7hrIMCcMCgoHMtScGys/PnnKQkZiEvhwmKXOG1AsgKFGYwmvWdvcBsa2cYuLDoygI7AQUBFAUCUS4WypptNZM/KE2IcfUFpnQBNAUgHb5CQr5CAqh6EQpgQAGsAM0EAGnOUV2gusDzAAAAAElFTkSuQmCC"

let badImg1 = "data:image/fancy;base64,xxxxxxxx";
let badImg2 = "data:unknown/stuff;base64,xxxxxxxx";
let badImg3 = "data:image/jpg;base64,xxxxxxxx";
let badImg4 = img.replace('image/gif', 'image/png');

describe("Images", () => {
  let tagTemplateId, metricTemplateId, documentTemplateId;
  let defaultObject;
  var images = [];
  afterEach(done => {
    configLoader()
      .then(config => {
        while (images.length > 0) {
          var ref = images.pop();
          var path = `${config.images.folder}/${ref}`;
          if (ref) {
            fs.remove(path);
          }
        }
        done();
      })
      .catch(err => {
        log("error: %o", err);
        done();
      });
  });
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
                        attributes: [{ name: "id", type: "string" }, { name: "img", type: "image" }],
                        metrics: [metricTemplateId]
                      },
                      function(err, post) {
                        if (err) console.error(err);
                        documentTemplateId = post._id;
                        defaultObject = {
                          name: "test",
                          description: "something",
                          template: documentTemplateId,
                          attributes: [{ name: "id", value: "123" }, { name: "img", value: "some.jpg" }],
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

  describe("/PUT image", () => {
    it("it should PUT one image", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              let id = res.body._id;
              images.push(id);
              sess
                .put(`/api/v1.0/image/${id}/img`)
                .set("Content-Type", "text/plain")
                .send(img)
                .end((err, res) => {
                  res.should.have.status(200);
                  done();
                });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail PUT one image on unknown attribute", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/image/${res.body._id}/xyz`)
                .set("Content-Type", "text/plain")
                .send(img)
                .end((err, res) => {
                  res.should.have.status(404);
                  done();
                });
            });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should fail PUT malformed image type", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/image/${res.body._id}/img`)
                .set("Content-Type", "text/plain")
                .send(badImg1)
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
    it("it should fail PUT unknown content type", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/image/${res.body._id}/img`)
                .set("Content-Type", "text/plain")
                .send(badImg2)
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
    it("it should fail PUT malformed image", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/image/${res.body._id}/img`)
                .set("Content-Type", "text/plain")
                .send(badImg3)
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
    it("it should fail PUT mismatching image type", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              sess
                .put(`/api/v1.0/image/${res.body._id}/img`)
                .set("Content-Type", "text/plain")
                .send(badImg4)
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
    it("it should fail PUT one image on unknown document", done => {
      session()
        .then(sess => {
          sess
            .put(`/api/v1.0/image/5b48a8951c1e49438352cc35/img`)
            .set("Content-Type", "text/plain")
            .send(img)
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
  });

  describe("/GET image", () => {
    it("it should PUT and GET one image", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              var id = res.body._id;
              images.push(id);
              sess
                .put(`/api/v1.0/image/${id}/img`)
                .set("Content-Type", "text/plain")
                .send(img)
                .end((err, res) => {
                  res.should.have.status(200);
                  sess.get(`/api/v1.0/image/${id}/img`).end((err, res) => {
                    res.should.have.status(200);
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
    it("it should fail GET one image", done => {
      session()
        .then(sess => {
          sess.get(`/api/v1.0/image/5b48a8951c1e49438352cc35/img`).end((err, res) => {
            res.should.have.status(404);
            done();
          });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
    it("it should PUT and GET one image and PUT and GET another image", done => {
      session()
        .then(sess => {
          sess
            .post("/api/v1.0/document")
            .send(defaultObject)
            .end((err, res) => {
              res.should.have.status(200);
              var id = res.body._id;
              images.push(id);
              sess
                .put(`/api/v1.0/image/${id}/img`)
                .set("Content-Type", "text/plain")
                .send(img)
                .end((err, res) => {
                  res.should.have.status(200);
                  sess.get(`/api/v1.0/image/${id}/img`).end((err, res) => {
                    var firstOne = res.body;
                    res.should.have.status(200);
                    sess
                    .put(`/api/v1.0/image/${id}/img`)
                    .set("Content-Type", "text/plain")
                    .send(img2)
                    .end((err, res) => {
                      res.should.have.status(200);
                      sess.get(`/api/v1.0/image/${id}/img`).end((err, res) => {
                        var secondOne = res.body;
                        res.should.have.status(200);
                        secondOne.should.not.deep.equal(firstOne);
                        done();
                      });
                    });
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

  describe("/PUT should not allowed for Viewer", () => {
    it("it should fail PUT", done => {
      session(true)
        .then(sess => {
          sess.delete("/api/v1.0/image/5b48a8951c1e49438352cc35/img").end((err, res) => {
            res.should.have.status(403);
            done();
          });
        })
        .catch(err => {
          console.error(err);
          done();
        });
    });
  });
});
