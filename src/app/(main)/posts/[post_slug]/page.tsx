import Post from "@/components/posts/post";
import {serverPostsService} from "@/lib/api/services/postsService";
import {lexicalToString} from "@/lib/helpers/lexicalToString";
import {headers} from "next/headers";

export const generateMetadata = async ({
                                           params,
                                       }: {
    params: Promise<{ post_slug: string }>;
}) => {
    const {post_slug} = await params;
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") as string;
    const post = await serverPostsService(websiteId).getPostBySlug(post_slug);
    return {
        title: post?.title || "Gönderi",
        description:
            `${post?.metaDescription} - ${lexicalToString(post?.content)}` ||
            "Gönderi",
    };
};

export default function PostPage() {
    return (
        <div>
            <Post/>
        </div>
    );
}
