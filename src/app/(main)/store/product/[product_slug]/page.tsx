import { notFound } from "next/navigation";
import { serverProductsService } from "@/lib/api/services/productsService";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { serverMarketplaceService } from "@/lib/api/services/marketplaceService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";
import { formatDate } from "@/lib/utils";
import {
  Package,
  Calendar,
  Tag,
  Server,
  Star,
  Clock,
  CreditCard,
} from "lucide-react";
import { serverServersService } from "@/lib/api/services/serversService";
import { serverCategoriesService } from "@/lib/api/services/categoriesService";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import ProductActionButtons from "@/components/ui/product-action-buttons";
import type { Metadata } from "next";
import { headers } from "next/headers";

interface ProductPageProps {
  params: Promise<{
    product_slug: string;
  }>;
}

export const generateMetadata = async ({ params }: { params: Promise<{ product_slug: string }> }): Promise<Metadata> => {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const product = await serverProductsService(websiteId).getProductById((await params).product_slug);
  return {
    title: product.name,
    description: product.description || "Ürün detayları",
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const websiteService = serverWebsiteService(websiteId as string);
  const productsService = serverProductsService(websiteId as string);
  try {
    const [product, website] = await Promise.all([
      productsService.getProductById((await params).product_slug),
      websiteService.getWebsite({
        id: websiteId || "",
      }),
    ]);

    if (!product) {
      notFound();
    }

    const currency = website.currency;
    const server = await serverServersService(websiteId).getServer(product.server_id);
    const category = await serverCategoriesService(websiteId).getCategory(
      product.category
    );

    // Get bulk discount from marketplace settings
    const marketplaceSettings = await serverMarketplaceService(websiteId).getMarketplaceSettings();
    const bulkDiscount = marketplaceSettings.bulkDiscount;

    // Calculate total discount by combining product discount and bulk discount
    const calculateDiscountedPrice = () => {
      let currentPrice = product.price;
      let totalDiscount = 0;
      let discountDetails = [];

      // Apply product discount first
      if (product.discountValue > 0) {
        let productDiscount = 0;
        if (product.discountType === "percentage") {
          productDiscount = (currentPrice * product.discountValue) / 100;
          discountDetails.push({
            type: "percentage",
            value: product.discountValue,
            amount: productDiscount,
            source: "product"
          });
        } else {
          productDiscount = product.discountValue;
          discountDetails.push({
            type: "fixed",
            value: product.discountValue,
            amount: productDiscount,
            source: "product"
          });
        }
        currentPrice -= productDiscount;
        totalDiscount += productDiscount;
      }

      // Apply bulk discount to the already-discounted price
      if (
        bulkDiscount &&
        (bulkDiscount.products.includes(product.id) || bulkDiscount.products.length === 0)
      ) {
        let bulkDiscountAmount = 0;
        if (bulkDiscount.type === "percentage") {
          bulkDiscountAmount = (currentPrice * bulkDiscount.amount) / 100;
          discountDetails.push({
            type: "percentage",
            value: bulkDiscount.amount,
            amount: bulkDiscountAmount,
            source: "bulk"
          });
        } else {
          bulkDiscountAmount = bulkDiscount.amount;
          discountDetails.push({
            type: "fixed",
            value: bulkDiscount.amount,
            amount: bulkDiscountAmount,
            source: "bulk"
          });
        }
        currentPrice -= bulkDiscountAmount;
        totalDiscount += bulkDiscountAmount;
      }

      return {
        finalPrice: Math.max(0, currentPrice),
        hasDiscount: totalDiscount > 0,
        totalDiscount,
        discountDetails,
        originalPrice: product.price,
      };
    };

    const { finalPrice, hasDiscount, totalDiscount, discountDetails, originalPrice } =
      calculateDiscountedPrice();

    // Calculate total discount percentage for display
    const totalDiscountPercentage = originalPrice > 0 
      ? Math.round((totalDiscount / originalPrice) * 100) 
      : 0;

    return (
      <div>
        {/* Breadcrumb */}
        <DefaultBreadcrumb
          items={[
            { label: "Mağaza", href: "/store" },
            {
              label: category.name,
              href: `/store/${server.slug}/${category.slug}`,
            },
            { label: product.name, href: `/store/product/${product.slug}` },
          ]}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full aspect-square bg-secondary/20 flex items-center justify-center p-8">
                  <Image
                    src={imageLinkGenerate(product.image)}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-contain object-center max-w-full max-h-full"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {product.name}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {hasDiscount ? (
                    <>
                      <span className="text-3xl font-bold text-foreground">
                        {finalPrice.toFixed(2)} {currency}
                      </span>
                      <span className="text-xl text-muted-foreground line-through">
                        {originalPrice} {currency}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        {totalDiscountPercentage}% İndirim
                      </Badge>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">
                      {product.price > 0
                        ? `${product.price} ${currency}`
                        : "Ücretsiz"}
                    </span>
                  )}
                </div>
                
                {/* Discount Details */}
                {hasDiscount && discountDetails.length > 0 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {discountDetails.map((detail, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs">
                          {detail.source === "product" ? "🛍️ Ürün İndirimi:" : "🎯 Toplu İndirim:"}
                        </span>
                        <span>
                          {detail.type === "percentage" 
                            ? `%${detail.value} indirim` 
                            : `${detail.value} ${currency} indirim`
                          }
                        </span>
                        {index < discountDetails.length - 1 && (
                          <span className="text-primary font-medium">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Stok:
                </span>
                {product.stock === -1 ? (
                  <Badge variant="default" className="ml-2">
                    Sınırsız
                  </Badge>
                ) : product.stock > 0 ? (
                  <Badge variant="secondary" className="ml-2">
                    Mevcut
                  </Badge>
                ) : null}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <ProductActionButtons 
              product={product}
              isCard={false}
            />

            <Separator />

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ürün Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sunucu</p>
                      <p className="font-medium">
                        {server?.name || "Bilinmeyen"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kategori</p>
                      <p className="font-medium">{category.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Eklenme Tarihi
                      </p>
                      <p className="font-medium">
                        {formatDate(product.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Güncellenme
                      </p>
                      <p className="font-medium">
                        {formatDate(product.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Etiketler</p>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}
