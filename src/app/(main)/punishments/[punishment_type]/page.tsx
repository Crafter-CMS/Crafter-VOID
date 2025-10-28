import {Metadata} from "next";
import {DefaultBreadcrumb} from "@/components/ui/breadcrumb";
import Title from "@/components/ui/title";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Search, ArrowUpDown, ArrowDown, ArrowUp} from "lucide-react";
import {serverPunishmentService} from "@/lib/api/services/punishmentService";
import {notFound} from "next/navigation";
import {headers} from "next/headers";

export async function generateMetadata({params}: { params: Promise<{ punishment_type: string }> }): Promise<Metadata> {
    const {punishment_type} = await params;
    const typeMap: Record<string, string> = {
        ban: "Yasaklamalar",
        mute: "Susturulmalar",
        warning: "Uyarılar"
    };

    return {
        title: typeMap[punishment_type] || "Cezalar",
        description: `${typeMap[punishment_type] || "Cezalar"} sayfası`,
    };
}

const punishmentTypeMap: Record<string, { title: string; description: string; color: string }> = {
    ban: {
        title: "Yasaklamalar",
        description: "Sunucudan yasaklanan oyuncuları görüntüleyin",
        color: "text-pink-500"
    },
    mute: {
        title: "Susturulmalar",
        description: "Susturulan oyuncuları görüntüleyin",
        color: "text-purple-500"
    },
    warning: {
        title: "Uyarılar",
        description: "Uyarı alan oyuncuları görüntüleyin",
        color: "text-yellow-500"
    }
};

function formatDate(dateInput: string): string {
    let date: Date;

    // Check if it's a timestamp (numeric string) or ISO date string
    if (/^\d+$/.test(dateInput)) {
        // It's a timestamp
        date = new Date(parseInt(dateInput));
    } else {
        // It's an ISO date string
        date = new Date(dateInput);
    }

    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDuration(start: string, end: string): string {
    if (end === '-1') {
        return 'Kalıcı';
    }

    let startDate: Date;
    let endDate: Date;

    // Check if start is a timestamp (numeric string) or ISO date string
    if (/^\d+$/.test(start)) {
        startDate = new Date(parseInt(start));
    } else {
        startDate = new Date(start);
    }

    // Check if end is a timestamp (numeric string) or ISO date string
    if (/^\d+$/.test(end)) {
        endDate = new Date(parseInt(end));
    } else {
        endDate = new Date(end);
    }

    const diffMs = endDate.getTime() - startDate.getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days} gün`;
    } else if (hours > 0) {
        return `${hours} saat`;
    } else {
        return `${minutes} dakika`;
    }
}

export default async function PunishmentTypePage({
                                                     params
                                                 }: {
    params: Promise<{ punishment_type: string }>
}) {
    const {punishment_type: punishmentType} = await params;
    const headersList = await headers();
    const WEBSITE_ID = headersList.get("x-website-id") || "default_website_id";

    if (!punishmentTypeMap[punishmentType]) {
        notFound();
    }

    const typeInfo = punishmentTypeMap[punishmentType];

    // Fetch punishments data
    const punishmentService = serverPunishmentService(WEBSITE_ID);
    let punishments: any[] = [];
    let pagination = {page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false};

    try {
        if (WEBSITE_ID) {
            const response = await punishmentService.getPunishmentsByType(
                WEBSITE_ID,
                punishmentType.toUpperCase(),
                1,
                10
            );
            // The API returns { punishments: [], pagination: {} } structure
            punishments = response.punishments || [];
            pagination = response.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            };
        }
    } catch (error) {
        console.error("Error fetching punishments:", error);
    }

    return (
        <div>
            <div className="flex flex-col gap-4">
                <DefaultBreadcrumb
                    items={[
                        {label: "Cezalar", href: "/punishments"},
                        {label: typeInfo.title, href: `/punishments/${punishmentType}`}
                    ]}
                />

                <div className="flex justify-between items-center">
                    <Title
                        title={typeInfo.title}
                        description={typeInfo.description}
                    />

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                            <Input
                                placeholder="Arama Yap"
                                className="pl-10 w-64"
                            />
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Son {typeInfo.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            KULLANICI
                                            <ArrowUpDown className="w-4 h-4"/>
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            YETKILI
                                            <ArrowUpDown className="w-4 h-4"/>
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            SEBEP
                                            <ArrowDown className="w-4 h-4"/>
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            SÜRE
                                            <ArrowDown className="w-4 h-4"/>
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            YAYIN TARIHI
                                            <ArrowDown className="w-4 h-4"/>
                                        </div>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {punishments.length > 0 ? (
                                    punishments.map((punishment) => (
                                        <tr key={punishment.id} className="border-b hover:bg-muted/50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage
                                                            src={`https://mc-heads.net/avatar/${punishment.uuid}`}/>
                                                        <AvatarFallback
                                                            className="bg-gradient-to-br from-teal-400 to-blue-600">
                                                            {punishment.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div
                                                            className="font-medium text-red-500">{punishment.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage
                                                            src={`https://mc-heads.net/avatar/${punishment.operator}`}/>
                                                        <AvatarFallback>WE</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{punishment.operator}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                          <span className="font-medium">
                            {punishment.reason === 'none' ? 'Sebep belirtilmemiş' : punishment.reason}
                          </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span
                                                    className="font-medium">{formatDuration(punishment.start, punishment.end)}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-medium">{formatDate(punishment.start)}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                            Henüz {typeInfo.title.toLowerCase()} bulunmuyor.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {punishments.length > 0 && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <select className="px-3 py-1 border rounded-md bg-background">
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                    <span className="text-sm text-muted-foreground">
                    {pagination.total} kayıttan {((pagination.page - 1) * pagination.limit) + 1} ila {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor.
                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" disabled={!pagination.hasPrev}>
                                        <ArrowUp className="w-4 h-4"/>
                                    </Button>
                                    <div className="px-3 py-1 bg-muted rounded-md text-sm">
                                        {pagination.page}
                                    </div>
                                    <Button variant="outline" size="sm" disabled={!pagination.hasNext}>
                                        <ArrowDown className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
