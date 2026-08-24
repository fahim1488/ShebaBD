/**
 * community.types.ts - Type definitions for community forum and discussions.
 */
export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
