import express from "express";
import * as cheerio from "cheerio";
import { Group } from "./types";
import { getAxios, options } from "./http";

const router = express.Router();

const axios = getAxios();

router.get("/:group", async (req, res) => {
  const { group } = req.params;
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

  const url = `https://tildes.net/~${group}${params}`;

  const response = await axios.get(url, options);
  const $ = cheerio.load(response.data);

  const groupResult: Group = {
    feed: [],
    description: "",
    subgroups: []
  }

  groupResult.description = $(".group-short-description").text()

  const subGroups = $("ul > ul > li > a.link-group")

  if (subGroups.length > 0) {
    subGroups.each((_, subGroup) => {
      groupResult.subgroups.push($(subGroup).text().replace('~', ""))
    })
  }

  $("article.topic").each((_, topicElement) => {
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

    groupResult.feed.push({
      id,
      link,
      title,
      author,
      votes,
      datePosted,
    });
  });

  res.json(groupResult);
});

export default router;
