

"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, Play, Server, Users, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import { useMinecraftStatus } from "@/lib/hooks/useMinecraftStatus";

export default function StartToPlay({
  serverAddress,
  status,
}: {
  serverAddress: string;
  status?: any;
}) {
  const [copied, setCopied] = useState(false);
  
  // Extract server info from serverAddress (assuming format like "play.example.com" or "play.example.com:25565")
  const [hostname, port] = serverAddress.includes(':') 
    ? serverAddress.split(':') 
    : [serverAddress, 25565];
  
  // Use client-side status fetching if no status provided
  const { status: clientStatus, loading } = useMinecraftStatus({
    hostname,
    port: parseInt(port.toString()),
  });
  
  // Use provided status or client-side status
  const currentStatus = status || clientStatus;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(serverAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-background via-background to-muted/10 border-t">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Main Content Container */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Hemen Oynamaya Başla
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sunucumuza katıl ve diğer oyuncularla birlikte eğlenceli anlar yaşa
          </p>
        </div>

        {/* Server Status Bar */}
        <div className="bg-muted/20 border border-border/50 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-foreground">Yükleniyor...</span>
              </div>
            ) : currentStatus ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">Çevrimiçi</span>
                </div>
                <div className="w-px h-6 bg-border/50 mx-3"></div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{currentStatus.online} oyuncu aktif</span>
                </div>
                <div className="w-px h-6 bg-border/50 mx-3"></div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{currentStatus.roundTripLatency}ms ping</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-foreground">Sunucu durumu alınamadı</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
          {/* Play Button */}
          <a
            href="/auth/sign-in"
            className="group flex items-center gap-4 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5" />
            <span>Oynamaya Başla</span>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </a>

          {/* Server Address */}
          <div 
            className="flex items-center gap-3 bg-muted/30 border border-border/50 rounded-xl px-6 py-4 cursor-pointer hover:bg-muted/40 transition-colors duration-200"
            onClick={handleCopy}
          >
            <Server className="w-5 h-5 text-muted-foreground" />
            <code className="text-sm font-mono text-foreground bg-background/50 px-3 py-2 rounded-lg">
              {serverAddress}
            </code>
            <div className="text-xs text-muted-foreground">
              {copied ? (
                <span className="text-green-500 font-medium">Kopyalandı</span>
              ) : (
                <span>Kopyala</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
