const expect = require("chai").expect;
const request = require("supertest");
const app = require("../app.js");


// ==================== GET EDGE CHECK ====================
describe("Edge GET Check", () => {
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

  // ID Invalid
  it("ID Invalid, invalid character", done => {
    let fakeTarget = "." + testTargetId.slice(1);
    request(app)
      .get(`/api/objects/${fakeTarget}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          verb: "GET",
          message: `Cast to ObjectId failed for value "${fakeTarget}" at path "_id" for model "ArbitraryModel"`
        });
        expect(res.body.url).to.match(new RegExp(`(.+):\/\/(.+)\/api\/objects\/${fakeTarget}`));
        done();
      });
  });

  it("ID Invalid, too short", done => {
    let fakeTarget = "000000000000000000000";
    request(app)
      .get(`/api/objects/${fakeTarget}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          verb: "GET",
          message: `Cast to ObjectId failed for value "${fakeTarget}" at path "_id" for model "ArbitraryModel"`
        });
        expect(res.body.url).to.match(new RegExp(`(.+):\/\/(.+)\/api\/objects\/${fakeTarget}`));
        done();
      });
  });

  // ID doesn't exist
  it("ID doesn't exist", done => {
    let fakeTarget = "000000000000000000000000";
    request(app)
      .get(`/api/objects/${fakeTarget}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          verb: "GET",
          message: "object does not exist"
        });
        expect(res.body.url).to.match(new RegExp(`(.+):\/\/(.+)\/api\/objects\/${fakeTarget}`));
        done();
      });
  });

  after(done => {
    request(app)
      .delete(`/api/objects/${testTargetId}`)
      .then(res => {
        done();
      });
  });
});