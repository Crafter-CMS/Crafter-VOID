"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Flame,
  Share2,
  Bookmark,
  Loader2,
} from "lucide-react";
import { postsService } from "@/lib/api/services/postsService";
import { WebsitePost } from "@/lib/types/posts";
import { cn } from "@/lib/utils";
import LexicalViewer from "@/lib/helpers/lexicalViewer";
import { AuthContext } from "@/lib/context/AuthContext";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";

export default function Post() {
  const postsServiceInstance = postsService();
  const params = useParams();
  const postSlug = params?.post_slug as string;
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState<WebsitePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false); 
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);

  useEffect(() => {
    if (postSlug) {
      fetchPost();
    }
  }, [postSlug]);

  const likePost = async () => {
    try {
      const response = await postsServiceInstance.likePost(post?.id || "");
      setLikeCount(response.data.likeCount);
      setIsLiked(true);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const unlikePost = async () => {
    try {
      const response = await postsServiceInstance.unlikePost(post?.id || "");
      setLikeCount(response.data.likeCount);
      setIsLiked(false);
    } catch (err) {
      console.error("Error unliking post:", err);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const foundPost = await postsServiceInstance.getPostBySlug(postSlug);

      if (foundPost) {
        setPost(foundPost);
        setLikeCount(foundPost.likeCount);
        setIsLiked(foundPost.likedBy?.includes(user?.id || "") || false);
      } else {
        setError("Post bulunamadı.");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Post yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    if (isLiked) {
      unlikePost();
    } else {
      likePost();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.metaDescription,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || "Post bulunamadı."}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/posts">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Gönderilere Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/posts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Gönderilere Dön
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              {/* Post Type and Status Badges */}
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className={cn("text-sm", getPostTypeColor(post.type))}
                >
                  {getPostTypeLabel(post.type)}
                </Badge>
                {post.isPinned && (
                  <Badge
                    variant="outline"
                    className="text-sm bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                  >
                    <Pin className="w-3 h-3 mr-1" />
                    Sabit
                  </Badge>
                )}
                {post.isHot && (
                  <Badge
                    variant="outline"
                    className="text-sm bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                  >
                    <Flame className="w-3 h-3 mr-1" />
                    Popüler
                  </Badge>
                )}
              </div>

              {/* Title */}
              <CardTitle className="text-3xl font-bold leading-tight">
                {post.title}
              </CardTitle>

              {/* Meta Information */}
              <CardDescription className="text-base">
                <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author?.username || post.authorName || "Yazar Yok"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewCount} görüntülenme</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="px-6 pb-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imageLinkGenerate(post.featuredImage)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <CardContent className="prose prose-lg max-w-none dark:prose-invert">
              <div className="text-foreground leading-relaxed">
                <LexicalViewer content={post.content} />
              </div>
            </CardContent>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <CardContent className="pt-0">
                <Separator className="my-6" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Etiketler:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}

            {/* Action Buttons */}
            <CardContent className="pt-0">
              <Separator className="my-6" />
              <div className="flex items-center gap-3">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  {likeCount}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Paylaş
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Kategori
                </span>
                <p className="text-sm">{post.categoryName || "Kategori Yok"}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Durum
                </span>
                <Badge
                  variant={
                    post.status === "published" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {post.status === "published"
                    ? "Yayınlandı"
                    : post.status === "draft"
                    ? "Taslak"
                    : "Arşivlendi"}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Oluşturulma
                </span>
                <p className="text-sm">{formatDate(post.createdAt)}</p>
              </div>

              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Güncellenme
                  </span>
                  <p className="text-sm">{formatDate(post.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
