"use client";

import React, {useEffect, useState, useContext} from "react";
import {User, WallMessage} from "@/lib/types/user";
import {userService} from "@/lib/api/services/userService";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {AuthContext} from "@/lib/context/AuthContext";
import {PERMISSIONS} from "@/lib/constants/permissions";
import {ReportType} from "@/lib/types/website";
import {reportService} from "@/lib/api/services/reportService";
import StaticAlert from "@/components/ui/alerts/static-alert";
import {ProfileHeader} from "./components/ProfileHeader";
import {ProfileStats} from "./components/ProfileStats";
import {ProfileTabs} from "./components/ProfileTabs";

interface ProfileProps {
    ownUser?: boolean;
    username?: string;
    className?: string;
    currency?: string;
}

export function Profile({
                            ownUser = false,
                            username,
                            className,
                            currency,
                        }: ProfileProps) {
    const userServiceInstance = userService();
    const reportServiceInstance = reportService();
    const [user, setUser] = useState<User | null>(null);
    const [wallMessages, setWallMessages] = useState<WallMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const {user: currentUser} = useContext(AuthContext);

    // Mevcut kullanıcının moderasyon yetkisi var mı kontrol et
    const hasModerationPermission = Boolean(currentUser?.role?.permissions?.includes(PERMISSIONS.MANAGE_USERS));

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                let userData: User;

                if (ownUser) {
                    userData = await userServiceInstance.getMe();

                    if (!userData) {
                        return router.push("/auth/sign-in?return=/profile");
                    }
                } else if (username) {
                    userData = await userServiceInstance.getUserById(username);
                } else {
                    throw new Error("Username gerekli");
                }

                setUser(userData);

                // Wall messages'ları getir
                if (userData.id) {
                    const messages = await userServiceInstance.getWallMessages(userData.id);
                    setWallMessages(messages);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Kullanıcı bilgileri alınamadı"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [ownUser, username]);

    const handleSendMessage = async (message: string) => {
        if (!user) return;

        try {
            await userServiceInstance.sendWallMessage(user.id, "", message);
            toast.success("Mesaj başarıyla gönderildi!");
            // Wall messages'ları yenile
            const messages = await userServiceInstance.getWallMessages(user.id);
            setWallMessages(messages);
        } catch (err) {
            console.error("Mesaj gönderilemedi:", err);
            toast.error("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
            throw err;
        }
    };

    const handleReplyMessage = async (messageId: string, reply: string) => {
        if (!user) return;

        try {
            await userServiceInstance.replyWallMessage(user.id, messageId, reply);
            toast.success("Yanıt başarıyla gönderildi!");
            // Wall messages'ları yenile
            const messages = await userServiceInstance.getWallMessages(user.id);
            setWallMessages(messages);
        } catch (err) {
            console.error("Yanıt gönderilemedi:", err);
            toast.error("Yanıt gönderilemedi. Lütfen tekrar deneyin.");
            throw err;
        }
    };

    const handleBanUser = async (reason: string) => {
        if (!user) return;

        try {
            await userServiceInstance.banUser(user.id, reason);
            toast.success("Kullanıcı başarıyla banlandı");
            // Kullanıcı bilgilerini yenile
            const updatedUser = await userServiceInstance.getUserById(user.username);
            setUser(updatedUser);
        } catch (err) {
            console.error("Kullanıcı banlanamadı:", err);
            toast.error("Kullanıcı banlanamadı. Lütfen tekrar deneyin.");
            throw err;
        }
    };

    const handleUnbanUser = async () => {
        if (!user) return;

        try {
            await userServiceInstance.unbanUser(user.id);
            toast.success("Kullanıcı banı kaldırıldı");
            // Kullanıcı bilgilerini yenile
            const updatedUser = await userServiceInstance.getUserById(user.username);
            setUser(updatedUser);
        } catch (err) {
            console.error("Ban kaldırılamadı:", err);
            toast.error("Ban kaldırılamadı");
            throw err;
        }
    };

    const handleReportUser = async (reason: string, type: ReportType) => {
        if (!user) return;

        try {
            await reportServiceInstance.reportUser(user.id, reason, type);
            toast.success("Kullanıcı başarıyla raporlandı.");
        } catch (err: any) {
            console.error("Kullanıcı raporlanamadı:", err);
            toast.error(`${err.message || "Kullanıcı raporlanamadı. Lütfen tekrar deneyin."}`);
            throw err;
        }
    };

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center p-8", className)}>
                <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className={cn("flex items-center justify-center p-8", className)}>
                <div className="text-destructive text-center">
                    <div className="text-lg font-semibold mb-2">Hata</div>
                    <div className="text-sm">{error || "Kullanıcı bulunamadı"}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Yasaklanmış Kullanıcı Alert */}
            {user.banned && user.bannedBy && (
                <StaticAlert
                    title="Yasaklanmış Kullanıcı"
                    type="error"
                    message={`Bu kullanıcı ${user.bannedBy.username} tarafından ${new Date(user.bannedAt || "").toLocaleDateString('tr-TR')} tarihinde yasaklanmıştır.`}
                />
            )}

            {/* Header Component */}
            <ProfileHeader
                user={user}
                ownUser={ownUser}
                onReport={handleReportUser}
            />

            {/* Stats Component */}
            <ProfileStats
                user={user}
                wallMessages={wallMessages}
                currency={currency}
            />

            {/* Tabs Component */}
            <ProfileTabs
                user={user}
                wallMessages={wallMessages}
                ownUser={ownUser}
                hasModerationPermission={hasModerationPermission}
                onSendMessage={handleSendMessage}
                onReplyMessage={handleReplyMessage}
                onBanUser={handleBanUser}
                onUnbanUser={handleUnbanUser}
            />
        </div>
    );
}
