import "mocha";
import chai from "chai";
import { default as chaiHttp } from "chai-http";
import sinon from "sinon";
import app from "../..";
import * as utils from "../../../utils";

chai.use(chaiHttp);
const expect = chai.expect;
const request = chai.request;

describe("POST /payments", () => {
  before(() => {
    process.env.DB_FILE_NAME = ":memory:";
  });

  it("should return 400 Bad Request when data is wrong", (done) => {
    const invalidPaymentData = {
      name: "John Doe",
      email: "not-an-email",
      amount: "invalid-amount",
    };

    request(app)
      .post("/api/v1/payments")
      .send(invalidPaymentData)
      .then((res) => {
        expect(res).to.have.status(400);
        done();
      })
      .catch((err) => done(err));
  });

  it("should add a payment to the database", (done) => {
    const paymentData = {
      name: "John Doe",
      email: "john.doe@example.com",
      amount: 100,
    };

    request(app)
      .post("/api/v1/payments")
      .send(paymentData)
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.have.keys([
          ...Object.keys(paymentData),
          "id",
          "status",
          "reference",
          "access_code",
          "authorization_url",
          "created_at",
          "updated_at",
        ]);
        done();
      })
      .catch((err) => done(err));
  });

  it("should have an initial status of pending", (done) => {
    const paymentData = {
      name: "John Doe",
      email: "john.doe@example.com",
      amount: 100,
    };

    request(app)
      .post("/api/v1/payments")
      .send(paymentData)
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res.body.data.status).to.equal("pending");
        done();
      })
      .catch((err) => done(err));
  });

  it("should have stored payments", (done) => {
    const paymentData = {
      name: "John Doe",
      email: "john.doe@example.com",
      amount: 100,
    };

    request(app)
      .get("/api/v1/payments")
      .then((res) => {
        expect(res.body.data).to.be.an("array");
        expect(res.body.data).to.not.be.empty;
        done();
      })
      .catch((err) => done(err));
  });
});

describe("GET /payments", () => {
  before(() => {
    process.env.DB_FILE_NAME = ":memory:";
  });

  it("should return 200 OK", (done) => {
    request(app)
      .get("/api/v1/payments")
      .then((res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should return 404 Not Found", (done) => {
    request(app)
      .get("/api/v1/payments/1")
      .then((res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should return an array of payments", (done) => {
    request(app)
      .get("/api/v1/payments")
      .then((res) => {
        expect(res.body.data).to.be.an("array");
        done();
      });
  });
});

describe("POST /payments/webhook", () => {
  let verifySignatureStub: sinon.SinonStub;

  before(() => {
    verifySignatureStub = sinon.stub(utils, "verifySignature").returns(true);
  });

  after(() => {
    verifySignatureStub.restore();
  });

  it("should return 400 Bad Request when signature is invalid", (done) => {
    verifySignatureStub.returns(false);

    request(app)
      .post("/api/v1/payments/webhook")
      .then((res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it("should return 200 OK when signature is correct", (done) => {
    verifySignatureStub.returns(true);

    request(app)
      .post("/api/v1/payments/webhook")
      .send({
        data: {
          reference: "reference",
          amount: 100,
          status: "success",
        },
      })
      .then((res) => {
        expect(res).to.have.status(200);
        done();
      });
  }).timeout(5000);
});
