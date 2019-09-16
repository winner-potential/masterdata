const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const log = require("debug")("masterdata:test:utils:tsdb");

app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json({ type: "application/json" }));

app.post("/", (req, res) => {
  res.json({
    queries: [
      {
        sample_size: 4,
        results: [
          {
            name: req.body.metrics[0].name,
            group_by: [],
            tags: {},
            values: [
              [1535493600000, 605],
              [1535493660000, 605],
              [1535493720000, 605],
              [1535493780000, 605]
            ]
          }
        ]
      }
    ]
  });
});

app.listen(2999, () => log("Start tsdb mock on 2999!"));

module.exports = app;
