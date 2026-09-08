import swaggerJsdoc from "swagger-jsdoc";

const opcoes = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Biblioteca", version: "1.0.0" },
  },
  apis: ["./app.js"],
};

export default swaggerJsdoc(opcoes);