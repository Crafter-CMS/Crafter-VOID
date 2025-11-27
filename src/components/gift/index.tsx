"use client";

import { useState, useContext } from "react";
import { AuthContext } from "@/lib/context/AuthContext";
import { userService } from "@/lib/api/services/userService";
import { giftService } from "@/lib/api/services/giftService";
import { User } from "@/lib/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Gift,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Send,
  X,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

interface GiftPageProps {
  currency?: string;
}

export default function GiftPage({ currency = "TRY" }: GiftPageProps) {
  const { user, isAuthenticated } = useContext(AuthContext);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Amount state
  const [amount, setAmount] = useState("");

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) {
      setError("Lütfen bir kullanıcı adı girin.");
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const service = userService();
      const foundUser = await service.getUserById(searchQuery.trim());

      if (foundUser.id === user?.id) {
        setError("Kendinize hediye gönderemezsiniz.");
        setSelectedUser(null);
        return;
      }

      setSelectedUser(foundUser);
      setSearchQuery("");
    } catch (err: any) {
      console.error("Failed to find user:", err);
      setError("Kullanıcı bulunamadı.");
      setSelectedUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchUser();
    }
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      setError("Lütfen giriş yapın.");
      return;
    }

    if (!selectedUser) {
      setError("Lütfen bir kullanıcı seçin.");
      return;
    }

    if (selectedUser.id === user.id) {
      setError("Kendinize hediye gönderemezsiniz.");
      return;
    }

    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      setError("Lütfen geçerli bir tutar girin.");
      return;
    }

    if (user.balance < amountValue) {
      setError("Yetersiz bakiye.");
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      setSuccess(null);

      const service = giftService();
      const response = await service.sendGift("me", {
        targetUserId: selectedUser.id,
        amount: amountValue,
      });

      if (response.success) {
        setSuccess(
          `${amountValue.toFixed(2)} ${currency} başarıyla ${
            selectedUser.username
          } kullanıcısına gönderildi!`
        );
        toast.success("Hediye başarıyla gönderildi!");

        // Reset form
        setSelectedUser(null);
        setAmount("");

        // Reload user data to update balance
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(response.message || "Hediye gönderilemedi.");
        toast.error("Hediye gönderilemedi.");
      }
    } catch (err: any) {
      console.error("Failed to send gift:", err);
      const errorMessage =
        err?.response?.data?.message || "Hediye gönderilirken bir hata oluştu.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12">
          <div className="text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Giriş Gerekli</h2>
            <p className="text-muted-foreground">
              Hediye göndermek için giriş yapmanız gerekiyor.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Hediye Gönder</h1>
              <p className="text-sm text-muted-foreground">
                Başka kullanıcılara bakiye gönderin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 border border-border">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Bakiyeniz:</span>
            <span className="text-lg font-bold text-primary">
              {user?.balance?.toFixed(2) || "0.00"} {currency}
            </span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSendGift} className="space-y-6">
          {/* Search Bar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Kullanıcı Adı
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Search className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Kullanıcı adını tam olarak yazın..."
                  className="pl-10"
                  disabled={isSending || isSearching}
                />
              </div>
              <Button
                type="button"
                onClick={handleSearchUser}
                disabled={!searchQuery.trim() || isSending || isSearching}
                className="sm:w-auto"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Aranıyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Ara
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Selected User & Amount */}
          {selectedUser && (
            <div className="space-y-4">
              {/* Selected User Card */}
              <div className="p-4 rounded-lg border bg-accent/30">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Seçili Kullanıcı
                </label>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={`https://mc-heads.net/avatar/${selectedUser.username}/64`}
                      alt={selectedUser.username}
                    />
                    <AvatarFallback>{selectedUser.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {selectedUser.username}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedUser.email || "E-posta yok"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(null)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Göndermek İstediğiniz Tutar
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={isSending}
                    className="pr-16 text-lg font-semibold"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                    {currency}
                  </div>
                </div>
                {amount && parseFloat(amount) > (user?.balance || 0) && (
                  <p className="text-sm text-destructive">
                    Yetersiz bakiye! Maksimum: {user?.balance?.toFixed(2)}{" "}
                    {currency}
                  </p>
                )}
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  !selectedUser ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  isSending ||
                  (user?.balance || 0) < parseFloat(amount || "0")
                }
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Hediye Gönder
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
