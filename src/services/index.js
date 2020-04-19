const users = require('./users/users.service.js');
const testauth = require('./testauth/testauth.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(testauth);
};
