const resolveMetrics = require("../utils/resolve-metric");
const searchDocuments = require("../utils/search-document");
const express = require("express");
const router = express.Router();
const log = require('debug')('masterdata:route:metric');

router.use(require('../utils/token.js'))

// Search matching metrics
router.get("/match/*", function(req, res, next) {
  searchDocuments(req.path.substr("/match/".length))
    .then(data => {
      var result = [];
      data.documents.forEach(doc => {
        doc.metrics.forEach(metric => {
          metric.document = doc._id
          result.push(metric)
        })
      })
      res.json(result)
    })
    .catch(e => {
      res.status(400).json({ message: e });
    });
});

// Search matching metrics and resolve selectors as well as naming
router.get("/resolve/*", function(req, res, next) {
  resolveMetrics(req.path.substr("/resolve/".length))
    .then(data => {
      var result = [];
      data.forEach(doc => {
        doc.metrics.forEach(metric => {
          metric.document = doc.document
          result.push(metric)
        });
      });
      res.json(result);
    })
    .catch(e => {
      log("Error while resolving metrics: %o", e)
      res.status(400).json({ message: e });
    });
});

// Search matching metrics and resolve selectors as well as naming
router.post("/resolve", function(req, res, next) {
  if(req.body.query)
      resolveMetrics(req.body.query)
        .then(data => {
          var result = [];
          data.forEach(doc => {
            doc.metrics.forEach(metric => {
              metric.document = doc.document
              result.push(metric)
            });
          });
          res.json(result);
        }).catch(e => {
          log("Error while resolving metrics: %o", e)
          res.status(400).json({ message: e });
        });
    else
      res.status(400).json({ message: "Missing query in body" });
});

module.exports = router;
