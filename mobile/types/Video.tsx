import { User } from "./User";

export interface IVideo {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  duration: number;
  createdAt: Date;
  comments: string[];
  likes: string[];
  user_id: string;
  user: User;
}
