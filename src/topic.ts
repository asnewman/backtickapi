import { Comment, Topic } from "./types";
import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { getAxios, options } from "./http";
import parseComment from "./parseComment";

const turndownService = new TurndownService();
turndownService.use(gfm);

const router = express.Router();

const axios = getAxios();

router.get("/:group/:postId", async (req: Request, res: Response) => {
  try {
    const { group, postId } = req.params;
    const { commentOrder, htmlComments } = req.query;
    const showHtmlComments = htmlComments === "true";
    const url = `https://tildes.net/~${group}/${postId}${
      commentOrder ? `?comment_order=${commentOrder}` : ""
    }`;
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    const comments: Comment[] = [];

    const topLevelComments = $(
      ".topic-comments > .comment-tree > .comment-tree-item",
    );

    topLevelComments.each(function (_, element) {
      comments.push(parseComment($, element, showHtmlComments));
    });

    const post: Topic = {
      id: postId,
      group,
      link: $(".topic-full-link > a").attr("href") || "",
      title: $("h1").first().text(),
      author: $(".topic-full-byline > a").text(),
      content: showHtmlComments
        ? $(".topic-full-text").html()
        : turndownService.turndown($(".topic-full-text").html() || ""),
      votes: parseInt($(".topic-voting-votes").text()) || 0,
      datePosted:
        ($(".topic-full-byline > time").attr("datetime") as string) || "",
      comments,
    };

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

export default router;
