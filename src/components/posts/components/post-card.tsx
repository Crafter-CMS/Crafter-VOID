import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  User,
  Pin,
  Flame,
  UserIcon,
} from "lucide-react";
import { WebsitePost } from "@/lib/types/posts";
import { cn } from "@/lib/utils";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";

interface PostCardProps {
  post: WebsitePost;
  className?: string;
}

const getPostTypeColor = (type: string) => {
  switch (type) {
    case "news":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "announcement":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "blog":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "update":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case "news":
      return "Haber";
    case "announcement":
      return "Duyuru";
    case "blog":
      return "Blog";
    case "update":
      return "Güncelleme";
    default:
      return type;
  }
};

export default function PostCard({ post, className }: PostCardProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 border-border",
        className
      )}
    >
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
              <Badge
                variant="outline"
                className={cn("text-xs", getPostTypeColor(post.type))}
              >
                {getPostTypeLabel(post.type)}
              </Badge>
              {post.isPinned && (
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                >
                  <Pin className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Sabit</span>
                </Badge>
              )}
              {post.isHot && (
                <Badge
                  variant="outline"
                  className="text-xs bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                >
                  <Flame className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Popüler</span>
                </Badge>
              )}
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
              <Link href={`/posts/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 px-4 sm:px-6">
        {post.metaDescription && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {post.metaDescription}
          </CardDescription>
        )}

        {post.featuredImage && (
          <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={imageLinkGenerate(post.featuredImage)}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-border px-4 sm:px-6">
        <div className="w-full">
          {/* Desktop Layout - 2x2 Grid with better spacing */}
          <div className="hidden sm:grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {/* Top Row */}
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">
                {post.author?.username || post.authorName || "Yazar Yok"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{post.likeCount}</span>
            </div>
          </div>

          {/* Mobile Layout - Better stacked */}
          <div className="sm:hidden space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">
                  {post.author?.username || post.authorName || "Yazar Yok"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">{post.viewCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">{post.likeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
