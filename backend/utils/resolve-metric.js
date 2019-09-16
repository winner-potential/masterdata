const Document = require("../models/document");
const MetricTemplate = require("../models/template/metric");
const TagTemplate = require("../models/template/tag");
const Promise = require("promise");

const searchDocuments = require("./search-document");
const log = require("debug")("masterdata:utils:metrics");

var findAttribute = (document, name) => {
  for (var k = 0; document.attributes && k < document.attributes.length; k++) {
    if (document.attributes[k].name == name) {
      return document.attributes[k].value;
    }
  }
  return undefined;
};

var solveTagReplacement = function(replacement, document, map) {
  return new Promise(function(resolve, reject) {
    var name = replacement.substring(1, replacement.length - 1);
    var path = name.split(".");
    var current = document;
    var walkThrough = function() {
      if (path.length > 1) {
        var jump = path.shift();
        var value;
        if (jump == "parent") {
          if (!document.parent) {
            log("Document %o (%o) does not have a parent", document.name, document._id);
            resolve(replacement, "unknown");
            return;
          }
          current = map[document.parent];
          if (!current) {
            // Start lookup in db to get missing parent
            Document.findById(document.parent, function(err, data) {
              map[data._id] = data;
              current = data;
              walkThrough();
            });
          } else {
            // Got through next selection
            walkThrough();
          }
        } else if ((value = findAttribute(current, jump))) {
          // instead of parent, it might be possible to use a attribute, which is considered as a link, this allows to access information from this document
          // we need to load this attribute value (we already know the document itself, but not the linked document)
          // this will change the context of parent, which changes "current"
          current = map[value];
          if (!current) {
            // Start lookup in db to get missing parent
            Document.findById(value, function(err, data) {
              map[data._id] = data;
              current = data;
              walkThrough();
            });
          } else {
            // Got through next selection
            walkThrough();
          }
        } else {
          log("Unknown relative document selector '%o' in %o", jump, replacement);
          resolve(replacement, "unknown");
          return;
        }
      } else {
        // Get attribute from document
        var attribute;
        (current.attributes || []).forEach(attr => {
          if (attr.name == path[0]) {
            attribute = attr;
          }
        });
        if (!attribute) {
          resolve(replacement, "unknown");
        } else {
          resolve({ replacement: replacement, replaceWith: attribute.value });
        }
      }
    };
    walkThrough();
  });
};

// Handle one metric, iteration over all tags
var handleMetric = function(metric, doc, map) {
  var jobs = [];
  var tags = [];
  (metric.tags || []).forEach(tag => {
    if(!tag.value) {
      return;
    }
    jobs.push(
      new Promise(function(resolve, reject) {
        var value = tag.value;
        var last;
        var handleReplacement = function() {
          var replacements = value.match(/:([a-zA-Z\.]+):/gi);
          if (!replacements) {
            tags.push({ identifier: tag.identifier, value: value });
            resolve();
            return;
          }
          var current = replacements.shift();
          if (current == last) {
            tags.push({ identifier: tag.identifier, value: value });
            resolve();
            return;
          }
          last = current;
          solveTagReplacement(current, doc, map)
            .then(s => {
              value = value.replace(s.replacement, s.replaceWith);
              handleReplacement();
            })
            .catch(reject);
        };
        handleReplacement();
      })
    );
  });
  return new Promise(function(resolve, reject) {
    var result = {
      key: metric.key,
      identifier: metric.identifier,
      _id: metric._id,
      tags: tags
    };
    if(jobs && jobs.length > 0) {
      Promise.all(jobs)
        .then(res => {
          resolve(result);
        })
        .catch(err => {
          log("Error while resolving: %o", err);
          reject(err);
        });
      } else {
        resolve(result);
      }
  });
};

// Handle metrics in this document, return promise for all metrics done
var handleMetrics = function(doc, map) {
  var jobs = [];
  (doc.metrics || []).forEach(metric => {
    jobs.push(handleMetric(metric, doc, map));
  });

  return new Promise(function(resolve, reject) {
    Promise.all(jobs)
      .then(result => {
        resolve({ document: doc._id, metrics: result });
      })
      .catch(err => {
        log("Error while resolving: %o", err);
        reject(err);
      });
  });
};

// Find matching documents and handle metrics, return promise
var resolveMetrics = function(path) {
  return new Promise(function(resolve, reject) {
    searchDocuments(path)
      .then(data => {
        var documents = data.documents;
        var map = data.map;
        var jobs = [];
        documents.forEach(doc => {
          jobs.push(handleMetrics(doc, map));
        });
        Promise.all(jobs)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
};

var addMetricNames = function(metricsPerDocuments) {
  var ids = [];
  metricsPerDocuments.forEach(doc => {
    doc.metrics.forEach(metric => {
      ids.push(metric.identifier);
    });
  });
  return new Promise(function(resolve, reject) {
    MetricTemplate.find(
      {
        _id: { $in: ids }
      },
      function(err, data) {
        if (err) return reject(err);
        var metrics = {};
        data.forEach(d => {
          metrics[d._id] = d;
        });
        metricsPerDocuments.forEach(doc => {
          doc.metrics.forEach(metric => {
            metric.name = metrics[metric.identifier].name;
            metric.alias = metrics[metric.identifier].alias;
            metric.description = metrics[metric.identifier].description;
            metric.unit = metrics[metric.identifier].unit;
          });
        });
        resolve(metricsPerDocuments);
      }
    );
  });
};

var addTagNames = function(metricsPerDocuments) {
  var ids = [];
  metricsPerDocuments.forEach(doc => {
    doc.metrics.forEach(metric => {
      metric.tags.forEach(tag => {
        ids.push(tag.identifier);
      });
    });
  });
  return new Promise((resolve, reject) => {
    TagTemplate.find(
      {
        _id: { $in: ids }
      },
      (err, data) => {
        if (err) return reject(err);
        var names = {};
        data.forEach(d => {
          names[d._id] = d.name;
        });
        metricsPerDocuments.forEach(doc => {
          doc.metrics.forEach(metric => {
            metric.tags.forEach(tag => {
              tag.name = names[tag.identifier];
            });
          });
        });
        resolve(metricsPerDocuments);
      }
    );
  });
};

var addRelationsToMetrics = metricsPerDocuments => {
  var ids = [];
  metricsPerDocuments.forEach(doc => {
    doc.metrics.forEach(metric => {
      ids.push(metric._id); // we need to find documents with relations to this metric instance
    });
  });
  return new Promise((resolve, reject) => {
    Document.find(
      {
        relations: { $elemMatch: { link: { $in: ids } } }
      },
      (err, data) => {
        // data contains documents with elements in relation which are also included in ids...
        // when processing our metrics, we need to map _id to possible relations onto this metric
        // create map which links metric._id to relation._id
        var map = {};
        (data || []).forEach(doc => {
          (doc.relations || []).forEach(rel => {
            map[rel.link] = rel._id;
          });
        });
        // extend metrics with relations
        (metricsPerDocuments || []).forEach(doc => {
          (doc.metrics || []).forEach(metric => {
            if (map[metric._id]) {
              metric.tags.push({
                name: "relation",
                value: map[metric._id]
              });
            }
          });
        });

        resolve(metricsPerDocuments);
      }
    );
  });
};

module.exports = path => {
  return new Promise((resolve, reject) => {
    resolveMetrics(path)
      .then(data => {
        addMetricNames(data)
          .then(dataWithMetricNames => {
            addTagNames(dataWithMetricNames)
              .then(dataWithMetricAndTagNames => {
                addRelationsToMetrics(dataWithMetricAndTagNames)
                  .then(dataWithMetricAndTagNamesAndRelations => {
                    resolve(dataWithMetricAndTagNamesAndRelations);
                  })
                  .catch(e => {
                    log("Error while handling relations within resolving: %o", e);
                    reject("Error while resolving tag names");
                  });
              })
              .catch(e => {
                log("Error while handling tag names within resolving: %o", e);
                reject("Error while resolving tag names");
              });
          })
          .catch(e => {
            log("Error while handling metric names within resolving: %o", e);
            reject("Error while resolving metric names");
          });
      })
      .catch(reject);
  });
};

module.exports.handleMetric = (metric, doc) => {
  return new Promise((resolve, reject) => {
    handleMetric(metric, doc, {}).then(data => {
      data = [{ document: doc._id, metrics: [data] }];
      addMetricNames(data)
        .then(dataWithMetricNames => {
          addTagNames(dataWithMetricNames)
            .then(dataWithMetricAndTagNames => {
              resolve(dataWithMetricAndTagNames);
            })
            .catch(e => {
              log("Error while handling tag names within resolving: %o", e);
              reject("Error while resolving tag names");
            });
        })
        .catch(e => {
          log("Error while handling metric names within resolving: %o", e);
          reject("Error while resolving metric names");
        });
    });
  });
};
