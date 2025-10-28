"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, ShoppingCart } from "lucide-react";
import Purchase from "@/lib/helpers/purchase";
import { Product } from "@/lib/types/product";
import { alert } from "./alerts";
import { useCart } from "@/lib/context/CartContext";
import { useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/lib/context/AuthContext";
import { useContext } from "react";
import { marketplaceService } from "@/lib/api/services/marketplaceService";
import { useRouter } from "next/navigation";

interface ProductActionButtonsProps {
  product: Product;
  isCard?: boolean;
}

export default function ProductActionButtons({
  product,
  isCard = false,
}: ProductActionButtonsProps) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const { addItem, getItemCount, openCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  const marketplaceServiceInstance = marketplaceService();

  const handlePurchase = () => {
    alert({
      title: "Satın Al",
      message: "Satın almak istediğinize emin misiniz?",
      confirmText: "Satın Al",
      cancelText: "İptal",
      autoClose: false,
      showCancel: true,
      onConfirm: () => {
        marketplaceServiceInstance.purchaseProduct([product.id]).then((res) => {
          if (res.success) {
            alert({
              title: "Satın Alındı!",
              message: "Satın aldığınız ürünleriniz kullanımına hazır!",
              confirmText: "Sandığa git",
              cancelText: "Alışverişe devam et",
              onConfirm: () => {
                router.push("/chest");
              },
            });
          } else {
            alert({
              title: "Satın Alım Hatası",
              message: res.message,
              type: "error",
            });
          }
        });
      },
    });
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);

    // Calculate discounted price
    let discountedPrice = product.price;
    let hasProductDiscount = false;
    let productDiscountType: "percentage" | "fixed" | undefined;
    let productDiscountValue: number | undefined;

    if (product.discountValue > 0) {
      hasProductDiscount = true;
      productDiscountType = product.discountType;
      productDiscountValue = product.discountValue;
      
      if (product.discountType === "percentage") {
        discountedPrice = product.price - (product.price * product.discountValue) / 100;
      } else {
        discountedPrice = product.price - product.discountValue;
      }
    }

    // Add item to cart with discount information
    addItem({
      id: product.id,
      name: product.name,
      price: product.price, // Original price
      discountedPrice: Math.max(0, discountedPrice), // Price after product discount
      quantity: 1,
      serverId: product.server_id,
      categoryId: product.category,
      hasProductDiscount,
      productDiscountType,
      productDiscountValue,
    });

    // Show success feedback
    setTimeout(() => {
      setIsAddingToCart(false);
      openCart();
    }, 500);
  };

  // Check if item is already in cart
  const isInCart = getItemCount(product.id) > 0;

  if (isCard) {
    return isAuthenticated && !isLoading ? (
      <div className="flex gap-2">
        <Button
          onClick={handlePurchase}
          disabled={product.stock === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
        >
          Satın Al
        </Button>
        <Button
          onClick={handleAddToCart}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
        >
          {isAddingToCart
            ? "Ekleniyor..."
            : isInCart
            ? `Sepette (${getItemCount(product.id)})`
            : "Sepete Ekle"}
        </Button>
      </div>
    ) : (
      <Link href={`/auth/sign-in?return=${window.location.href}`}>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
          Giriş Yap
        </Button>
      </Link>
    );
  } else {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {isAuthenticated && !isLoading ? (
          <>
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handlePurchase}
              disabled={product.stock === 0}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Hemen Satın Al
            </Button>
            <Button
              size="lg"
              variant={isInCart ? "default" : "outline"}
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart
                ? "Ekleniyor..."
                : isInCart
                ? `Sepette (${getItemCount(product.id)})`
                : "Sepete Ekle"}
            </Button>
          </>
        ) : (
          <Link href={`/auth/sign-in?return=${window.location.href}`}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
              Giriş Yap
            </Button>
          </Link>
        )}
      </div>
    );
  }
  return null;
}
