const expect = require("chai").expect;
const request = require("supertest");
const app = require("../app.js");


// ==================== PROPER ====================
describe("Controller check", () => {
  it("basic ping", done => {
    request(app)
      .get("/ping")
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.text).to.equal("pong");
        done();
      });
  });
});

describe("Basic REST Check", () => {
  let testTargetId;
  it("post item", done => {
    request(app)
      .post("/api/objects")
      .send({ title: "movie title", description: "movie description"})
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({ title: "movie title", description: "movie description"});
        testTargetId = res.body.uid;
        done();
      });
  });

  it("get item", done => {
    request(app)
      .get(`/api/objects/${testTargetId}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ uid: testTargetId, title: "movie title", description: "movie description"});
        done();
      });
  });

  it("get item", done => {
    request(app)
      .patch(`/api/objects/${testTargetId}`)
      .send({ title: "movie title" , cast: "movie cast"})
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ uid: testTargetId, title: "movie title" , cast: "movie cast"});
        done();
      });
  });

  it("delete item", done => {
    request(app)
      .delete(`/api/objects/${testTargetId}`)
      .then(res => {
        expect(res.status).to.equal(200);
        done();
      });
  });
});