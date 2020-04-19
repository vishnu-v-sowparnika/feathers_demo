const {
  AuthenticationService,
  JWTStrategy,
} = require("@feathersjs/authentication");
const { LocalStrategy } = require("@feathersjs/authentication-local");
const { expressOauth } = require("@feathersjs/authentication-oauth");
const {
  hashPassword,
  protect,
} = require("@feathersjs/authentication-local").hooks;
class MyLocalStrategy extends LocalStrategy {
  async getEntityQuery(query, params) {
    // Query for user but only include users marked as `active`
    return {
      ...query,
      //active: true,
      $limit: 1,
    };
  }
  async findEntity() {
    super.findEntity();
  }
}

module.exports = (app) => {
  const authentication = new AuthenticationService(app);
  const config = app.get("authentication");
  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new LocalStrategy());
  // authentication.register("local", new MyLocalStrategy());
  app.use("/authentication", authentication);

  app.service("authentication").hooks({
    before: {
      all(context) {
        // console.log("Context", context.data);
        context.params.payload = context.data;
      },
    },

    after: {
      all(context) {
        console.log("Context in after", context.result);
        protect(context.result.user);
        let ob = {
          accessToken: context.result.accessToken,
        };
        context.result = ob;
      },
    },
  });

  app.configure(expressOauth());
};

/*
const authentication = require("@feathersjs/authentication");
const jwt = require("@feathersjs/authentication-jwt");
const local = require("@feathersjs/authentication-local");

module.exports = function (app) {
  const config = app.get("authentication");

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local());
  app.configure(
    local({
      // support username
      name: "localmobile",
      usernameField: "cellphone",
    })
  );

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service("authentication").hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies),
        (context) => {
          const {
            params,
            params: { user = {} },
          } = context;
          params.payload = {
            userId: user.id,
            permissions: user.permissions,
          };
        },
      ],
      remove: [authentication.hooks.authenticate("jwt")],
    },
  });
};

*/
