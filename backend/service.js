const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const fs = require("fs");
const pjson = require("./package.json");
const waitPort = require("wait-port");
const url = require("url");
const log = require("debug")("masterdata:service");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Create runtime environment
var app = express();

// Config CORS for express
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS, PUT, POST, DELETE, GET");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
  res.header("Access-Control-Expose-Headers", "Content-Type, X-Access-Token");
  //intercepts OPTIONS method
  if ("OPTIONS" === req.method) {
    //respond with 200
    res.sendStatus(200);
  } else {
    //move on
    next();
  }
});

// Config environment
if (process.env.NODE_ENV != "test") {
  app.use(logger("dev"));
}

app.use(function(req, res, next) {
  var contentType = req.headers["content-type"] || "",
    mime = contentType.split(";")[0];
  if (mime != "text/plain" && mime != "application/octet-stream") {
    return next();
  }
  var data = "";
  req.setEncoding("utf8");

  req.on("data", function(chunk) {
    data += chunk;
  });

  req.on("end", function() {
    req.rawBody = data;
    next();
  });
});
app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json({ type: "application/json" }));

if (process.env.NODE_ENV != "test") {
  app.use("/admin", express.static("public/admin")); // not avialable during development! use ng serve in frontend folder
  app.use("/login", express.static("public/login")); // not avialable during development! use ng serve in frontend folder
  app.use("/", express.static("public/viewer")); // not avialable during development! use ng serve in frontend folder
}
// Add project to environment
app.use("/api/v1.0/template/metric", require("./routes/template/metric"));
app.use("/api/v1.0/template/document", require("./routes/template/document"));
app.use("/api/v1.0/template/tag", require("./routes/template/tag"));
app.use("/api/v1.0/document", require("./routes/document"));
app.use("/api/v1.0/metric", require("./routes/metric"));
app.use("/api/v1.0/authentificate", require("./routes/authentification"));
app.use("/api/v1.0/image", require("./routes/image"));
app.use("/api/v1.0/tsdb", require("./routes/tsdb"));
app.get("/version", function(req, res) {
  res.json({ version: pjson.version });
});

if (process.env.NODE_ENV != "test") {
  var addEndSlash = function(str) {
    if (!str.endsWith("/")) {
      return str + "/";
    }
    return str;
  };
  var basePath = process.env.BASEPATH ? addEndSlash(process.env.BASEPATH) : "http://localhost/";

  var admin = "admin";
  var login = "login";
  var prepareIndex = function(paths, base, file) {
    var index = "";
    fs.readFile(file, "utf8", function(err, data) {
      if (err) {
        return log("Can't load index files, which is ok in dev mode: %o", err.message);
      }
      index = data;
      index = index.replace('<base href="/" />', '<base href="' + basePath + (base ? addEndSlash(base) : "") + '" />');
      index = index.replace("window.api = undefined;", 'window.api = "' + basePath + '";');
      index = index.replace("window.login = undefined;", 'window.login = "' + (basePath + login) + '/";');
      index = index.replace("window.admin = undefined;", 'window.admin = "' + (basePath + admin) + '/";');
      index = index.replace("window.readonly = undefined;", 'window.readonly = "' + (basePath) + '";');
    });
    var index = function(req, res) {
      res.contentType("text/html");
      res.send(index);
    };
    paths.forEach(path => app.get(path, index));
  };

  prepareIndex([`/${login}`, `/${login}/*`], login, "views/login.html");
  prepareIndex([`/${admin}`, `/${admin}/*`], admin, "views/admin.html");
  prepareIndex(["*"], "", "views/viewer.html");
}

var databaseUri = process.env.DATABASE || (process.env.MONGODB_NAME ? "mongodb://mongodb/masterdata" : "") || "mongodb://localhost/masterdata";
var databaseUrl = url.parse(databaseUri);

log("Wait for Database %o", databaseUri);
waitPort({
  host: databaseUrl.hostname,
  port: databaseUrl.port || 27017,
  timeout: 10000,
  output: "silent"
}).then(() => {
  // Connect to database
  log("Connect to database %o", databaseUri);

  mongoose
    .connect(databaseUri)
    .then(() => {
      log("Connected to database succesful");
      // Start application
      var port = parseInt(process.env.PORT) || 3000;
      app.listen(port, () => log("App listening on port %o", port));
    })
    .catch(err => console.error(err));
});

// Process in Docker sometimes dont get Ctrl+C to exit
process.on("SIGINT", function() {
  process.exit();
});

module.exports = app;
