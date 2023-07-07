export interface Post {
	id: string
	link: string
	title: string
	author: string
	content: string
	votes: number
	comments: Comment[]
	datePosted: string
}

export interface Comment {
	id: string
	author: string
	content: string
	votes: number
	datePosted: string
	depth: number
	children: Comment[]
}
