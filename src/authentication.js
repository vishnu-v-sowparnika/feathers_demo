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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

//const debug = debug_1.default("@feathersjs/authentication/service");
class MyAuthentication extends AuthenticationService {
  constructor(app) {
    super(app);
  }
  async create(data, params) {
    //const authStrategies = ["jwt", "local"];
    return __awaiter(this, void 0, void 0, function* () {
      const authStrategies =
        params.authStrategies || this.configuration.authStrategies;
      if (!authStrategies.length) {
        throw new errors_1.NotAuthenticated(
          "No authentication strategies allowed for creating a JWT (`authStrategies`)"
        );
      }
      //  console.log('AuthStrategies in create',authStrategies);
      const authResult = yield this.authenticate(
        data,
        params,
        ...authStrategies
      );
      // console.log('Auth resullt in service .js',authResult);
      // debug("Got authentication result", authResult);
      if (authResult.accessToken) {
        return authResult;
      }
      let obj = {
        id: authResult.user.id,
        email: authResult.user.email,
        permissions: authResult.user.permissions,
      };

      const [payload, jwtOptions] = yield Promise.all([
        this.getPayload(authResult, params),

        this.getTokenOptions(authResult, params),
      ]);
      //debug("Creating JWT with", payload, jwtOptions);
      //   const accessToken = yield this.createAccessToken(payload, jwtOptions, params.secret);
      const accessToken = yield this.createAccessToken(
        obj,
        jwtOptions,
        params.secret
      );
      return Object.assign({}, { accessToken }, authResult);
    });
  }
}

module.exports = (app) => {
  //  const authentication = new AuthenticationService(app);
  const authentication = new MyAuthentication(app);
  const config = app.get("authentication");
  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new LocalStrategy());
  // authentication.register("local", new MyLocalStrategy());
  app.use("/authentication", authentication);

  app.service("authentication").hooks({
    before: {
      all(context) {
        // console.log("Context", context.params);
        //context.params.payload = context.data;
      },
    },

    after: {
      all(context) {
        //  console.log("Context in after", context.result);
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
