"use client";

import { useState, useEffect } from 'react';

export interface MinecraftStatus {
  online: number;
  version: string;
  roundTripLatency: number;
  favicon: string;
  motd: string;
  hostname?: string;
}

export interface MinecraftConfig {
  hostname: string;
  port: number | string;
}

export interface UseMinecraftStatusReturn {
  status: MinecraftStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMinecraftStatus(config: MinecraftConfig): UseMinecraftStatusReturn {
  const [status, setStatus] = useState<MinecraftStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Internal API route'unu kullan
      const response = await fetch(
        `/api/minecraft-status?hostname=${encodeURIComponent(config.hostname)}&port=${encodeURIComponent(config.port)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setStatus({
        ...result,
        hostname: config.hostname,
      });
    } catch (err) {
      console.error('Minecraft status fetch error:', err);
      setError('Sunucu durumu çekilemedi');
      setStatus({
        online: 0,
        version: 'Bilinmiyor',
        roundTripLatency: 0,
        favicon: '',
        motd: 'Sunucu durumu alınamadı',
        hostname: config.hostname,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Refetch every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, [config.hostname, config.port]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
}
