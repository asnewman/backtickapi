import * as cheerio from "cheerio";
import express from "express";
import { gfm } from "turndown-plugin-gfm";
import TurndownService from "turndown";
import { getAxios, options } from "./http";
import { Comment } from "./types";
import parseComment from "./parseComment";

const turndownService = new TurndownService();
turndownService.use(gfm);

const axios = getAxios();

const router = express.Router();

router.get("/:group/:topic/:id", async (req, res) => {
  const { group, topic, id } = req.params;
  const { htmlComments } = req.query;
  const showHtmlComments = htmlComments === "true";
  const url = `https://tildes.net/~${group}/${topic}`;
  const response = await axios.get(url, options);
  const $ = cheerio.load(response.data);

  const comment: Comment = parseComment(
    $,
    $(`#comment-${id}`).parent()[0],
    showHtmlComments,
  );

  return res.json(comment);
});

export default router;
