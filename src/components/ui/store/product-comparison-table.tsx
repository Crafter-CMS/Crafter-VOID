"use client";

import { Category } from "@/lib/types/category";
import { Product } from "@/lib/types/product";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Check, X, Info } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/button";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";

interface ProductComparisonTableProps {
  category: Category;
  products: Product[];
  currency: string;
  bulkDiscount?: {
    amount: number;
    type: "fixed" | "percentage";
  } | null;
}

export default function ProductComparisonTable({ 
  category, 
  products,
  currency,
  bulkDiscount 
}: ProductComparisonTableProps) {
  const { addItem } = useCart();

  if (!category.addons || category.addons.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Bu kategoride karşılaştırma özelliği bulunmamaktadır.
      </div>
    );
  }

  const handleAddToCart = (product: Product) => {
    // Calculate product discount first
    let discountedPrice = product.price;
    let hasProductDiscount = false;

    if (product.discountValue && product.discountValue > 0) {
      hasProductDiscount = true;
      if (product.discountType === "fixed") {
        discountedPrice = Math.max(0, product.price - product.discountValue);
      } else if (product.discountType === "percentage") {
        discountedPrice = Math.max(0, product.price - (product.price * product.discountValue) / 100);
      }
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: discountedPrice,
      quantity: 1,
      serverId: product.server_id,
      categoryId: product.category,
      hasProductDiscount: hasProductDiscount,
      productDiscountType: hasProductDiscount ? product.discountType : undefined,
      productDiscountValue: hasProductDiscount ? product.discountValue : undefined,
    });
  };

  const calculatePrice = (product: Product) => {
    let price = product.price;

    // Ürün indirimi
    if (product.discountValue && product.discountValue > 0) {
      if (product.discountType === "fixed") {
        price -= product.discountValue;
      } else if (product.discountType === "percentage") {
        price -= (price * product.discountValue) / 100;
      }
    }

    // Toplu indirim
    if (bulkDiscount) {
      if (bulkDiscount.type === "fixed") {
        price -= bulkDiscount.amount;
      } else if (bulkDiscount.type === "percentage") {
        price -= (price * bulkDiscount.amount) / 100;
      }
    }

    return Math.max(0, price);
  };

  const formatPrice = (price: number) => {
    const currencySymbols: Record<string, string> = {
      TRY: "₺",
      USD: "$",
      EUR: "€",
    };
    const symbol = currencySymbols[currency] || "₺";
    return `${price.toFixed(2)}${symbol}`;
  };

  const getFeatureValue = (product: Product, addonId: string, featureId: string): { included: boolean; customValue?: string | null } => {
    if (!product.selectedAddons) return { included: false };
    
    const addon = product.selectedAddons.find(a => a.addonId === addonId);
    if (!addon) return { included: false };
    
    const feature = addon.features.find(f => f.featureId === featureId);
    if (!feature) return { included: false };
    
    return {
      included: feature.included === true,
      customValue: feature.customValue
    };
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Ürün Başlıkları - Resim, İsim, Açıklama */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `250px repeat(${products.length}, 1fr)` }}>
          {/* Boş köşe */}
          <div className="p-4"></div>
          
          {/* Ürün kartları */}
          {products.map((product) => {
            const finalPrice = calculatePrice(product);
            const hasDiscount = finalPrice < product.price;

            return (
              <div key={product.id} className="bg-card border-2 border-border/50 rounded-xl p-4 flex flex-col items-center gap-3">
                {/* Ürün Resmi */}
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imageLinkGenerate(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Ürün İsmi */}
                <h3 className="font-bold text-lg text-center line-clamp-2">{product.name}</h3>
                
                {/* Ürün Açıklaması */}
                {product.description && (
                  <p className="text-sm text-muted-foreground text-center line-clamp-3">{product.description}</p>
                )}
                
                {/* Fiyat */}
                <div className="flex flex-col items-center gap-1">
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  <div className="text-xl font-bold text-primary">
                    {formatPrice(finalPrice)}
                  </div>
                </div>
                
                {/* Sepete Ekle Butonu */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Stokta Yok" : "Sepete Ekle"}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Özellikler Tablosu */}
        <div className="bg-card border-2 border-border/50 rounded-xl overflow-hidden">
          {category.addons.map((addon, addonIndex) => (
            <div key={addon.id}>
              {/* Addon Başlığı */}
              <div className="bg-primary/10 border-b border-border/50 p-4">
                <h4 className="font-bold text-lg">{addon.title}</h4>
              </div>
              
              {/* Özellikler */}
              {addon.features.map((feature, featureIndex) => (
                <div
                  key={feature.id}
                  className={`grid gap-4 border-b border-border/20 hover:bg-muted/50 transition-colors ${
                    featureIndex === addon.features.length - 1 && addonIndex === category.addons!.length - 1 
                      ? 'border-b-0' 
                      : ''
                  }`}
                  style={{ gridTemplateColumns: `250px repeat(${products.length}, 1fr)` }}
                >
                  {/* Özellik İsmi ve Info */}
                  <div className="p-4 flex items-center gap-2">
                    <span className="font-medium">{feature.title}</span>
                    {feature.info && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p>{feature.info}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  
                  {/* Her ürün için bu özelliğin durumu */}
                  {products.map((product) => {
                    const featureValue = getFeatureValue(product, addon.id, feature.id);
                    return (
                      <div key={product.id} className="p-4 flex items-center justify-center">
                        {featureValue.included ? (
                          featureValue.customValue ? (
                            <span className="text-sm font-semibold text-foreground">{featureValue.customValue}</span>
                          ) : (
                            <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
                          )
                        ) : (
                          <X className="w-6 h-6 text-red-500" strokeWidth={3} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
