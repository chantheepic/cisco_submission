const expect = require("chai").expect;
const request = require("supertest");
const app = require("../app.js");

// ==================== GET EDGE CHECK ====================
describe("Edge DELETE Check", () => {
  let testTargetId;
  before(done => {
    request(app)
      .post("/api/objects")
      .send({ title: "movie title", description: "movie description" })
      .then(res => {
        testTargetId = res.body.uid;
        done();
      });
  });

  // delete twice
  it("delete twice", done => {
    request(app)
      .delete(`/api/objects/${testTargetId}`)
      .then(res => {
        expect(res.status).to.equal(200);
      });
    request(app)
      .delete(`/api/objects/${testTargetId}`)
      .then(res => {
        expect(res.status).to.equal(200);
        done();
      });
  });
});
