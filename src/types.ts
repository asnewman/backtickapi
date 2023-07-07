export interface Post {
	id: string
	title: string
	author: string
	content: string
	votes: number
	comments: Comment[]
	datePosted: string
}

export interface Comment {
	author: string
	content: string
	votes: number
	datePosted: string
	depth: number
	children: Comment[]
}
