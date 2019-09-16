const configLoader = require("../config.js");
const jwt = require("jsonwebtoken");
const log = require("debug")("masterdata:token");

module.exports = (req, res, next) => {
  if (req.method.toUpperCase() == "OPTIONS") {
    log("wuffStop");
    return next();
  }
  var token = req.body.token || req.query.token || req.headers["x-access-token"];
  if (token) {
    configLoader()
      .then(config => {
        jwt.verify(token, config.secret, (err, decoded) => {
          if (err) {
            log("Bad token: %o", err.message);
            return res.status(403).json({ success: false, message: "Failed to authenticate token." });
          } else {
            req.decoded = decoded;
            delete decoded.exp;
            res.setHeader("X-Access-Token", jwt.sign(decoded, config.secret, { expiresIn: 60 * 60 }));
            next();
          }
        });
      })
      .catch(err => {
        log("Error while loading configuration: %o", err);
      });
  } else {
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
};
