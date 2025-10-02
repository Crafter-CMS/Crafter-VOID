import { Metadata } from "next";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import Title from "@/components/ui/title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, MicOff, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cezalar",
  description: "Sunucu cezalarını görüntüleyin ve yönetin.",
};

const punishmentTypes = [
  {
    type: "ban",
    title: "Yasaklamalar",
    description: "Sunucudan yasaklanan oyuncuları görüntüleyin",
    icon: Ban,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    href: "/punishments/ban"
  },
  {
    type: "mute",
    title: "Susturulmalar", 
    description: "Susturulan oyuncuları görüntüleyin",
    icon: MicOff,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    href: "/punishments/mute"
  },
  {
    type: "warning",
    title: "Uyarılar",
    description: "Uyarı alan oyuncuları görüntüleyin", 
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    href: "/punishments/warning"
  }
];

export default function PunishmentsPage() {
  return (
    <div>
      <div className="flex flex-col gap-4">
        <DefaultBreadcrumb items={[{ label: "Cezalar", href: "/punishments" }]} />
        
        <Title
          title="Cezalar"
          description="Sunucu cezalarını görüntüleyin ve yönetin."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {punishmentTypes.map((punishment) => {
            const IconComponent = punishment.icon;
            return (
              <Link key={punishment.type} href={punishment.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full ${punishment.bgColor} flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-8 h-8 ${punishment.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold">{punishment.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {punishment.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
