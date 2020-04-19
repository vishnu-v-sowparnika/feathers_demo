// Initializes the `testauth` service on path `/testauth`
const { Testauth } = require("./testauth.class");
const hooks = require("./testauth.hooks");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"),
  };
  const sequalize_client = app.get("sequelizeClient");
  // Initialize our service with any options it requires
  app.use("/testauth", new Testauth(options, app), (req, res) => {
    let result = app.service("users").find({
      query: {
        $limit: 1,
        email: "vishnu94sowparnika@gmail.com",
      },
    });
    console.log("result in query", result);
    let query = "select * from users";
    sequalize_client.query(query).then((result1) => {
      res.send(result1);
    });
  });

  // Get our initialized service so that we can register hooks
  const service = app.service("testauth");

  service.hooks(hooks);
};
