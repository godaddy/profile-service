const diagnostic = require('./diagnostic');
const profile = require('./profile');

function register(app) {
  diagnostic.register(app);
  profile.register(app);
}

module.exports = {
  register
};
