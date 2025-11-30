"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/lib/context/AuthContext";
import { userService } from "@/lib/api/services/userService";
import { giftService } from "@/lib/api/services/giftService";
import { chestService } from "@/lib/api/services/chestService";
import { User } from "@/lib/types/user";
import { ChestItem } from "@/lib/types/chest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Image from "next/image";
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

  // Gift type state
  const [giftType, setGiftType] = useState<"balance" | "item">("balance");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Amount state (for balance gifts)
  const [amount, setAmount] = useState("");

  // Chest items state (for item gifts)
  const [chestItems, setChestItems] = useState<ChestItem[]>([]);
  const [selectedChestItem, setSelectedChestItem] = useState<ChestItem | null>(null);
  const [isLoadingChestItems, setIsLoadingChestItems] = useState(false);

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load chest items when gift type changes to "item"
  useEffect(() => {
    if (giftType === "item" && isAuthenticated && user) {
      const loadChestItems = async () => {
        try {
          setIsLoadingChestItems(true);
          const service = chestService();
          const items = await service.getChestItems(user.id);
          // Filter only unused items
          setChestItems(items.filter(item => !item.used));
        } catch (err) {
          console.error("Failed to load chest items:", err);
          setChestItems([]);
        } finally {
          setIsLoadingChestItems(false);
        }
      };
      loadChestItems();
    } else {
      setChestItems([]);
      setSelectedChestItem(null);
    }
  }, [giftType, isAuthenticated, user]);

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

    // Validate based on gift type
    if (giftType === "balance") {
      const amountValue = parseFloat(amount);
      if (!amountValue || amountValue <= 0) {
        setError("Lütfen geçerli bir tutar girin.");
        return;
      }

      if (user.balance < amountValue) {
        setError("Yetersiz bakiye.");
        return;
      }
    } else if (giftType === "item") {
      if (!selectedChestItem) {
        setError("Lütfen bir item seçin.");
        return;
      }
    }

    try {
      setIsSending(true);
      setError(null);
      setSuccess(null);

      const service = giftService();
      
      if (giftType === "balance") {
        const amountValue = parseFloat(amount);
        const response = await service.sendBalanceGift("me", {
          targetUserId: selectedUser.id,
          amount: amountValue,
        });

        if (response.success) {
          setSuccess(
            `${amountValue.toFixed(2)} ${currency} başarıyla ${selectedUser.username} kullanıcısına gönderildi!`
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
      } else if (giftType === "item" && selectedChestItem) {
        const response = await service.sendChestItemGift(
          "default",
          user.id,
          selectedUser.id,
          selectedChestItem.id
        );

        if (response.success) {
          setSuccess(
            `${selectedChestItem.product.name} başarıyla ${selectedUser.username} kullanıcısına gönderildi!`
          );
          toast.success("Hediye başarıyla gönderildi!");
          
          // Reset form
          setSelectedUser(null);
          setSelectedChestItem(null);
          
          // Reload chest items
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setError(response.message || "Hediye gönderilemedi.");
          toast.error("Hediye gönderilemedi.");
        }
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
          {/* Gift Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Hediye Türü
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={giftType === "balance" ? "default" : "outline"}
                onClick={() => {
                  setGiftType("balance");
                  setSelectedChestItem(null);
                  setError(null);
                }}
                disabled={isSending}
                className="h-14"
              >
                💰 Kredi Gönder
              </Button>
              <Button
                type="button"
                variant={giftType === "item" ? "default" : "outline"}
                onClick={() => {
                  setGiftType("item");
                  setAmount("");
                  setError(null);
                }}
                disabled={isSending}
                className="h-14"
              >
                🎁 Item Gönder
              </Button>
            </div>
          </div>

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

          {/* Chest Items Selection (only for item gifts) */}
          {giftType === "item" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Item Seçin
              </label>
              {isLoadingChestItems ? (
                <div className="flex items-center justify-center py-12 border rounded-lg bg-accent/30">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : chestItems.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-accent/30">
                  <p className="text-muted-foreground">Sandığınızda kullanılabilir item yok.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {chestItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedChestItem(item);
                        setError(null);
                      }}
                      className={`group relative rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedChestItem?.id === item.id
                          ? "ring-2 ring-primary shadow-lg scale-105"
                          : "hover:scale-105 hover:shadow-md border"
                      }`}
                      disabled={isSending}
                    >
                      {/* Background */}
                      <div className={`absolute inset-0 transition-all duration-200 ${
                        selectedChestItem?.id === item.id
                          ? "bg-primary/20"
                          : "bg-accent/20 group-hover:bg-primary/10"
                      }`} />
                      
                      {/* Selected indicator */}
                      {selectedChestItem?.id === item.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="relative p-3 flex flex-col items-center gap-2">
                        {/* Item icon */}
                        <div className={`w-12 h-12 rounded-md flex items-center justify-center text-2xl transition-all ${
                          selectedChestItem?.id === item.id
                            ? "bg-primary/20"
                            : "bg-card group-hover:bg-primary/10"
                        }`}>
                          🎁
                        </div>
                        
                        {/* Item name */}
                        <p className={`font-semibold text-xs text-center line-clamp-2 transition-colors w-full ${
                          selectedChestItem?.id === item.id
                            ? "text-primary"
                            : "text-foreground group-hover:text-primary"
                        }`}>
                          {item.product.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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

              {/* Amount Input (only for balance gifts) */}
              {giftType === "balance" && (
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
              )}

              {/* Selected Item Display (only for item gifts) */}
              {giftType === "item" && selectedChestItem && (
                <div className="p-4 rounded-lg border bg-primary/10">
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Seçili Item
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center text-xl">
                      🎁
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary">{selectedChestItem.product.name}</p>
                      <p className="text-xs text-muted-foreground">Seçili Item</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  !selectedUser ||
                  isSending ||
                  (giftType === "balance" &&
                    (!amount ||
                      parseFloat(amount) <= 0 ||
                      (user?.balance || 0) < parseFloat(amount || "0"))) ||
                  (giftType === "item" && !selectedChestItem)
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
