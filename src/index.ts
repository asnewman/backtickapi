import { Comment, Post } from "./types"
import axios from "axios"
import * as cheerio from "cheerio"
import express, { Request, Response } from "express"
import TurndownService from "turndown"
import { gfm } from "turndown-plugin-gfm"

const app = express()
const port = 3000

const turndownService = new TurndownService()
turndownService.use(gfm)

app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.get("/scrape/:postId", async (req: Request, res: Response) => {
	try {
		const postId = req.params.postId
		const url = `https://tildes.net/~tech/${postId}` // replace with the actual URL

		const response = await axios.get(url)
		const $ = cheerio.load(response.data)

		const comments: Comment[] = []

		const topLevelComments = $(
			".topic-comments > .comment-tree > .comment-tree-item",
		)
		console.log("topLevelComments", topLevelComments.length)

		topLevelComments.each(function (i, element) {
			comments.push(parseComment($, element))
		})

		const post: Post = {
			id: "",
			title: $("h1").text(),
			author: $(".topic-full-byline > a").text(),
			content: turndownService
				.turndown($(".topic-full-text").html() || "")
				.replaceAll("\n", "  "),
			votes: parseInt($(".topic-voting-votes").text()),
			datePosted: "",
			comments,
		}

		res.json(post)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "An error occurred" })
	}
})

function parseComment($, element: cheerio.Element): Comment {
	const children: Comment[] = []

	const articleId = $(element).find("article").first().attr("id")

	if (articleId) {
		const childElements = $(`#${articleId} > ol > li`)

		console.log(
			`articleId: ${articleId} | childElements: ${childElements.length}`,
		)

		childElements.each(function (i, elem) {
			children.push(parseComment($, elem))
		})
	}

	const author: string = $(`#${articleId} > div > header > a.link-user`).text()
	const content: string = $(`#${articleId} > div > div.comment-text`)
		.text()
		.trim()
	const rawVotes = $(`#${articleId} > div > menu > li:nth-child(1) > .button`)
	// .text()
	// .replace("Vote (", "")
	// .replace(")", "")
	console.log("rawVotes", rawVotes)
	const votes = parseInt(rawVotes, 10)
	const datePosted = $(
		`#${articleId} > div > header > div > time.comment-posted-time`,
	).attr("datetime") as string

	return { author, content, votes, datePosted, children }
}

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
// #comment-97ag > div > menu > li:nth-child(1) > button
