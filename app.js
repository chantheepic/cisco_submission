const express = require("express");
const app = express();
const mongoose = require("mongoose");
const sanitize = require("mongo-sanitize");
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

// Error
let sendError = (req, error) => {
  return { verb: req.method, url: req.path, message: error.message };
};

// Routes
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/api/objects", async (req, res) => {
  try {
    const response = await ArbitraryModel.find().distinct("_id");
    res.json(response);
  } catch (error) {
    res.json(sendError(req, error));
  }
});

app.get("/api/objects/:uid", async (req, res) => {
  try {
    let clean = sanitize(req.params.uid);
    let resp = await ArbitraryModel.findById(clean);
    resp = JSON.stringify(resp);
    resp = resp.replace(/\"_id\":/g, '"uid":');
    resp = JSON.parse(resp);
    res.json(resp);
  } catch (error) {
    res.json(sendError(req, error));
  }
});

app.post("/api/objects", async (req, res) => {
  try {
    let clean = sanitize(req.body);
    let resp = await new ArbitraryModel(clean).save();
    resp = JSON.stringify(resp);
    resp = resp.replace(/\"_id\":/g, '"uid":');
    resp = JSON.parse(resp);
    res.json(resp);
  } catch (err) {
    res.json(sendError(req, error));
  }
});

app.patch("/api/objects/:uid", async (req, res) => {
  try {
    let resp = await ArbitraryModel.findOneAndUpdate({ _id: req.params.uid }, req.body, {
      new: true,
      overwrite: true
    });
    resp = JSON.stringify(resp);
    resp = resp.replace(/\"_id\":/g, '"uid":');
    resp = JSON.parse(resp);
    res.json(resp)
  } catch (err) {
    res.json(sendError(req, error));
  }
});

app.delete("/api/objects/:uid", async (req, res) => {
  try {
    await ArbitraryModel.remove({ _id: req.params.uid });
    res.send({});
  } catch (err) {
    res.json(sendError(req, error));
  }
});

app.listen(process.env.PORT || 3000)