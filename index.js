const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

require("express-async-errors");
const winston = require("winston");
const error = require("./middleware/error");
const mongoose = require("mongoose");
const config = require("config");
const morgan = require("morgan");
const helmet = require("helmet");
const logger = require("./logger");
const authenticate = require("./authentication");
const auth = require("./routes/auth");
const users = require("./routes/users");
const rentals = require("./routes/rentals");
const movies = require("./routes/movies");
const genres = require("./routes/genres");
const home = require("./routes/home");
const customers = require("./routes/customers");
const express = require("express");
const app = express();

winston.add(winston.transports.File, { filename: "logfile.log" });

app.set("view engine", "pug");
// app.set('views', './views'); //default

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`App: ${app.get("env")}`);

app.use(express.json());
// use to read form url encoded inputs and append to req body
app.use(express.urlencoded({ extended: true }));
// use to serve static contect like CSS and text files
app.use(express.static("public"));
// use to add headers to HTTP request
app.use(helmet());
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/rentals", rentals);
app.use("/api/movies", movies);
app.use("/api/genres", genres);
app.use("/", home);
app.use("/api/customers", customers);

// express error middleware
app.use(error);

// COnfiguration - reads from files under Config folder based on environment set for NODE_ENV
console.log(`Application: ${config.get("name")}`);
console.log(`Mail server: ${config.get("mail.host")}`);
// Helps in reading variables (which are not allowed to keep in config files e.g: password) set in environment
// console.log(`Mail password: ${config.get('mail.password')}`);

if (app.get("env") === "development") {
  // use to log HTTP request
  app.use(morgan("tiny"));
  // console.log('morgan enabled');
  // Works on setting DEBUG variable. E.g: export DEBUG=app:startup,app:db or app:*
  startupDebugger("Morgan Enabled...");
}

//Db work
dbDebugger("Connected to database");

// app.use(logger);
// app.use(authenticate);

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

mongoose
  .connect("mongodb://localhost/vidly-1")
  .then(() => console.log("Connected..."))
  .catch((err) => console.error("error", err));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Connection is started at ${port}...`));
