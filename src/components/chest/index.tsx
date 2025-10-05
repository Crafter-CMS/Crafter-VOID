"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import ChestItemCard from "./chest-item-card";
import { ChestItem } from "@/lib/types/chest";
import { AuthContext } from "@/lib/context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { chestService } from "@/lib/api/services/chestService";
import { alert } from "../ui/alerts";
import { useRouter } from "next/navigation";

export default function Chest() {
  const [chestItems, setChestItems] = useState<ChestItem[]>([]);
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  const router = useRouter();

  // Create chestService instance for client-side usage
  const chestServiceInstance = chestService();

  useEffect(() => {
    const fetchChestItems = async () => {
      if (!user?.id) return;

      try {
        const items = await chestServiceInstance.getChestItems(user.id);
        setChestItems(items);
      } catch (error) {
        console.error("Error fetching chest items:", error);
      }
    };

    if (isAuthenticated && user) {
      fetchChestItems();
    }
  }, [user, isAuthenticated]);

  const handleUseItem = async (itemId: string) => {
    if (!user?.id) return;

    try {
      const res = await chestServiceInstance.useChestItem(user.id, itemId);

      if (res.success) {
        setChestItems(
          chestItems.map((item) =>
            item.id === itemId ? { ...item, used: true } : item
          )
        );

        alert({
          title: "Başarılı",
          message: "Eşya başarıyla kullanıldı ve oyuna gönderildi.",
          type: "success",
          confirmText: "Tamam",
        });
      } else {
        alert({
          title: "Hata",
          message: res.message || "Eşya kullanılırken bir hata oluştu.",
          type: "error",
          confirmText: "Tamam",
        });
      }
    } catch (error) {
      console.error("Error using chest item:", error);
      alert({
        title: "Hata",
        message: "Eşya kullanılırken bir hata oluştu.",
        type: "error",
        confirmText: "Tamam",
      });
    }
  };

  if (!isAuthenticated && !isLoading) {
    router.push("/auth/sign-in?return=/chest");
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sandığınızdaki Ürünler</CardTitle>
          <CardDescription>Yükleniyor...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sandığınızdaki Ürünler</CardTitle>
        <CardDescription>
          Sandığınızdaki ürünleri görüntüleyin veya kullanın.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chestItems.length > 0 ? (
            chestItems.map((item) => (
              <ChestItemCard key={item.id} item={item} action={handleUseItem} />
            ))
          ) : (
            <p className="text-muted-foreground">Sandığınızda ürün bulunmuyor.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
