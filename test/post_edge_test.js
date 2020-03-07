const expect = require("chai").expect;
const request = require("supertest");
const app = require("../app.js");

// ==================== POST EDGE CHECK ====================
describe("Edge POST Check", () => {
  let emptyBodyId;

  // Empty Body
  it("empty body", done => {
    request(app)
      .post("/api/objects")
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys(['uid']);
        emptyBodyId = res.body.uid;
        done();
      });
  });

  // Invalid JSON
  it("invalid json", done => {
    request(app)
      .get(`/api/objects`)
      .type('json')
      .send('{ title: "movie title", cast: "movie cast }')
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          verb: "GET",
          message: "Unexpected token t in JSON at position 2"
        })
        expect(res.body.url).to.match(/(.+):\/\/(.+)\/api\/objects/);
        done();
      });
  });

  after(done => {
    request(app)
      .delete(`/api/objects/${emptyBodyId}`)
      .then(res => {
        done();
      });
  });
});
