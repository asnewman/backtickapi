export type FeedTopic = Omit<Topic, "content" | "comments">;
export interface Group {
  feed: Omit<FeedTopic, "group">[];
  description: string;
  subgroups?: string[];
}

export interface Topic {
  id: string;
  group: string;
  link: string;
  title: string;
  author: string;
  content: string;
  votes: number;
  comments: Comment[];
  datePosted: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  votes: number;
  datePosted: string;
  depth: number;
  children: Comment[];
}

export type ProfileComment = Omit<Comment, "depth" | "children"> & {
  postId: string;
  group: string;
};

export type ProfileTopic = Omit<
  Topic,
  "link" | "author" | "comments" | "content"
>;

export interface Profile {
  username: string;
  recentActivity: {
    comments: ProfileComment[];
    topics: ProfileTopic[];
  };
  registered: string;
}
