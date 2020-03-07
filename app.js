const express = require("express");
const app = express();
const mongoose = require("mongoose");
const sanitize = require("mongo-sanitize");
const url = require("url");
require("dotenv/config");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initial appllcation connects to the db
mongoose.connect(process.env.AZURE_MONGO_CREDENTIALS, () =>
  console.log("connected")
);

// Schemas. Arbitrary model allows for any object
const ArbitrarySchema = mongoose.Schema(
  {},
  { strict: false, versionKey: false }
);
const ArbitraryModel = mongoose.model("ArbitraryModel", ArbitrarySchema);

// Helpers. Helper functions to reduce duplication of fragile functions
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

// Error. Error handing for malformed JSON
let sendError = (req, errorMessage) => {
  return { verb: req.method, url: fullPath(req), message: errorMessage };
};
app.use((error, req, res, next) => {
  res.json({ verb: req.method, url: fullPath(req), message: error.message });
});

// Routes. Normally, A router would be used but since this is a 5 endpoint API, I find putting everything in a single file easier to refer back to.
// Once the number of routes hits about 7, it would be wise to move the routes into separate files and implement them as modules.

// ping and check state of node controller
app.get("/ping", (req, res) => {
  res.send("pong");
});

// return all the urls for existing objects
app.get("/api/objects", async (req, res) => {
  try {
    let response = await ArbitraryModel.find().distinct("_id");
    response = response.map(id => {
      let path = `api/objects/${id}`
      return {"url": fullPath(req, path)}
    })
    res.json(response);
  } catch (error) {
    res.json(sendError(req, error.message));
  }
});

// get specific document
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

// add new document
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

// update a document
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

// delete a document
app.delete("/api/objects/:uid", async (req, res) => {
  try {
    await ArbitraryModel.remove({ _id: req.params.uid });
    res.end();
  } catch (error) {
    res.json(sendError(req, error.message));
  }
});


// port used. former is for azure
module.exports = app.listen(process.env.PORT || 4000);
