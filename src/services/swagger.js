/* istanbul ignore file */
import swaggerJSDoc from 'swagger-jsdoc';
const packageJson = require('../../package.json');

function getSwaggerSpec(req) {
  // swagger definition
  const swaggerDefinition = {
    info: {
      title: 'Profile Service',
      version: packageJson.version,
      description: 'Welcome to Profile Service.'
    },
    host: getRootUrl(req),
    basePath: '/'
  };

  // options for the swagger docs
  const options = {
    swaggerDefinition, // import swaggerDefinitions
    apis: [
      './src/routes/*.js'
    ] // path to the API docs
  };

  // initialize swagger-jsdoc
  return swaggerJSDoc(options);
}

function getRootUrl(req) {
  if (!req) return 'Not Available';
  return req.headers.host;
}

export default getSwaggerSpec;
