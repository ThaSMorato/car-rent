const http = require("http");
const CarService = require("./service/carService");
const { join } = require("path");

const DEFAULT_PORT = 3000;
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const carsDatabase = join(__dirname, "../database", "cars.json");

const createCarService = () => ({ carService: new CarService({ car: carsDatabase }) });

class Api {
  constructor(dependencies = createCarService()) {
    this.carService = dependencies.carService;
  }

  createRoutes() {
    return {
      default: (request, response) => {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write("Hello world");
        return response.end();
      },
      "/avaiableCar:post": async (request, response) => {
        for await (const data of request) {
          const { carCategory } = JSON.parse(data);
          const result = this.carService.getAvailableCar(carCategory);
          response.write(JSON.stringify({ result }));
          return response.end();
        }
      },
      "/finalPrice:post": async (request, response) => {
        for await (const data of request) {
          const { customer, numberOfDays, carCategory } = JSON.parse(data);
          const result = this.carService.calculateFinalPrice({
            customer,
            carCategory,
            numberOfDays,
          });
          response.write(JSON.stringify({ result }));
          return response.end();
        }
      },
      "/rent:post": async (request, response) => {
        for await (const data of request) {
          const { customer, numberOfDays, carCategory } = JSON.parse(data);
          const result = await this.carService.rent({
            customer,
            carCategory,
            numberOfDays,
          });
          response.write(JSON.stringify({ result }));
          return response.end();
        }
      },
    };
  }

  handler(request, response) {
    const { url, method } = request;
    const routeKey = `${url}:${method.toLowerCase()}`;

    const routes = this.createRoutes();
    const chosen = routes[routeKey] || routes.default;

    response.writeHeader(200, DEFAULT_HEADERS);

    return chosen(request, response);
  }

  createServer(port = DEFAULT_PORT) {
    const app = http.createServer(this.handler.bind(this)).listen(port, () => console.log("teste"));

    return app;
  }
}

// adiciono NODE_ENV para teste (adicionado no Package.json)
if (process.env.NODE_ENV !== "test") {
  const api = new Api();
  api.createServer();
}

module.exports = (dependencies) => new Api(dependencies);
