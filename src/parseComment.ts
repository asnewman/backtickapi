import { Comment } from "./types";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const turndownService = new TurndownService();
turndownService.use(gfm);

function parseComment(
  $: cheerio.CheerioAPI,
  element: cheerio.Element,
  showHtmlComments: boolean,
): Comment {
  const children: Comment[] = [];

  const articleId = $(element).find("article").first().attr("id");
  console.log(articleId)

  if (articleId) {
    const childElements = $(`#${articleId} > ol > li`);

    childElements.each(function (_, elem) {
      children.push(parseComment($, elem as cheerio.Element, showHtmlComments));
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

export default parseComment;
