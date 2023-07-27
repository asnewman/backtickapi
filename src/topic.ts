import { Comment, Topic } from "./types";
import axios from "axios";
import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const turndownService = new TurndownService();
turndownService.use(gfm);

const router = express.Router();

router.get("/:group/:postId", async (req: Request, res: Response) => {
  try {
    const { group, postId } = req.params;
    const { commentOrder } = req.query;
    const url = `https://tildes.net/~${group}/${postId}${
      commentOrder ? `?comment_order=${commentOrder}` : ""
    }`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const comments: Comment[] = [];

    const topLevelComments = $(
      ".topic-comments > .comment-tree > .comment-tree-item",
    );

    topLevelComments.each(function (i, element) {
      comments.push(parseComment($, element));
    });

    const post: Topic = {
      id: postId,
      group,
      link: $(".topic-full-link > a").attr("href") || "",
      title: $("h1").first().text(),
      author: $(".topic-full-byline > a").text(),
      content: turndownService.turndown($(".topic-full-text").html() || ""),
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

function parseComment($, element: cheerio.Element): Comment {
  const children: Comment[] = [];

  const articleId = $(element).find("article").first().attr("id");

  if (articleId) {
    const childElements = $(`#${articleId} > ol > li`);

    childElements.each(function (i, elem) {
      children.push(parseComment($, elem));
    });
  }

  const id: string = $(`#${articleId}`).attr("id").replace("comment-", "");
  const author: string = $(`#${articleId} > div > header > a.link-user`).text();
  const content: string = turndownService.turndown(
    $(`#${articleId} > div > div.comment-text`).html() || "",
  );
  const rawVotes = $(`#${articleId} > div:nth-child(1) > menu:nth-child(3)`)
    .text()
    .trim()
    .replace("Vote (", "")
    .replace(")", "");
  const votes = parseInt(rawVotes, 10) || 0;
  const datePosted =
    ($(`#${articleId} > div > header > div > time.comment-posted-time`).attr(
      "datetime",
    ) as string) || "";
  const depth = parseInt($(`#${articleId}`).attr("data-comment-depth"), 10);

  return { id, author, content, votes, datePosted, children, depth };
}

export default router;
