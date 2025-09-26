"use client";

import { useState, useEffect, useContext } from "react";
import { VoteProvider, VoteResponse, VoteService } from "@/lib/api/services/voteService";
import { getVoteProviderInfo, VoteProviderInfo } from "@/lib/constants/voteProviders";
import { AuthContext } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VoteProviderPageProps {
  provider: VoteProvider;
  providerInfo: VoteProviderInfo | undefined;
}

export default function VoteProviderPage({ 
  provider, 
  providerInfo
}: VoteProviderPageProps) {
  const { user, reloadUser, isAuthenticated } = useContext(AuthContext);
  const voteService = new VoteService();
  const [isVoting, setIsVoting] = useState(false);
  const [voteResult, setVoteResult] = useState<VoteResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [canVote, setCanVote] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (!user?.nextVoteAt) {
      setCanVote(true);
      setTimeLeft("");
      return;
    }

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const nextVoteTime = new Date(user.nextVoteAt!).getTime();
      const difference = nextVoteTime - now;

      if (difference <= 0) {
        setCanVote(true);
        setTimeLeft("");
      } else {
        setCanVote(false);
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [user?.nextVoteAt]);

  const handleVote = async () => {
    if (!canVote || isVoting) return;

    setIsVoting(true);
    setVoteResult(null);

    try {
      const result = await voteService.sendVote({ providerId: provider.id });

      setVoteResult(result);

      if (result.success) {
        // Vote başarılı, kullanıcı bilgilerini yenile
        await reloadUser();
        // Sayfayı da yenile
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      console.error('Vote error:', error);
      setVoteResult({
        success: false,
        message: 'Oy gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsVoting(false);
    }
  };

  const openProviderWebsite = () => {
    if (providerInfo?.websiteUrl) {
      window.open(providerInfo.websiteUrl, '_blank');
    }
  };

  // Giriş yapmamış kullanıcılar için
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <Image
              src={providerInfo?.image || "/images/vote-providers/default.png"}
              alt={provider.name}
              fill
              className="object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/vote-providers/default.png";
              }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {provider.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              {providerInfo?.description || provider.description}
            </p>
          </div>
        </div>

        {/* Login Required */}
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-600 dark:text-yellow-400 font-medium text-lg">
              Giriş Yapın
            </span>
          </div>
          <p className="text-muted-foreground mb-6">
            Oy kullanmak için önce giriş yapmanız gerekiyor.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/auth/sign-in"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
            >
              Giriş Yap
            </Link>
            
            <div>
              <p className="text-sm text-muted-foreground">
                Hesabınız yok mu?{' '}
                <Link href="/auth/sign-up" className="text-primary hover:text-primary/80 underline">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Provider Info */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Provider Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Durum:</span>
              <span className={`ml-2 ${provider.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {provider.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Cooldown:</span>
              <span className="ml-2 text-foreground">{provider.cooldownHours} saat</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tip:</span>
              <span className="ml-2 text-foreground">{getVoteProviderInfo(provider.type)?.name || provider.type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Website:</span>
              <button
                onClick={() => {
                  if (providerInfo?.websiteUrl) {
                    window.open(providerInfo.websiteUrl, '_blank');
                  }
                }}
                className="ml-2 text-primary hover:text-primary/80 underline"
              >
                Ziyaret Et
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16">
          <Image
            src={providerInfo?.image || "/images/vote-providers/default.png"}
            alt={provider.name}
            fill
            className="object-contain rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/vote-providers/default.png";
            }}
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {provider.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            {providerInfo?.description || provider.description}
          </p>
        </div>
      </div>

      {/* Vote Status */}
      <div className="bg-card border rounded-lg p-6">
        {canVote ? (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium text-lg">
                Oy verebilirsiniz!
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              Aşağıdaki butona tıklayarak {provider.name} üzerinden oy verebilirsiniz.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleVote}
                disabled={isVoting}
                className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                {isVoting ? 'Oy Gönderiliyor...' : 'Oy Ver'}
              </button>
              
              <div>
                <button
                  onClick={openProviderWebsite}
                  className="text-primary hover:text-primary/80 text-sm underline"
                >
                  {provider.name} sitesini ziyaret et
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium text-lg">
                Henüz oy veremezsiniz
              </span>
            </div>
            <p className="text-muted-foreground mb-2">
              Sonraki oy: <span className="font-mono text-xl">{timeLeft}</span>
            </p>
            <p className="text-muted-foreground text-sm">
              Cooldown süresi: {provider.cooldownHours} saat
            </p>
          </div>
        )}
      </div>

      {/* Vote Result */}
      {voteResult && (
        <div className={`border rounded-lg p-4 ${
          voteResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-400'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              voteResult.success ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              {voteResult.message}
            </span>
          </div>
          {voteResult.canVoteAt && (
            <p className="text-sm mt-2 opacity-80">
              Sonraki oy: {new Date(voteResult.canVoteAt).toLocaleString('tr-TR')}
            </p>
          )}
        </div>
      )}

      {/* Provider Info */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Provider Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Durum:</span>
            <span className={`ml-2 ${provider.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {provider.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Cooldown:</span>
            <span className="ml-2 text-foreground">{provider.cooldownHours} saat</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tip:</span>
            <span className="ml-2 text-foreground">{getVoteProviderInfo(provider.type)?.name || provider.type}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Website:</span>
            <button
              onClick={openProviderWebsite}
              className="ml-2 text-primary hover:text-primary/80 underline"
            >
              Ziyaret Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
