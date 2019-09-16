const Document = require("../models/document"); // ist das was in module.exports
const DocumentTemplate = require("../models/template/document"); // ist das was in module.exports
const MetricTemplate = require("../models/template/metric"); // ist das was in module.exports

const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

const Promise = require("promise");

var States = {
  DEFAULT: 0,
  QUOTE: 1,
  ATTR_KEY: 2,
  ATTR_VALUE: 3
};

var splitPath = function(path) {
  path = decodeURI(path);
  var result = [];
  if (path.startsWith("/")) {
    path = path.substr(1);
  }
  var states = [States.DEFAULT];
  var current = "";
  var type, key;
  for (var i = 0; i < path.length; i++) {
    var char = path[i];
    var state = states[states.length - 1];
    if (state == States.QUOTE) {
      if (char == '"') {
        states.pop();
      } else {
        current += char;
      }
    } else {
      if (char == '"') {
        if (current) {
          throw "Quotes within right in the middle at " + path.substr(0, i);
        }
        states.push(States.QUOTE);
      } else if (state == States.ATTR_KEY) {
        if (char == "]") {
          throw "Missing value after " + path.substr(0, i);
        } else if (char == "=") {
          if (!current) {
            throw "Missing key name for selector after " + path.substr(0, i);
          }
          states.pop();
          states.push(States.ATTR_VALUE);
          // save type name
          key = current;
          current = "";
        } else {
          current += char;
        }
      } else if (state == States.ATTR_VALUE) {
        if (char == "]") {
          states.pop();
          // save type name
          type.attributes.push({
            key: key,
            value: current
          });
          key = undefined;
          current = "";
          if (i + 1 < path.length) {
            if (path[i + 1] != "/" && path[i + 1] != "[") {
              throw "Unknown syntax after " + path.substr(0, i);
            }
          }
        } else {
          current += char;
        }
      } else {
        if (char == "/") {
          if(current) {
            type = {
              name: current.toLowerCase(),
            }
          }
          if (!type) {
            throw "No type found before next selection group after " + path.substr(0, i);
          }
          result.push(type);
          type = undefined;
          key = undefined;
        } else if (char == "[") {
          if (!current) {
            throw "Type name is empty, use * as wildcard after " + path.substr(0, i);
          }
          states.push(States.ATTR_KEY);
          // save type name
          type = {
            name: current.toLowerCase(),
            attributes: []
          };
          current = "";
        } else if (state == States.DEFAULT) {
          current += char;
        }
      }
    }
  }
  if(states.length > 1) {
    throw "Bad termination state: " + states[states.length - 1];
  }
  if(current) {
    type = {
      name: current.toLowerCase(),
    }
  }
  if (type) {
    result.push(type);
  }
  return result;
};

var childsLookup = function(part, documents) {
  return new Promise(function(resolve, reject) {
    var parents = [];
    documents.forEach(doc => {
      parents.push(doc._id);
    });
    lookup(part, parents).then(res => {
      resolve(documents.concat(res))
    }).catch(err => reject(err));
  });
};

var lookup = function(part, parents) {
  return new Promise(function(resolve, reject) {
    var query = {};
    if (!part.wildcard) {
      query["template"] = part.id;
    }
    if (parents) {
      query["parent"] = { $in: parents };
    }
    (part.attributes || []).forEach(attr => {
      if(attr.key == '_id') {
        query["_id"] = mongoose.Types.ObjectId(attr.value);
      } else {
        query["attributes.name"] = attr.key;
        query["attributes.value"] = attr.value;
      }
    });
    Document.find(query, function(err, documents) {
      if (err) return reject(err);
      if (part.childs && documents.length > 0) {
        childsLookup(part, documents).then(all => resolve(all)).catch(err => reject(err))
      } else {
        resolve(documents);
      }
    });
  });
};

var searchDocuments = function(path) {
  // use first element and lookup... use next element and lookup for elements with parent id to previously found results
  return new Promise(function(resolve, reject) {
    var parts;
    try {
      parts = splitPath(path);
    } catch (e) {
      reject({ message: e });
      return;
    }
    DocumentTemplate.find(function(err, documents) {
      if (err) return reject(err);
      var naming = {};
      documents.forEach(doc => {
        naming[doc.name.toLowerCase()] = doc._id;
      });
      // check if all names are known
      try {
        parts.forEach(part => {
          if (part.name == "*") {
            part.wildcard = true;
          } else if (part.name == "**") {
            part.wildcard = true;
            part.childs = true;
          } else {
            if (!naming[part.name]) throw "Unknown template " + part.name;
            part.id = naming[part.name];
          }
        });
      } catch (e) {
        return reject(e);
      }
      var map = {};
      var handleThen = documents => {
        if (parts.length > 0) {
          var parents = [];
          documents.forEach(doc => {
            parents.push(doc._id);
            map[doc._id] = doc;
          });
          lookup(parts.shift(), parents)
            .then(handleThen)
            .catch(err => reject(err));
        } else {
          resolve({ documents: documents, map: map });
        }
      };
      lookup(parts.shift())
        .then(handleThen)
        .catch(err => reject(err));
    });
  });
};

module.exports = searchDocuments;
