const MetricTemplate = require("../../models/template/metric");

const express = require("express");
const router = express.Router();
const log = require('debug')('masterdata:route:template:metric');

router.use(require('../../utils/token.js'))

// Load all metric templates
router.get("/", function(req, res, next) {
  MetricTemplate.find(function(err, Projects) {
    if (err) return log("Error while getting all metrics %o", err) || next(err);
    res.json(Projects);
  });
});

// Load by id
router.get("/:id", function(req, res, next) {
  MetricTemplate.findById(req.params.id, function(err, post) {
    if (err) return log("Error while getting metric %o", err) || next(err);
    if (!post) return res.status(404).send({'message': 'Can not get metric'});
    res.json(post);
  });
});

const admin = express.Router();
admin.use(function(req, res, next) {
  if(!req.decoded || !req.decoded.admin) {
    res.status(403).json({"message": "Missing admin right"});
    return;
  } else {
    next();
  }
})

// Add new entry
admin.post("/", function(req, res, next) {
  if(!req.body.name) {
    res.status(400).json({"message": "Requires name"});
    return;
  }
  MetricTemplate.create(req.body, function(err, post) {
    if (err) return log("Error while adding metric %o", err) || next(err);
    res.json(post);
  });
});

// Update entry
admin.put("/:id", function(req, res, next) {
  if(!req.body.name) {
    res.status(400).json({"message": "Requires name"});
    return;
  }
  MetricTemplate.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
    if (err) return log("Error while replacing metric %o", err) || next(err);
    if (!post) return res.status(404).send({'message': 'Can not replace metric'});
    res.json(post);
  });
});

// Remove entry
admin.delete("/:id", function(req, res, next) {
  MetricTemplate.findByIdAndRemove(req.params.id, req.body, function(err, post) {
    if (err) return log("Error while deleting tag %o", err) || next(err);
    if (!post) return res.status(404).send({'message': 'Can not delete tag'});
    res.json(post);
  });
});

router.use(admin);

module.exports = router;
