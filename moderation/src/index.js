import express, { Router } from "express";
import axios from "axios";
import bodyParser from "body-parser";
import {} from "dotenv/config";
import { randomBytes } from "crypto";
import cors from "cors";

const app = express();
app.use(cors());
// app.use(cors());

app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  console.log(req.body);
  const { type, data } = req.body;

  if (type === "commentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";

    try {
      await axios.post("http://event-bus-srv:4005/events", {
        type: "commentModerated",
        data: {
          id: data.id,
          postId: data.postId,
          status,
          content: data.content,
        },
      });
    } catch (err) {
      return res.status(500).send({ message: "Oops something went wrong" });
    }

    return res.send();
  }
});

app.listen(process.env.PORT, (err) => {
  if (err) console.log(err.message);
  else {
    console.log(`App is listening to port ${process.env.PORT}`);
  }
  console.log(" moderation service");
});
