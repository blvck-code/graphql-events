require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const Event = require("./models/event");
const User = require("./models/user");
const Booking = require("./models/booking");
const schema = require("./graphql/schema"); // I
const resolver = require("./graphql/resolver"); // mport the schema from schema.js

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, (req, res) => {
      console.log(`Running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error ==>>", err);
  });
