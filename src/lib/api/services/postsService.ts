import { useApi, useServerApi } from "../useApi";
import { GetPostsParams, PostLikeResponse, PostsResponse, WebsitePost } from "../../types/posts";

// Server-side website service using ApiClient
export class PostsService {
  private api: ReturnType<typeof useApi>;

  constructor(websiteId?: string) {
    if (websiteId) {
      // Server-side usage with websiteId
      this.api = useServerApi(websiteId); // v1 default
    } else {
      // Client-side usage
      this.api = useApi(); // v1 default
    }
  }

  async getPosts(params?: GetPostsParams): Promise<PostsResponse> {
    try {
      const response = await this.api.get<PostsResponse>(
        `/posts`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting posts:", error);
      throw error;
    }
  }

  async getPostBySlug(slug: string): Promise<WebsitePost | null> {
    try {
      const response = await this.api.get<{ data: WebsitePost }>(
        `/posts/${slug}`,
      );

      return response.data.data;
    } catch (error) {
      console.error("Error getting post by slug:", error);
      throw error;
    }
  }

  async likePost(postId: string): Promise<PostLikeResponse> {
    try {
      const response = await this.api.post<PostLikeResponse>(
        `/posts/${postId}/like`
      );
      return response.data;
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  }

  async unlikePost(postId: string): Promise<PostLikeResponse> {
    try {
      const response = await this.api.delete<PostLikeResponse>(
        `/posts/${postId}/like`
      );
      return response.data;
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  }
}

// Client-side instance
export const postsService = () => new PostsService();

// For server-side usage - now accepts websiteId
export const serverPostsService = (websiteId: string) => new PostsService(websiteId);
