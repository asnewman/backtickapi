import { Comment, Topic } from "./types";
import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { getAxios, options } from "./http";

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

    topLevelComments.each(function (i, element) {
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

function parseComment(
  $,
  element: cheerio.Element,
  showHtmlComments: boolean,
): Comment {
  const children: Comment[] = [];

  const articleId = $(element).find("article").first().attr("id");

  if (articleId) {
    const childElements = $(`#${articleId} > ol > li`);

    childElements.each(function (i, elem) {
      children.push(parseComment($, elem, showHtmlComments));
    });
  }

  const id: string = $(`#${articleId}`).attr("id").replace("comment-", "");
  const author: string = $(`#${articleId} > div > header > a.link-user`).text();
  const content: string = showHtmlComments
    ? $(`#${articleId} > div > div.comment-text`)
        .html()
        ?.replace("\n\n        ", "")
    : turndownService.turndown(
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
