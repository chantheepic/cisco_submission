const expect = require("chai").expect;
const request = require("supertest");
const app = require("../app.js");

// ==================== PUT EDGE TEST ====================
describe("PUT Edge Check", () => {
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

  // Update item with malformed id
  it("update item with malformed id", done => {
    let fakeTarget = "000000000000000000000";
    request(app)
      .patch(`/api/objects/${fakeTarget}`)
      .send({ title: "movie title", cast: "movie cast" })
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          verb: "PATCH",
          message: `Cast to ObjectId failed for value "${fakeTarget}" at path "_id" for model "ArbitraryModel"`
        });
        expect(res.body.url).to.match(/(.+):\/\/(.+)\/api\/objects\/(.+)/);
        done();
      });
  });

  // Update item that doesn't exist
  it("update item that doesn't exist", done => {
    let fakeTarget = "000000000000000000000000";
    request(app)
      .patch(`/api/objects/${fakeTarget}`)
      .send({ title: "movie title", cast: "movie cast" })
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          verb: "PATCH",
          message: "object does not exist"
        });
        expect(res.body.url).to.match(/(.+):\/\/(.+)\/api\/objects\/(.+)/);
        done();
      });
  });

  // Update item with malformed JSON
  it("update item with malformed JSON", done => {
    request(app)
      .patch(`/api/objects/${testTargetId}`)
      .type('json')
      .send('{ title: "movie title", cast: "movie cast }')
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          verb: "PATCH",
          message: "Unexpected token t in JSON at position 2"
        });
        expect(res.body.url).to.match(/(.+):\/\/(.+)\/api\/objects/);
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
