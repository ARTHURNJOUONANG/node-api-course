const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API Day 3',
      version: '1.0.0',
      description: 'Documentation API - evaluation day3',
    },
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')],
});

module.exports = swaggerSpec;
