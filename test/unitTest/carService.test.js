const { describe, it, before, beforeEach, after, afterEach } = require("mocha");
const CarService = require("../../src/service/carService");
const Transaction = require("../../src/entities/transaction");
const { join } = require("path");

const sinon = require("sinon");

const { expect } = require("chai");

const carsDatabase = join(__dirname, "../../database", "cars.json");

const mocks = {
  validCarCategory: require("../mocks/valid-car-category.json"),
  validCar: require("../mocks/valid-car.json"),
  validCustomer: require("../mocks/valid-customer.json"),
};

describe("CarService Suite Tests", () => {
  let carService;
  let sandbox;

  before(() => {
    carService = new CarService({
      car: carsDatabase,
    });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should retrieve a random position from array", () => {
    const data = [0, 1, 2, 3, 4];

    const result = carService.getRandomPositionFromArray(data);

    expect(result).to.be.lte(data.length).and.be.gte(0);
  });

  it("should chose the first id from carIds in carCategory", () => {
    const carCategory = mocks.validCarCategory;

    const carIndex = 0;

    sandbox.stub(carService, carService.getRandomPositionFromArray.name).returns(carIndex);

    const result = carService.chooseRandomCar(carCategory);
    const expected = carCategory.carIds[carIndex];

    expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok;
    expect(result).to.be.equal(expected);
  });

  it("given a car category, it should return a random available car", async () => {
    const car = mocks.validCar;
    const carCategory = Object.create(mocks.validCarCategory);
    carCategory.carId = [car.id];

    sandbox.stub(carService.carRepository, carService.carRepository.find.name).resolves(car);

    sandbox.spy(carService, carService.chooseRandomCar.name);
    const result = await carService.getAvailableCar(carCategory);

    expect(carService.chooseRandomCar.calledOnce).to.be.ok;
    expect(carService.carRepository.find.calledOnce).to.be.ok;
    expect(result).to.be.deep.equal(car);
  });

  it("given a carCategory, customer and numberOfDays it shoul calculate final amount in real", async () => {
    const customer = Object.create(mocks.validCustomer);

    customer.age = 50;

    const carCategory = Object.create(mocks.validCarCategory);

    carCategory.price = 37.6;

    const numberOfDays = 5;

    sandbox.stub(carService, "taxesBasedOnAge").get(() => [{ from: 40, to: 50, then: 1.3 }]);

    const expected = carService.currencyFormat.format(244.4);

    const result = carService.calculateFinalPrice({ customer, carCategory, numberOfDays });

    expect(result).to.be.deep.equal(expected);
  });

  it("given a customer and a car category it should return a transaction receipt", async () => {
    const car = mocks.validCar;

    const customer = Object.create(mocks.validCustomer);

    customer.age = 20;

    const carCategory = { ...mocks.validCarCategory, price: 37.6, carsId: [car.id] };

    const numberOfDays = 5;

    const dueDate = "10 de novembro de 2020";

    const now = new Date(2020, 10, 5);

    sandbox.useFakeTimers(now.getTime());

    sandbox.stub(carService.carRepository, carService.carRepository.find.name).resolves(car);

    const expectedAmount = carService.currencyFormat.format(206.8);
    const result = await carService.rent({ customer, carCategory, numberOfDays });

    const expected = new Transaction({
      customer,
      amount: expectedAmount,
      car,
      dueDate,
    });
    expect(result).to.be.deep.equal(expected);
  });
});
