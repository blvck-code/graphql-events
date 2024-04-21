require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type User {
          _id: ID!
          email: String!
          password: String
          createdEvents: [Event!]
        }

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc };
            });
          })
          .catch((err) => {
            throw err;
          });
        return events;
      },
      createEvent: ({ eventInput }) => {
        const event = new Event({
          title: eventInput.title,
          description: eventInput.description,
          price: +eventInput.price,
          date: new Date(eventInput.date),
            creator: '66255a9731febab51d16c426'
        });
        let createdEvent;
        return event
          .save()
          .then((result) => {
              console.log('Result ==>>', result)
              createdEvent = { ...result._doc }
              return User.findById('66255a9731febab51d16c426')
          })
            .then(user => {
                if (!user) {
                    throw new Error('User not found!')
                }
                user.createdEvents.push(event)
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: ({ userInput }) => {
          return User.findOne({ email: userInput.email}).then(user => {
              if (user) {
                  throw new Error('User already exist!')
              }
              return bcrypt
                  .hash(userInput.password, 12)
          })
          .then((hashedPass) => {
            const user = new User({
              email: userInput.email,
              password: hashedPass,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
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
