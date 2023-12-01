import bodyParser from "body-parser";
import cors from "cors";
import { randomBytes } from "crypto";
import {} from "dotenv/config";
import express, { Router } from "express";
import axios from "axios";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const commentsByPostId = {};
app.get("/posts/:id/comments", (req, res) => {
  const response = commentsByPostId[req.params.id] || [];

  res.status(200).send(response);
});

app.post("/posts/:id/comments", async (req, res) => {
  console.log("sfsf");
  const id = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];
  comments.push({
    id,
    content,
    status: "pending",
    postId: req.params.id,
  });

  commentsByPostId[req.params.id] = comments;

  try {
    await axios.post("http://event-bus-srv:4005/events", {
      type: "commentCreated",
      data: {
        id: id,
        content,
        postId: req.params.id,
        status: "pending",
      },
    });
  } catch (err) {
    console.log(err.message);
  }
  return res.status(201).send({ message: "Comment added" });
});

app.post("/events", async (req, res) => {
  console.log("received an event", req.body.data);
  console.log(commentsByPostId);
  const { type, data } = req.body;

  if (type === "commentModerated") {
    const comments = commentsByPostId[data.postId] || [];

    console.log(data);

    if (comments.length == 0) comments.push(data);
    else {
      const comment = comments.find((comment) => comment.id === data.id);
      comment.status = data.status;
    }

    try {
      await axios.post("http://event-bus-srv:4005/events", {
        type: "commentUpdated",
        data,
      });
    } catch (err) {
      return res.status(500).send({ message: "oops something went wrong!" });
    }
  }
  return res.status(200).send();
});

const PORT = process.env.PORT || 4002;

app.listen(PORT, (err) => {
  if (err) console.log(err.message);
  else {
    console.log(`server listening to port:${PORT} `);
    console.log(" comments service");
  }
});
