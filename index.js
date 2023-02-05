require("dotenv").config();
const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const app = express();
const xss = require("xss-clean");

const UserRoute = require("./src/Routes/UserRoute");
const RoleRoute = require("./src/Routes/RoleRoute");
const DepartmentRoute = require("./src/Routes/DepartmentRoute");
const LocationRoute = require("./src/Routes/LocationRoute");
const SublocationRoute = require("./src/Routes/SublocationRoute");
const RaiseRequestRoute = require("./src/Routes/RaiseRequestRoute");


process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

// Getting data in json format
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));
app.set("trust proxy", true);

//cookieSession
app.use(
  cookieSession({
    name: "user-session",
    signed: false,
    secure: true,
  })
);

//Setting up cors
var cors = require("cors");
var corsOption = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"],
};
app.use(cors(corsOption));

// Data sanitization against XSS
app.use(xss());

app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
    parameterLimit: 50000,
  })
);

//swagger
// const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("./swagger_output.json");

// app.use(
//   `api/docs/v1`,
//   function (req, res, next) {
//     swaggerDocument.host = req.get("host");
//     req.swaggerDoc = swaggerDocument;
//     next();
//   },
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, options)
// );

app.use('/role',RoleRoute);
app.use('/user',UserRoute);
app.use('/department',DepartmentRoute);
app.use('/location',LocationRoute);
app.use('/sublocation',SublocationRoute);
app.use('/raiserequest',RaiseRequestRoute);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Listening on port`, PORT);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});