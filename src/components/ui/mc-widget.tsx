import { Card, CardContent } from "./card";
import Image from "next/image";
import { MinecraftStatus } from "@/lib/hooks/useMinecraftStatus";
import McWidgetSkeleton from "./mc-widget-skeleton";

interface McWidgetProps {
  status: MinecraftStatus | null;
  loading?: boolean;
  error?: string | null;
}

export default function McWidget({ status, loading = false, error = null }: McWidgetProps) {
  if (loading) {
    return <McWidgetSkeleton />;
  }

  if (error || !status) {
    return (
      <Card className="bg-card/95 backdrop-blur-md border border-red-200 py-5 shadow-2xl rounded-3xl w-full group relative">
        <CardContent className="flex items-center gap-4 py-0 px-5">
          <div className="flex items-center justify-center shadow-lg">
            <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-500 text-xs">⚠️</span>
            </div>
          </div>
          <div className="flex justify-between flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-card-foreground truncate">
              {status?.hostname || 'Sunucu'}
            </span>
            <span className="text-xs text-red-500 line-clamp-2">
              {error || 'Sunucu durumu çekilemedi'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/20 py-5 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl w-full group cursor-pointer hover:scale-105 hover:-translate-y-1 relative">
      <CardContent className="flex items-center gap-4 py-0 px-5">
        <div className="flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
          {status.favicon ? (
            <Image
              src={status.favicon}
              alt="Minecraft"
              width={128}
              height={128}
              className="w-11 h-11 object-contain"
            />
          ) : (
            <div className="w-11 h-11 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground text-xs">MC</span>
            </div>
          )}
        </div>
        <div className="flex justify-between flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-card-foreground truncate">
            {status.hostname}
          </span>
          <span
            className="text-xs text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{ __html: status.motd }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

