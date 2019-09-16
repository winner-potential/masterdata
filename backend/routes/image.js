const Document = require("../models/document");

const express = require("express");
const configLoader = require("../config.js");
const router = express.Router();
const log = require("debug")("masterdata:route:image");
const fs = require("fs");
const resolve = require("path").resolve;
const imageType = require("image-type");

const path = require("path");
const appDir = path.dirname(require.main.filename);

var checkFolder = () => {
  return new Promise((resolve, reject) => {
    configLoader()
      .then(cnf => {
        fs.exists(cnf.images.folder, exists => {
          if (!exists) {
            fs.mkdir(cnf.images.folder, err => {
              if (err) log("Error while creating image folder");
              resolve();
            });
          } else {
            resolve();
          }
        });
      })
      .catch(reject);
  });
};

var findFile = (config, reference, attribute, callback) => {
  var path = `${config.images.folder}/${reference}`;
  fs.exists(path, exists => {
    if (exists) {
      var done = false;
      fs.readdir(path, (err, files) => {
        (files || []).forEach(file => {
          if (done) return;
          var parts = file.split(".");
          if (parts.length > 1) parts.pop(); // drop ending
          var name = parts.join(".");
          if (name == attribute) {
            done = true;
            callback(file);
          }
        });
        if (!done) {
          callback();
        }
      });
    } else {
      callback();
    }
  });
};

// Load by id
router.get("/:reference/:attribute", (req, res, next) => {
  configLoader()
    .then(config => {
      findFile(config, req.params.reference, req.params.attribute, file => {
        var path = resolve(`${config.images.folder}/${req.params.reference}/${file}`);
        if (file) res.sendFile(path);
        else res.status(404).send({ message: "Can not find image" });
      });
    })
    .catch(err => {
      return log("Error while getting image") || next(err);
    });
});

const admin = express.Router();

admin.use(require("../utils/token.js"));
admin.use((req, res, next) => {
  if (!req.decoded || !req.decoded.admin) {
    res.status(403).json({ message: "Missing admin right" });
    return;
  } else {
    next();
  }
});

// Update entry
admin.put("/:reference/:attribute", (req, res, next) => {
  var reference = req.params.reference;
  Document.findById(reference, (err, post) => {
    if (err) return log("Error while getting reference document %o", err) || next(err);
    if (!post) return res.status(404).send({ message: "Can not get document" });
    var current;
    (post.attributes || []).forEach(attr => {
      if (attr.name == req.params.attribute) {
        current = attr;
      }
    });
    if (!current) return res.status(404).send({ message: "Unknown attribute" });
    checkFolder()
      .then(() => {
        configLoader()
          .then(config => {
            var type = req.rawBody.match(/^data:image\/(png|jpeg|gif|jpg);base64,/);
            if (type) {
              var data = req.rawBody.replace(/^data:image\/\w+;base64,/, "");
              var buf = new Buffer(data, "base64");
              try {
                var bufType = imageType(buf);
                if ("image/" + type[1].toLowerCase() != bufType.mime) {
                  return res.status(400).send({ message: "Malformed image data" });
                }
              } catch (e) {
                return res.status(400).send({ message: "Malformed image data" });
              }
              var folder = config.images.folder + "/" + reference;
              var save = () => {
                fs.writeFile(`${folder}/${current.name}.${type[1]}`, buf, err => {
                  if (err) return log("Error while saving image: %o", err) || next(err);
                  res.json({ success: true });
                });
              };
              var remove = () => {
                findFile(config, reference, current.name, filename => {
                  if (filename) {
                    fs.unlink(`${folder}/${filename}`, () => {
                      save();
                    });
                  } else {
                    save();
                  }
                });
              };
              fs.exists(folder, exists => {
                if (!exists) {
                  fs.mkdir(folder, err => {
                    if (err) return log("Error while saving image: %o", err) || next(err);
                    remove();
                  });
                } else {
                  remove();
                }
              });
            } else {
              return res.status(400).send({ message: "Bad image type" });
            }
          })
          .catch(err => {
            return log("Error while loading config for image saving: %o", err) || next(err);
          });
      })
      .catch(err => {
        return log("Error while checking folder for image saving: %o", err) || next(err);
      });
  });
});

router.use(admin);

module.exports = router;
