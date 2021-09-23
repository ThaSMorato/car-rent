const http = require("http");
const CarService = require("./service/carService");
const { join } = require("path");

const carsDatabase = join(__dirname, "../database", "cars.json");

const createCarService = () => new CarService({ car: carsDatabase });

const routes = {
  default: (request, response) => {
    response.writeHeader(200, { "Content-Type": "text/html" });
    response.write("Hello world");
    return response.end();
  },
  "/avaiableCar:get": (request, response) => {
    return response.end();
  },
  "/finalPrice:post": async (request, response) => {
    for await (const data of request) {
      const { customer, numberOfDays, carCategory } = JSON.parse(data);
      const result = createCarService().calculateFinalPrice({
        customer,
        carCategory,
        numberOfDays,
      });
      response.write(JSON.stringify({ price: result }));
      return response.end();
    }
  },
  "/rent:post": async (request, response) => {
    for await (const data of request) {
      const { customer, numberOfDays, carCategory } = JSON.parse(data);
      const result = await createCarService().rent({
        customer,
        carCategory,
        numberOfDays,
      });
      response.write(JSON.stringify(result));
      return response.end();
    }
  },
};

const handler = (request, response) => {
  const { url, method } = request;
  const routeKey = `${url}:${method.toLowerCase()}`;

  const chosen = routes[routeKey] || routes.default;

  response.writeHeader(200, { "Content-Type": "application/json" });

  return chosen(request, response);
};

const app = http.createServer(handler).listen(3000, () => console.log("teste"));

module.exports = app;
