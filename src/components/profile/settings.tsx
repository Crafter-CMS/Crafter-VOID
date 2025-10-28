"use client";

import React, { useState, useContext, useEffect } from "react";
import { User } from "@/lib/types/user";
import { userService } from "@/lib/api/services/userService";
import { AuthContext } from "@/lib/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function Settings() {
  const userServiceInstance = userService();
  const { user: currentUser, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Kişisel Bilgiler State
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeDialog, setEmailChangeDialog] = useState(false);
  const [emailChangeReason, setEmailChangeReason] = useState("");

  // Güvenlik State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeDialog, setPasswordChangeDialog] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupDialog, setTwoFactorSetupDialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || "");
      setTwoFactorEnabled(currentUser.twoFactorEnabled || false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive text-center">
          <div className="text-lg font-semibold mb-2">Hata</div>
          <div className="text-sm">Kullanıcı bilgileri yüklenemedi</div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: tr,
    });
  };

  // E-posta Değiştirme
  const handleEmailChange = async () => {
    if (!newEmail.trim() || !emailChangeReason.trim()) return;

    try {
      setLoading(true);
      // E-posta değiştirme servisi çağrılacak
      await userServiceInstance.updateUser(currentUser.id, { email: newEmail });
      
      toast.success("E-posta değiştirme talebi gönderildi. Yeni e-posta adresinizi kontrol edin.");
      setEmailChangeDialog(false);
      setNewEmail("");
      setEmailChangeReason("");
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = await userServiceInstance.getMe();
      setUser(updatedUser);
    } catch (err) {
      console.error("E-posta değiştirilemedi:", err);
      toast.error("E-posta değiştirilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Şifre Değiştirme
  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) return;
    
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    try {
      setLoading(true);
      await userServiceInstance.changePassword(currentPassword, newPassword);
      
      toast.success("Şifre başarıyla değiştirildi");
      setPasswordChangeDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Şifre değiştirilemedi:", err);
      toast.error("Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  // 2FA Kurulumu
  const handleTwoFactorSetup = async () => {
    try {
      setLoading(true);
      // 2FA kurulum servisi çağrılacak
      const result = await userServiceInstance.setupTwoFactor();
      setTwoFactorSecret(result.secret);
      setTwoFactorSetupDialog(true);
    } catch (err) {
      console.error("2FA kurulumu başlatılamadı:", err);
      toast.error("2FA kurulumu başlatılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // 2FA Doğrulama
  const handleTwoFactorVerification = async () => {
    if (!twoFactorCode.trim()) return;

    try {
      setLoading(true);
      await userServiceInstance.verifyTwoFactor(twoFactorSecret, twoFactorCode);
      
      toast.success("2FA başarıyla aktifleştirildi");
      setTwoFactorSetupDialog(false);
      setTwoFactorCode("");
      setTwoFactorSecret("");
      setTwoFactorEnabled(true);
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = await userServiceInstance.getMe();
      setUser(updatedUser);
    } catch (err) {
      console.error("2FA doğrulanamadı:", err);
      toast.error("2FA doğrulanamadı. Kodu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  // 2FA Devre Dışı Bırakma
  const handleTwoFactorDisable = async () => {
    try {
      setLoading(true);
      await userServiceInstance.disableTwoFactor();
      
      toast.success("2FA devre dışı bırakıldı");
      setTwoFactorEnabled(false);
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = await userServiceInstance.getMe();
      setUser(updatedUser);
    } catch (err) {
      console.error("2FA devre dışı bırakılamadı:", err);
      toast.error("2FA devre dışı bırakılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Profil Ayarları</h1>
          <p className="text-muted-foreground">
            Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin
          </p>
        </div>

        {/* Kullanıcı Özeti */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://mc-heads.net/avatar/${currentUser.username}/256`}
                  alt={currentUser.username}
                />
                <AvatarFallback className="text-xl font-bold bg-muted">
                  {currentUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{currentUser.username}</CardTitle>
                <CardDescription className="text-base">
                  Üye olma: {formatDate(currentUser.createdAt)}
                  {currentUser.lastLogin && ` • Son giriş: ${formatDate(currentUser.lastLogin)}`}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: currentUser.role.color + "20",
                    borderColor: currentUser.role.color,
                    color: currentUser.role.color,
                  }}
                >
                  {currentUser.role.name}
                </Badge>
                <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                  {twoFactorEnabled ? "2FA Aktif" : "2FA Pasif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="security">Güvenlik</TabsTrigger>
          </TabsList>

          {/* Kişisel Bilgiler Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>E-posta Adresi</CardTitle>
                <CardDescription>
                  E-posta adresinizi değiştirmek için yeni adres ve sebep belirtin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-email">Mevcut E-posta</Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <Dialog open={emailChangeDialog} onOpenChange={setEmailChangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      E-posta Değiştir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>E-posta Adresi Değiştir</DialogTitle>
                      <DialogDescription>
                        Yeni e-posta adresinizi ve değiştirme sebebinizi belirtin
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Yeni E-posta</Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="yeni@email.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-reason">Değiştirme Sebebi</Label>
                        <Textarea
                          id="email-reason"
                          placeholder="E-posta değiştirme sebebinizi yazın..."
                          value={emailChangeReason}
                          onChange={(e) => setEmailChangeReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setEmailChangeDialog(false)}
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={handleEmailChange}
                        disabled={!newEmail.trim() || !emailChangeReason.trim() || loading}
                      >
                        {loading ? "Gönderiliyor..." : "Değiştir"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Güvenlik Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Şifre Değiştirme */}
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştirme</CardTitle>
                <CardDescription>
                  Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={passwordChangeDialog} onOpenChange={setPasswordChangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      Şifre Değiştir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Şifre Değiştir</DialogTitle>
                      <DialogDescription>
                        Mevcut şifrenizi ve yeni şifrenizi girin
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Mevcut Şifre</Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Mevcut şifrenizi girin"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Yeni Şifre</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Yeni şifrenizi girin"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Yeni şifrenizi tekrar girin"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setPasswordChangeDialog(false)}
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={handlePasswordChange}
                        disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || loading}
                      >
                        {loading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Separator />

            {/* 2FA Ayarları */}
            <Card>
              <CardHeader>
                <CardTitle>İki Faktörlü Doğrulama (2FA)</CardTitle>
                <CardDescription>
                  Hesabınızı ekstra güvenlik katmanı ile koruyun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>2FA Durumu</Label>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled 
                        ? "Hesabınız iki faktörlü doğrulama ile korunuyor"
                        : "Hesabınız için iki faktörlü doğrulama kurulmamış"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleTwoFactorSetup();
                      } else {
                        handleTwoFactorDisable();
                      }
                    }}
                    disabled={loading}
                  />
                </div>

                {twoFactorEnabled && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">Aktif</Badge>
                      <span className="text-sm text-muted-foreground">
                        Hesabınız güvenli
                      </span>
                    </div>
                    <p className="text-sm">
                      Giriş yaparken telefonunuzdaki doğrulama kodunu girmeniz gerekecek.
                    </p>
                  </div>
                )}

                {!twoFactorEnabled && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Pasif</Badge>
                      <span className="text-sm text-muted-foreground">
                        Güvenlik riski
                      </span>
                    </div>
                    <p className="text-sm">
                      2FA'yı aktifleştirerek hesabınızı daha güvenli hale getirin.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 2FA Kurulum Dialog */}
        <Dialog open={twoFactorSetupDialog} onOpenChange={setTwoFactorSetupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>2FA Kurulumu</DialogTitle>
              <DialogDescription>
                Telefonunuza Google Authenticator gibi bir uygulama indirin ve QR kodu tarayın
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {twoFactorSecret && (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm font-mono mb-2">Manuel Kurulum Kodu:</p>
                  <p className="text-lg font-mono bg-background p-2 rounded border">
                    {twoFactorSecret}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="2fa-code">Doğrulama Kodu</Label>
                <Input
                  id="2fa-code"
                  type="text"
                  placeholder="6 haneli kodu girin"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTwoFactorSetupDialog(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleTwoFactorVerification}
                disabled={!twoFactorCode.trim() || loading}
              >
                {loading ? "Doğrulanıyor..." : "Doğrula ve Aktifleştir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}