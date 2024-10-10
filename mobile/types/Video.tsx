export interface IVideo {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  duration: number;
  createdAt: Date;
  comments: string[];
  likes: number;
  user_id: string;
}

export interface ListVideoResponse {
  total_num_videos: number;
  videos: IVideo[];
}
