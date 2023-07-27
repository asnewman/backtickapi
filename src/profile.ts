import axios from "axios";
import * as cheerio from "cheerio";
import { Profile, ProfileComment } from "./types";
import express from "express";
import { gfm } from "turndown-plugin-gfm";
import TurndownService from "turndown";

const turndownService = new TurndownService();
turndownService.use(gfm);

const router = express.Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const url = `https://tildes.net/user/${username}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const comments: ProfileComment[] = [];
  const topics: ProfileTopic[] = [];

  $("article.comment").each((_i, commentElement) => {
    const id = $(commentElement).attr("id").replace("comment-", "");
    const author = $(commentElement).find(".link-user").text();
    const datePosted = $(commentElement).find("time").attr("datetime");
    const votes =
      parseInt(
        $(commentElement)
          .find("menu")
          .first()
          .text()
          .replace("Vote ", "")
          .replace("(", "")
          .replace(")", ""),
        10,
      ) || 0;
    const rawContent = $(commentElement).find(".comment-text").html();
    const content = turndownService.turndown(rawContent);
    const link = $(commentElement)
      .find(".comment-nav-link")
      .first()
      .attr("href")
    const group = link.split("/")[1]
      .replace("~", "");
    const postId = link.split("/")[2];

    comments.push({
      id,
      group,
      author,
      content,
      votes,
      datePosted,
      postId
    });
  });

  const profile: Profile = {
    username: "text",
    comments,
    topics
  };

  res.json(profile);
});

export default router;
