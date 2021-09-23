const { expect } = require("chai");
const { describe, it, before, beforeEach, after, afterEach } = require("mocha");
const request = require("supertest");
const app = require("../../src/api");
const Transaction = require("../../src/entities/transaction");

const mocks = {
  validCarCategory: require("../mocks/valid-car-category.json"),
  validCar: require("../mocks/valid-car.json"),
  validCustomer: require("../mocks/valid-customer.json"),
};

describe("API SUIT TEST", () => {
  describe("/default", () => {
    it("should request the default and return HTTP status 200", async () => {
      await request(app).get("/default").expect(200);
    });
    it("should request the default and return content-type html", async () => {
      await request(app).get("/default").expect("Content-Type", /html/);
    });
  });
  describe("/avaiableCar", () => {
    it("should request the avaiableCar and return HTTP status 200", async () => {
      await request(app).get("/avaiableCar").expect(200);
    });
    it("should request the avaiableCar and return content-type json", async () => {
      await request(app).get("/avaiableCar").expect("Content-Type", /json/);
    });
  });
  describe("/finalPrice", () => {
    it("should send the finalPrice and return HTTP status 200", async () => {
      await request(app).post("/finalPrice").expect(200).done;
    });
    it("should send the finalPrice and return content-type json", async () => {
      await request(app).post("/finalPrice").expect("Content-Type", /json/).done;
    });
    it("should send the finalPrice the params and get back the price", async () => {
      const customer = Object.create(mocks.validCustomer);

      customer.age = 50;

      const carCategory = Object.create(mocks.validCarCategory);

      carCategory.price = 37.6;

      const numberOfDays = 5;

      await request(app)
        .post("/finalPrice")
        .send({ customer, numberOfDays, carCategory })
        .expect({ price: "R$ 244,40" }).done;
    });
  });
  describe("/rent", () => {
    it("should send the rent and return HTTP status 200", async () => {
      await request(app).post("/rent").expect(200).done;
    });
    it("should send the rent and return content-type json", async () => {
      await request(app).post("/rent").expect("Content-Type", /json/).done;
    });
    it("should send the rent the params and get back the transaction", async () => {
      const car = mocks.validCar;

      const customer = Object.create(mocks.validCustomer);

      customer.age = 20;

      const carCategory = { ...mocks.validCarCategory, price: 37.6, carsId: [car.id] };

      const numberOfDays = 5;

      const now = new Date();
      now.setDate(now.getTime() + numberOfDays);

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      const dueDate = now.toLocaleDateString("pt-br", options);

      await request(app)
        .post("/rent")
        .send({ customer, numberOfDays, carCategory })
        .then(({ body }) => {
          expect(typeof body).to.be.equal(typeof new Transaction());
        });
    });
  });
});
