import * as cheerio from "cheerio";
import { Profile, ProfileComment, ProfileTopic } from "./types";
import express from "express";
import { gfm } from "turndown-plugin-gfm";
import TurndownService from "turndown";
import { getAxios, options } from "./http";

const turndownService = new TurndownService();
turndownService.use(gfm);

const axios = getAxios()

const router = express.Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const { htmlComments } = req.query;
  const showHtmlComments = htmlComments === "true";
  const url = `https://tildes.net/user/${username}`;
  const response = await axios.get(url, options);
  const $ = cheerio.load(response.data);

  const comments: ProfileComment[] = [];
  const topics: ProfileTopic[] = [];

  getComments();
  getTopics();

  const profile: Profile = {
    username,
    recentActivity: {
      comments,
      topics,
    },
    registered: $("#sidebar > dl > dd").text(),
    bio: $(".user-bio > dd").text(),
  };

  return res.json(profile);

  function getComments() {
    $("article.comment").each((_i, commentElement) => {
      const id = $(commentElement).attr("id").replace("comment-", "");
      const author = $(commentElement).find(".link-user").first().text();
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
      const content = showHtmlComments
        ? rawContent?.replace("\n\n        ", "")
        : turndownService.turndown(rawContent);
      const link = $(commentElement)
        .find(".comment-nav-link")
        .first()
        .attr("href");
      const group = link.split("/")[1].replace("~", "");
      const postId = link.split("/")[2];

      comments.push({
        id,
        group,
        author,
        content,
        votes,
        datePosted,
        postId,
      });
    });
  }

  function getTopics() {
    $("article.topic").each((_, topicElement) => {
      const title = $(topicElement).find(".topic-title > a").text();
      const commentLink = $(topicElement)
        .find(".topic-info-comments > a")
        .attr("href");
      const id = commentLink.split("/")[2];
      const group = commentLink.split("/")[1];
      const votes = parseInt(
        $(topicElement).find(".topic-voting-votes").text(),
        10,
      );
      const datePosted = $(topicElement).find("time").attr("datetime");

      topics.push({
        id,
        group,
        votes,
        datePosted,
        title,
      });
    });
  }
});

export default router;
