const Document = require("../models/document");
const MetricTemplate = require("../models/template/metric");

const resolveMetrics = require("../utils/resolve-metric");
const express = require("express");
const router = express.Router();
const configLoader = require("../config.js");
const log = require("debug")("masterdata:route:metric");
const request = require("request");

//router.use(require("../utils/token.js"));

var call = (metric, tags, start, end) => {
  return new Promise((resolve, reject) => {
    log("Call tsdb for %o and %o", metric, tags);
    configLoader()
      .then(cnf => {
        var tagsRebuild = {};
        for (var k in tags) {
          tagsRebuild[k] = [tags[k]];
        }
        var reqBody = {
          start_absolute: start,
          end_absolute: end,
          time_zone: "Europe/Berlin",
          metrics: [
            {
              tags: tagsRebuild,
              name: metric,
              aggregators: [
                {
                  name: "avg",
                  sampling: {
                    value: 1,
                    unit: "minutes"
                  }
                }
              ]
            }
          ]
        };
        var url = cnf.tsdb.url;
        log("Call tsdb url %o", url);
        var req = request.post(url, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body.queries[0].results[0].values);
          } else {
            log("Error '%o' while requesting, result is: %o", error, body);
            reject();
          }
        });
        if (cnf.tsdb.username) {
          req.auth(cnf.tsdb.username, cnf.tsdb.password);
        }
        req.json(reqBody);
      })
      .catch(err => {
        log("Can't load from tsdb without configuration: %o", err);
        reject();
      });
  });
};

router.post("/query/metric/:id", function(req, res, next) {
  var query = { metrics: { $elemMatch: { _id: req.params.id } } };
  Document.find(query, function(err, post) {
    if (err || post.length == 0) return log("Error while getting documents %o", err) || next(err);
    var metric;
    (post[0].metrics || []).forEach(m => {
      if (m._id == req.params.id) {
        metric = m;
      }
    });
    resolveMetrics
      .handleMetric(metric, post[0])
      .then(result => {
        var documentResult = result[0];
        var metricResult = documentResult.metrics[0];
        var tags = {};
        (metricResult.tags || []).forEach(tag => {
          tags[tag.name] = tag.value;
        });
        log("Use resolved metric %o for query", metricResult);
        call(metricResult.name, tags, req.body.start, req.body.end)
          .then(result => {
            res.json({
              values: result,
              name: metric.alias ? metric.alias : (metricResult.alias ? metricResult.alias : metricResult.name),
              metric: {
                name: metricResult.name,
                alias: metricResult.alias,
                description: metricResult.description,
                identifier: metric.identifier,
                unit: metricResult.unit,
                document: {
                  name: post[0].name,
                  description: post[0].description
                }
              }
            });
          })
          .catch(err => {
            log("Error while requesting tsdb: %o", err);
            next();
          });
      })
      .catch(next);
  });
});

router.post("/query/relation/:id", function(req, res, next) {
  var query = { relations: { $elemMatch: { _id: req.params.id } } };
  Document.find(query, function(err, post) {
    if (err || post.length == 0) return log("Error while getting documents %o", err) || next(err);
    var relation;
    (post[0].relations || []).forEach(r => {
      if (r._id == req.params.id) {
        relation = r;
      }
    });
    MetricTemplate.findById(relation.identifier, function(err, element) {
      if (err) return log("Error while getting metric template %o", err) || next(err);
      if (!post) return res.status(404).send({ message: "Can not get metric template" });
      call(
        element.name,
        {
          relation: relation._id
        },
        req.body.start,
        req.body.end
      )
        .then(result => {
          res.json({
            values: result,
            name: relation.alias ? relation.alias : (element.alias ? element.alias : element.name),
            relation: {
              name: element.name,
              alias: element.alias,
              description: element.description,
              identifier: relation.identifier,
              unit: element.unit,
              document: {
                name: post[0].name,
                description: post[0].description
              }
            }
          });
        })
        .catch(err => {
          log("Error while requesting tsdb: %o", err);
          next();
        });
    });
  });
});

module.exports = router;
