const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());

app.use(cors());

const posts = {};
app.get("/posts", (req, res) => {
  return res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  if (type === "postCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }
  if (type === "commentCreated") {
    console.log(data);
    const { id, content, postId, status } = data;
    const post = posts[postId];
    console.log(post);
    post.comments.push({ id, content, status });
  }
  if (type === "commentUpdated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    console.log(data);
    const comment = post.comments.find((item) => item.id === id);
    comment.status = status;
    comment.content = content;
  }

  console.log(Object.values(posts));
  res.status(200).send();
});

const PORT = process.env.PORT;

app.listen(PORT, (err) => {
  if (err) console.log("err");
  else {
    console.log(`Listening on port ${PORT}`);
    console.log(" query service");
  }
});
