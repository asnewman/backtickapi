import axios from "axios";
import * as cheerio from "cheerio";
import app from ".";
import { Profile, ProfileComment } from "./types";

app.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  const url = `https://tildes.net/user/${username}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const comments: ProfileComment[] = []

  $("article.comment").each((_i, commentElement) => {
    const datePosted = $(commentElement).find('time').attr("datetime")
    comments.push({
      id: "",
      author: "",
      content: "",
      votes: 0,
      parentId: "",
      datePosted
    })
  })

  const profile: Profile = {
    username: "text",
    comments: comments
  }

  res.json(profile);
});
