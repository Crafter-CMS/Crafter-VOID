import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostsResponse } from "@/lib/types/posts";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { lexicalToString } from "@/lib/helpers/lexicalToString";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  post: PostsResponse["data"][number];
  className?: string;
}

const formatPostType = (type: string) => {
  switch (type) {
    case "news":
      return "Haber";
    case "announcement":
      return "Duyuru";
    case "blog":
      return "Blog";
    case "update":
      return "Güncelleme";
  }
};

export default function PostCard({ post, className }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`}>
      <Card
        className={`hover:shadow-lg transition-all duration-200 cursor-pointer pt-0 ${className}`}
      >
        <CardHeader className="p-0">
          {/* Post Resmi */}
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={imageLinkGenerate(post.featuredImage || "")}
              alt={post.title}
              className="h-full w-full object-cover rounded-t-lg"
              width={1920}
              height={1080}
              priority
            />
            {/* Kategori badge'i */}
            <div className="absolute top-3 left-3 z-10">
              <Badge
                variant="secondary"
                className="bg-black/70 text-white border-0"
              >
                {formatPostType(post.type)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 min-h-48">
          {/* Post İçeriği */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {lexicalToString(post.content)}
            </p>
          </div>
        </CardContent>

        {/* Footer - Yazar ve Tarih */}
        <CardFooter className="px-6">
          <div className="flex items-center justify-between w-full">
            {/* Yazar Bilgisi */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://mc-heads.net/avatar/${
                    post.author?.username || post.authorName || "Unknown"
                  }/256`}
                  alt={post.author?.username || post.authorName || "Unknown"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {post.author?.username?.charAt(0) ||
                    post.authorName?.charAt(0) ||
                    "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {post.author?.username || post.authorName || "Unknown"}
              </span>
            </div>

            {/* Tarih */}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
