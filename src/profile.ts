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
    const group = $(commentElement)
      .find(".comment-nav-link")
      .first()
      .attr("href")
      .split("/")[1]
      .replace("~", "");

    comments.push({
      id,
      group,
      author,
      content,
      votes,
      datePosted,
    });
  });

  const profile: Profile = {
    username: "text",
    comments: comments,
  };

  res.json(profile);
});

export default router;
