"use client";

import { VoteProvider } from "@/lib/api/services/voteService";
import { getVoteProviderInfo } from "@/lib/constants/voteProviders";
import Link from "next/link";
import Image from "next/image";

interface VoteProvidersProps {
  providers: VoteProvider[];
}

export default function VoteProviders({ providers }: VoteProvidersProps) {
  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">
          Henüz aktif vote provider bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {providers.map((provider) => {
        const providerInfo = getVoteProviderInfo(provider.type);
        
        return (
          <Link
            key={provider.id}
            href={`/vote/${provider.id}`}
            className="group block"
          >
            <div className="bg-card border rounded-lg p-6 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 hover:scale-105">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
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
                
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {provider.name}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {providerInfo?.description || provider.description}
                </p>
                
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${provider.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={provider.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {provider.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
