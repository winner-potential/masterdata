const Document = require("../models/document"); // ist das was in module.exports
const DocumentTemplate = require("../models/template/document"); // ist das was in module.exports
const MetricTemplate = require("../models/template/metric"); // ist das was in module.exports

const searchDocuments = require("../utils/search-document");
const express = require("express");
const router = express.Router();
const log = require("debug")("masterdata:route:document");

const Promise = require("promise");

router.use(require("../utils/token.js"));

// Load all documents
router.get("/", function(req, res, next) {
  Document.find(function(err, documents) {
    if (err) return log("Error while getting all documents %o", err) || next(err);
    res.json(documents);
  });
});

// Load all child documents
router.get("/childs/:id", function(req, res, next) {
  Document.find({ parent: req.params.id }, function(err, documents) {
    if (err) return log("Error while getting all documents %o", err) || next(err);
    res.json(documents);
  });
});

// Load by id
router.get("/:id", function(req, res, next) {
  Document.findById(req.params.id, function(err, post) {
    if (err) return log("Error while getting document %o", err) || next(err);
    if (!post) return res.status(404).send({ message: "Can not get document" });
    res.json(post);
  });
});

var findDocument = function(template, resolve, reject, attributes, metrics) {
  attributes = attributes || {};
  metrics = metrics || {};
  DocumentTemplate.findById(template, function(err, post) {
    if (err || !post) return reject({ message: "unknown template '" + template + "'", err: err });

    (post.attributes || []).forEach(function(entry) {
      if (!attributes[entry.name]) {
        attributes[entry.name] = entry;
      }
    });
    (post.metrics || []).forEach(function(entry) {
      if (!metrics[entry]) {
        metrics[entry] = true;
      }
    });

    if (post.extends) {
      findDocument(post.extends, resolve, reject, attributes, metrics);
    } else {
      resolve({ attributes: attributes, metrics: metrics });
    }
  });
};

var validate = function(newEntry) {
  return new Promise(function(resolve, reject) {
    var jobs = [];

    // Check Template and Attributes
    jobs.push(
      new Promise(function(resolve, reject) {
        findDocument(
          newEntry.template,
          function(data) {
            var attributes = data.attributes;
            var metrics = data.metrics;
            var current = {};
            (newEntry.attributes || []).forEach(function(entry) {
              // Check if attribute is configurated in template
              if (!attributes[entry.name]) {
                return reject({ message: "unknown attribute '" + entry.name + "' for template" });
              }
              current[entry.name] = entry;
            });
            for (var k in attributes) {
              var entry = attributes[k];
              if (entry.should && !current[entry.name]) {
                return reject({ message: "missing attribute '" + entry.name + "' for template" });
              }
            }
            resolve();
          },
          reject
        );
      })
    );

    // Check Metric IDs
    if (newEntry.metrics) {
      newEntry.metrics.forEach(function(entry) {
        jobs.push(
          new Promise(function(resolve, reject) {
            try {
              MetricTemplate.findById(entry.identifier, function(err, metric) {
                if (err || !metric) return reject({ msg: "unknown metric '" + entry.identifier + "'", err: err });

                // Map all allowed tags
                var tags = {};
                (metric.tags || []).forEach(function(metricTagEntry) {
                  tags[metricTagEntry + ""] = true;
                });

                var allowedTags = [];
                // Check provided tags if they exits
                (entry.tags || []).forEach(function(tagEntry) {
                  if (!tags[tagEntry.identifier]) {
                    log("Unknown tag '%o' for metric '%o', dropping tag and keep going", tagEntry.identifier, entry.identifier);
                  } else {
                    allowedTags.push(tagEntry)
                  }
                });
                entry.tags = allowedTags;

                resolve();
              });
            } catch (e) {
              reject(e);
            }
          })
        );
      });
    }

    // Wait all checks are done, and handle create
    Promise.all(jobs)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// Load by id
router.get("/find/:search", function(req, res, next) {
  Document.find(
    {
      $or: [
        { name: { $regex: req.params.search, $options: "i" } },
        { alias: { $regex: req.params.search, $options: "i" } },
        { description: { $regex: req.params.search, $options: "i" } }
      ]
    },
    function(err, post) {
      if (err) return next(err);

      var result = [];
      (post || []).forEach(p => {
        result.push({
          _id: p._id,
          name: p.name,
          template: p.template,
          description: p.description
        });
      });
      res.json(result);
    }
  );
});

// Load all child with specific metric template documents
router.get("/find-with-metric-template/:metric/:search", function(req, res, next) {
  var query = {
    $and: [
      { metrics: { $elemMatch: { identifier: req.params.metric } } },
      {
        $or: [
          { name: { $regex: req.params.search, $options: "i" } },
          { alias: { $regex: req.params.search, $options: "i" } },
          { description: { $regex: req.params.search, $options: "i" } }
        ]
      }
    ]
  };
  Document.find(query, function(err, post) {
    if (err) return log("Error while getting all documents %o", err) || next(err);
    var result = [];
    (post || []).forEach(p => {
      result.push({
        _id: p._id,
        name: p.name,
        template: p.template,
        description: p.description
      });
    });
    res.json(result);
  });
});

// Load by id
router.get("/match/*", function(req, res, next) {
  searchDocuments(req.path.substr("/match/".length))
    .then(data => {
      res.json(data.documents);
    })
    .catch(e => {
      res.status(400).json({ message: e });
    });
});

// Load by id
router.post("/match", function(req, res, next) {
  if(req.body.query)
    searchDocuments(req.body.query)
      .then(data => {
        res.json(data.documents);
      })
      .catch(e => {
        res.status(400).json({ message: e });
      });
});

const admin = express.Router();
admin.use(function(req, res, next) {
  if (!req.decoded || !req.decoded.admin) {
    res.status(403).json({ message: "Missing admin right" });
    return;
  } else {
    next();
  }
});

// Add new entry
admin.post("/", function(req, res, next) {
  validate(req.body)
    .then(function() {
      Document.create(req.body, function(err, post) {
        if (err) return log("Error while adding document %o", err) || next(err);
        res.json(post);
      });
    })
    .catch(error => {
      log("Error while getting document %o", error);
      res.status(400).json({ message: "Validation failed" });
    });
});

// Update entry
admin.put("/:id", function(req, res, next) {
  validate(req.body)
    .then(function() {
      Document.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
        if (err) return log("Error while replacing document %o", err) || next(err);
        if (!post) return res.status(404).send({ message: "Can not replace document" });
        res.json(post);
      });
    })
    .catch(error => {
      log("Error while getting document %o", error);
      res.status(400).json({ message: "Validation failed" });
    });
});

// Remove entry
admin.delete("/:id", function(req, res, next) {
  Document.findByIdAndRemove(req.params.id, req.body, function(err, post) {
    if (err) return log("Error while deleting document %o", err) || next(err);
    if (!post) return res.status(404).send({ message: "Can not delete document" });
    res.json(post);
  });
});

router.use(admin);

module.exports = router;
