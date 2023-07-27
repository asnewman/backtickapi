import express from "express";
import topicRouter from "./topic";
import profileRouter from "./profile";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/profile", profileRouter);
app.use("/topic", topicRouter);
app.use("/post", topicRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
