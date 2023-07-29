import express from "express";
import * as cheerio from "cheerio";
import { FeedTopic } from "./types";
import { getAxios, options } from "./http";

const router = express.Router();

const axios = getAxios();

router.get("", async (req, res) => {
  const { order, period } = req.query;
  let params = "";

  if (!order) {
    params += `?order=activity`;
  } else {
    params += `?order=${order}`;
  }

  if (period) {
    params += `&period=${period}`;
  }

  const url = "https://tildes.net" + params;

  const response = await axios.get(url, options);
  const $ = cheerio.load(response.data);

  const feed: FeedTopic[] = [];

  $("article.topic").each((_, topicElement) => {
    const group = $(topicElement).find(".link-group").text().replace("~", "");
    const link = $(topicElement).find("header > a").attr("href");
    const commentLink = $(topicElement)
      .find(".topic-info-comments > a")
      .attr("href");
    const id = commentLink.split("/")[2];
    const title = $(topicElement).find(".topic-title > a").text();
    const author = $(topicElement).find(".topic-info-source > a").text();
    const votes =
      parseInt($(topicElement).find(".topic-voting-votes").text(), 10) || 0;
    const datePosted = $(topicElement).find("time").attr("datetime");

    feed.push({
      id,
      group,
      link,
      title,
      author,
      votes,
      datePosted,
    });
  });

  res.json(feed);
});

export default router;
