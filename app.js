const express = require("express");
const app = express();
const mongoose = require("mongoose");
const sanitize = require("mongo-sanitize");
const url = require("url");
require("dotenv/config");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.AZURE_MONGO_CREDENTIALS, () =>
  console.log("connected")
);

// Schemas
const ArbitrarySchema = mongoose.Schema(
  {},
  { strict: false, versionKey: false }
);
const ArbitraryModel = mongoose.model("ArbitraryModel", ArbitrarySchema);

// Helpers
jsonReplaceKey = string => {
  string = JSON.stringify(string);
  string = string.replace(/\"_id\":/g, '"uid":');
  string = JSON.parse(string);
  return string;
};

fullPath = (req, path = undefined) => {
  return url.format({
    protocol: req.protocol,
    host: req.get("host"),
    pathname: (path === undefined) ? req.path : String(path)
  });
}

// Error
let sendError = (req, errorMessage) => {
  return { verb: req.method, url: fullPath(req), message: errorMessage };
};
app.use((error, req, res, next) => {
  res.json({ verb: req.method, url: fullPath(req), message: error.message });
});

// Routes
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/api/objects", async (req, res) => {
  try {
    let response = await ArbitraryModel.find().distinct("_id");
    response = response.map(url => {return {"url": fullPath(req, url)}})
    res.json(response);
  } catch (error) {
    res.json(sendError(req, error.message));
  }
});

app.get("/api/objects/:uid", async (req, res) => {
  try {
    let clean = sanitize(req.params.uid);
    let resp = await ArbitraryModel.findById(clean);
    resp = jsonReplaceKey(resp);

    if (resp == null) {
      res.json(sendError(req, "object does not exist"));
    } else res.json(resp);
  } catch (error) {
    res.json(sendError(req, error.message));
  }
});

app.post("/api/objects", async (req, res) => {
  try {
    let clean = sanitize(req.body);
    let resp = await new ArbitraryModel(clean).save();
    resp = jsonReplaceKey(resp);

    if (resp == null) {
      res.json(sendError(req, "object does not exist"));
    } else res.json(resp);
  } catch (error) {
    res.json(sendError(req, error.message));
  }
});

app.patch("/api/objects/:uid", async (req, res) => {
  try {
    let resp = await ArbitraryModel.findOneAndUpdate(
      { _id: req.params.uid },
      req.body,
      {
        new: true,
        overwrite: true
      }
    );
    resp = jsonReplaceKey(resp);

    if (resp == null) {
      res.json(sendError(req, "object does not exist"));
    } else res.json(resp);
  } catch (error) {
    res.json(sendError(req, error.message));
  }
});

app.delete("/api/objects/:uid", async (req, res) => {
  try {
    await ArbitraryModel.remove({ _id: req.params.uid });
    res.end();
  } catch (error) {
    res.json(sendError(req, error.message));
  }
});

module.exports = app.listen(process.env.PORT || 3000);
