'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, RefreshCw, Filter } from 'lucide-react';
import PostCard from './components/post-card';
import Sidebar from './components/sidebar';
import { postsService } from '@/lib/api/services/postsService';
import { GetPostsParams, PostsResponse, WebsitePost } from '@/lib/types/posts';

export default function Posts() {
  const postsServiceInstance = postsService();
  const [posts, setPosts] = useState<WebsitePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<GetPostsParams>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const fetchPosts = async (params: GetPostsParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PostsResponse = await postsServiceInstance.getPosts(params);
      
      setPosts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Gönderiler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(filters);
  }, [filters]);

  // ESC tuşu ile mobil sidebar'ı kapat
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, handleEscapeKey]);

  const handleFiltersChange = (newFilters: GetPostsParams) => {
    setFilters(newFilters);
    // Mobilde filtre uygulandıktan sonra sidebar'ı kapat
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleMobileFilterApply = () => {
    // Mobilde sadece mevcut filtreleri uygula, sidebar'ı kapat
    setSidebarOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleRefresh = () => {
    fetchPosts(filters);
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Önceki
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
        >
          Sonraki
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

      return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 lg:mb-8">
        <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">Gönderiler</CardTitle>
        <CardDescription className="text-base lg:text-lg text-muted-foreground">
          En son haberler, duyurular ve blog yazıları
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-8">
        {/* Desktop Sidebar */}
        <div className="xl:col-span-1 order-2 xl:order-1 hidden xl:block">
                      <Sidebar
              onFiltersChange={handleFiltersChange}
              currentFilters={filters}
              onMobileApply={handleMobileFilterApply}
            />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 xl:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <div className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border z-50 
          transform transition-transform duration-300 ease-in-out xl:hidden
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtreler</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Sidebar
              onFiltersChange={handleFiltersChange}
              currentFilters={filters}
              onMobileApply={handleMobileFilterApply}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3 order-1 xl:order-2">
          {/* Header with refresh button and mobile filter toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">
                {filters.search ? `"${filters.search}" için sonuçlar` : 'Tüm Gönderiler'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {pagination.total} gönderi bulundu
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="xl:hidden flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtrele
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 lg:gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-muted-foreground">
                  {filters.search || filters.type 
                    ? 'Arama kriterlerinize uygun gönderi bulunamadı.'
                    : 'Henüz gönderi bulunmuyor.'
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}