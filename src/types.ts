export interface Author {
  name: string;
  avatar: string;
  subscribers: number; // numeric, can format as string for display
  verified: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  author: Author;
  
  // Real stats
  realViews: number;
  realLikes: number;
  realDislikes: number;
  
  // Seeding (Fake) values configured by admin
  baseViews: number; // base mock views
  baseLikes: number;
  baseDislikes: number;
  
  // Publish dates
  publishedAt: string; // ISO date string of original upload
  backdatedDate?: string; // Backdated ISO date string (if configured)
  
  category: string;
  tags: string[];
}

export interface VideoComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes?: number;
  replies?: VideoComment[];
}
