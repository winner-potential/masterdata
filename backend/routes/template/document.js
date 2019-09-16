const DocumentTemplate = require("../../models/template/document");

const express = require("express");
const router = express.Router();
const log = require("debug")("masterdata:route:template:document");

const Promise = require("promise");

router.use(require("../../utils/token.js"));

// Load all metric templates
router.get("/", function(req, res, next) {
  DocumentTemplate.find(function(err, documents) {
    if (err) return log("Error while getting all documents %o", err) || next(err);
    res.json(documents);
  });
});

// Load by id
router.get("/:id", function(req, res, next) {
  DocumentTemplate.findById(req.params.id, function(err, post) {
    if (err) return log("Error while getting document %o", err) || next(err);
    if (!post) return res.status(404).send({ message: "Can not get document" });
    res.json(post);
  });
});

var checkDocument = template => {
  return new Promise((resolve, reject) => {
    var parents = {};
    var loadParent = id => {
      if(!id) {
        return handleTemplate();
      }
      if (parents[id]) {
        return reject({ message: "Cycle detected" });
      }
      DocumentTemplate.findById(id, (err, post) => {
        if (err) return reject({ message: "Error while loading parent" });
        if (!post) return reject({ message: "Can't find parent" });
        parents[post._id] = post;
        loadParent(post.extends);
      });
    };
    var handleTemplate = () => {
      if (!template.name || !template.identifier) {
        reject({ message: "Requires name and identifier" });
        return false;
      }
      if ((!template.attributes || template.attributes.length == 0) && !template.extends) {
        reject({ message: "Requires at least one attribute or has to extends an other document" });
        return false;
      }
      var badAttributes = false;

      // Check attributes are well formed
      template.attributes.forEach(attr => {
        if (!attr.name || !attr.type) {
          badAttributes = true;
        }
        if (attr.name == template.identifier) {
          found = true;
        }
      });

      // Check if identifier exists (at least in parent)
      var found = false;
      var current = template;
      while (current) {
        current.attributes.forEach(attr => {
          if (attr.name == template.identifier) {
            found = true;
          }
        });
        if(found) {
          break;
        }
        current = parents[current.extends];
      }
      if (badAttributes) {
        reject({ message: "Each attribute requires at least a name and a type" });
        return false;
      }
      if (!found) {
        reject({ message: "Did not find the identifier as attribute" });
        return false;
      }
      resolve();
    };
    loadParent(template.extends);
  });
};

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
  checkDocument(req.body).then(() => {
    DocumentTemplate.create(req.body, function(err, post) {
      if (err) return log("Error while adding document %o", err) || next(err);
      res.json(post);
    });
  }).catch(err => {
    res.status(400).json(err);
  })
});

// Update entry
admin.put("/:id", function(req, res, next) {
  checkDocument(req.body).then(() => {
    DocumentTemplate.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
      if (err) return log("Error while replacing document %o", err) || next(err);
      if (!post) return res.status(404).send({ message: "Can not replace document" });
      res.json(post);
    });
  }).catch(err => {
    res.status(400).json(err);
  })
});

// Remove entry
admin.delete("/:id", function(req, res, next) {
  DocumentTemplate.findByIdAndRemove(req.params.id, req.body, function(err, post) {
    if (err) return log("Error while deleting document %o", err) || next(err);
    if (!post) return res.status(404).send({ message: "Can not delete document" });
    res.json(post);
  });
});

router.use(admin);

module.exports = router;
