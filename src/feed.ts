import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { FeedTopic } from "./types";

const router = express.Router();

router.get("", async (_, res) => {
  const response = await axios.get("https://tildes.net")
  const $ = cheerio.load(response.data);

  const feed: FeedTopic[] = []

  $("article.topic").each((_, topicElement) => {
    const group = $(topicElement).find(".link-group").text().replace("~", "")
    const link = $(topicElement).find("header > a").attr("href")
    const commentLink = $(topicElement).find(".topic-info-comments > a").attr("href")
    const id = commentLink.split("/")[2] 
    const title = $(topicElement).find(".topic-title > a").text()
    const author = $(topicElement).find(".topic-info-source > a").text()
    const votes = parseInt($(topicElement).find(".topic-voting-votes").text(), 10) || 0
    const datePosted = $(topicElement).find("time").attr("datetime")

    feed.push({
      id,
      group,
      link,
      title,
      author,
      votes,
      datePosted
    })
  })

  res.json(feed)
})

export default router;
