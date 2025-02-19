const { authenticate } = require("@feathersjs/authentication").hooks;
const checkPermissions = require("feathers-permissions");
const {
  hashPassword,
  protect,
} = require("@feathersjs/authentication-local").hooks;

module.exports = {
  before: {
    all: [],
    find: [
      authenticate("jwt"),
      checkPermissions({
        roles: ["admin"],
      }),
    ],
    get: [
      authenticate("jwt"),
      checkPermissions({
        roles: ["admin", "patient"],
      }),
    ],
    create: [hashPassword("password")],
    update: [hashPassword("password"), authenticate("jwt")],
    patch: [hashPassword("password"), authenticate("jwt")],
    remove: [authenticate("jwt")],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password"),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
