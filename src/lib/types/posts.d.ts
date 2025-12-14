/**
 * @description Post veri yapısını tanımlar.
 */
export interface WebsitePost {
    id: string;
    title: string;
    slug: string;
    content: string;
    type: 'news' | 'announcement' | 'blog' | 'update';
    status: 'draft' | 'published' | 'archived';
    author?: {
        id: string;
        username: string;
    };
    authorName?: string;
    authorId: string;
    categoryId?: string;
    categoryName?: string;
    featuredImage?: string;
    files?: string[];
    metaDescription?: string;
    tags?: string[];
    publishedAt?: Date;
    isPinned: boolean;
    isHot: boolean;
    viewCount: number;
    likeCount: number;
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string;
    likedBy?: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @description Post listesi için filtre parametreleri.
 */
export type GetPostsParams = {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'news' | 'announcement' | 'blog' | 'update';
    status?: 'draft' | 'published' | 'archived';
    categoryId?: string;
    authorId?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount' | 'likeCount';
    sortOrder?: 'asc' | 'desc';
    pinnedOnly?: boolean;
    hotOnly?: boolean;
};

/**
 * @description Post listesi yanıt yapısı.
 */
export type PostsResponse = {
    success: boolean;
    data: WebsitePost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

export interface getPostResponse {
    success: boolean,
    data: WebsitePost
}

/**
 * @description Post beğeni yanıtı.
 */
export type PostLikeResponse = {
    success: boolean;
    data: { likeCount: number };
}; 