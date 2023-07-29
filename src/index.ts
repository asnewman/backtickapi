import express from "express";
import topicRouter from "./topic";
import profileRouter from "./profile";
import feedRouter from "./feed";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("Welcome to the Backtick API!");
});

app.use("/profile", profileRouter);
app.use("/topic", topicRouter);
app.use("/post", topicRouter);
app.use("/feed", feedRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
