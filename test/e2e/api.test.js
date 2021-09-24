const { describe, it, before, beforeEach, after, afterEach } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon");

const { join } = require("path");

const CarService = require("./../../src/service/carService");
const SERVER_TEST_PORT = 4000;

const mocks = {
  validCarCategory: require("../mocks/valid-car-category.json"),
  validCar: require("../mocks/valid-car.json"),
  validCustomer: require("../mocks/valid-customer.json"),
};

const carsDatabase = join(__dirname, "../../database", "cars.json");

describe("API SUIT TEST", () => {
  let app = {};
  let sandbox = {};

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  before(() => {
    const api = require("../../src/api");
    const carService = new CarService({
      cars: carsDatabase,
    });
    const instance = api({ carService });

    app = {
      instance,
      server: instance.createServer(SERVER_TEST_PORT),
    };
  });

  describe("/default", () => {
    it("should request the default and return HTTP status 200", async () => {
      await request(app.server).get("/default").expect(200);
    });
    it("should request the default and return content-type html", async () => {
      await request(app.server).get("/default").expect("Content-Type", /html/);
    });
  });
  describe("/avaiableCar", () => {
    it("should request the avaiableCar and return HTTP status 200", async () => {
      await request(app.server).post("/avaiableCar").expect(200).done;
    });
    it("should request the avaiableCar and return content-type json", async () => {
      await request(app.server).post("/avaiableCar").expect("Content-Type", /json/).done;
    });
    it("Given a carCategory, it should return a random car", async () => {
      const car = { ...mocks.validCar };
      const carCategory = {
        ...mocks.validCarCategory,
        carIds: [car.id],
      };

      sandbox
        .stub(app.instance.carService, app.instance.carService.getRandomPositionFromArray.name)
        .returns(0);

      const expected = {
        result: car,
      };

      await request(app.server).post("/avaiableCar").send({ carCategory }).expect(expected).done;
    });
  });
  describe("/finalPrice", () => {
    it("should send the finalPrice and return HTTP status 200", async () => {
      await request(app.server).post("/finalPrice").expect(200).done;
    });
    it("should send the finalPrice and return content-type json", async () => {
      await request(app.server).post("/finalPrice").expect("Content-Type", /json/).done;
    });
    it("should send the finalPrice the params and get back the price", async () => {
      const car = { ...mocks.validCar };
      const customer = {
        ...mocks.validCustomer,
        age: 50,
      };

      const carCategory = {
        ...mocks.validCarCategory,
        price: 37.6,
      };

      const numberOfDays = 5;

      const body = {
        customer,
        carCategory,
        numberOfDays,
      };

      sandbox
        .stub(
          app.instance.carService.carRepository,
          app.instance.carService.carRepository.find.name
        )
        .resolves(car);

      const expected = {
        result: app.instance.carService.currencyFormat.format(244.4),
      };

      await request(app.server).post("/finalPrice").send(body).expect(expected).done;
    });
  });
  describe("/rent", () => {
    it("should send the rent and return HTTP status 200", async () => {
      await request(app.server).post("/rent").expect(200).done;
    });
    it("should send the rent and return content-type json", async () => {
      await request(app.server).post("/rent").expect("Content-Type", /json/).done;
    });
    it("should send the rent the params and get back the transaction", async () => {
      const car = mocks.validCar;
      const carCategory = {
        ...mocks.validCarCategory,
        price: 37.6,
        carIds: [car.id],
      };

      const customer = {
        ...mocks.validCustomer,
        age: 20,
      };

      const numberOfDays = 5;

      const expectedAmount = app.instance.carService.currencyFormat.format(206.8);
      const dueDate = "10 de novembro de 2020";

      const body = {
        customer,
        carCategory,
        numberOfDays,
      };

      const now = new Date(2020, 10, 5);
      sandbox.useFakeTimers(now.getTime());

      sandbox
        .stub(
          app.instance.carService.carRepository,
          app.instance.carService.carRepository.find.name
        )
        .resolves(car);

      const expected = {
        result: {
          customer,
          car,
          amount: expectedAmount,
          dueDate,
        },
      };

      await request(app.server).post("/rent").send(body).expect(expected).done;
    });
  });
});
