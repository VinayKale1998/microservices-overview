const express = require("express");
const router = require("express").Router();
const axios = require("axios");
const bodyparser = require("body-parser");

const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(bodyparser.json());
app.use(cors());

app.post("/events", async (req, res) => {
  const event = req.body;
  console.log(event);

  try {
    await Promise.all([
      axios.post("http://posts-clusterip-srv/events", event),
      axios.post("http://comments-clusterip-srv:4002/events", event),
      axios.post("http://query-clusterip-srv:4003/events", event),
      axios.post("http://moderation-clusterip-srv:4004/events", event),
    ]);
  } catch (err) {
    console.log(err.message);
  }

  return res.status(201).send({ message: "events emitted" });
});

//3005
const PORT = process.env.PORT;

app.listen(PORT, (err) => {
  if (err) console.log("Error while spawning a server");
  else {
    console.log(`Server successfully listening to the port ${PORT}`);
    console.log(" event-bus service");
  }
});
