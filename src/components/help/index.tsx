"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  MessageCircle,
} from "lucide-react";
import { helpService } from "@/lib/api/services/helpService";
import { HelpData, HelpCategory, HelpItem, HelpFAQ } from "@/lib/types/help";
import Title from "../ui/title";
import { DefaultBreadcrumb } from "../ui/breadcrumb";
import renderIcon from "@/lib/helpers/renderIcon";
import { lexicalToString } from "@/lib/helpers/lexicalToString";
import { useRouter } from "next/navigation";

export default function Help({ discordLink }: { discordLink: string }) {
  const [helpData, setHelpData] = useState<HelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("categories");
  const router = useRouter();

  const helpServiceInstance = helpService();

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        setLoading(true);
        // Burada gerçek websiteId kullanılmalı
        const data = await helpServiceInstance.getHelpCenter({
          query: {
            activeOnly: true,
            limit: 50,
          },
        });

        console.log(data);
        setHelpData(data);
      } catch (error) {
        console.error("Error fetching help data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpData();
  }, []);

  const filteredCategories =
    helpData?.categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredFAQs =
    helpData?.faqs.filter(
      (faq) =>
        JSON.stringify(faq.question)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        JSON.stringify(faq.answer)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  const getCategoryItems = (categoryId: string) => {
    return (
      helpData?.items.filter((item) => item.categoryId === categoryId) || []
    );
  };

  if (loading) {
    return (
      <div className="container  px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary  mb-4"></div>
            <p className="text-muted-foreground">
              Yardım verileri yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DefaultBreadcrumb items={[{ label: "Yardım Merkezi", href: "/help" }]} />

      {/* Header */}
      <Title
        title="Yardım Merkezi"
        description="Sunucumuz hakkında bilmeniz gereken her şey burada. Sorularınızın cevaplarını bulun ve oyun deneyiminizi geliştirin."
      />

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Yardım konularında ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md  mb-8">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Kategoriler
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            SSS
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tüm İçerik
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setActiveTab("search");
                }}
              >
                <CardHeader className="justify-center text-center">
                  <div className="text-4xl mb-2">{renderIcon(category.icon)}</div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge variant="secondary">
                      {getCategoryItems(category.id).length} makale
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <div className="max-w-4xl ">
            <div className="text-left mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                Sık Sorulan Sorular
              </h2>
              <p className="text-muted-foreground">
                En çok sorulan sorular ve cevapları
              </p>
            </div>

            {searchQuery && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  "{searchQuery}" için {filteredFAQs.length} sonuç bulundu
                </p>
              </div>
            )}

            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border border-border"
                >
                  <AccordionTrigger className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {lexicalToString(faq.question)}
                      </CardTitle>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {lexicalToString(faq.answer)}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <div className="max-w-4xl ">
            {selectedCategory !== "all" && (
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory("all")}
                  className="mb-4"
                >
                  ← Tüm kategorilere dön
                </Button>
                <h2 className="text-2xl font-semibold">
                  {
                    helpData?.categories.find((c) => c.id === selectedCategory)
                      ?.name
                  }
                </h2>
              </div>
            )}

            {searchQuery && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  "{searchQuery}" için{" "}
                  {filteredCategories.length + filteredFAQs.length} sonuç
                  bulundu
                </p>
              </div>
            )}

            <div className="space-y-4">
              {helpData?.items
                .filter(
                  (item) =>
                    selectedCategory === "all" ||
                    item.categoryId === selectedCategory
                )
                .filter(
                  (item) =>
                    searchQuery === "" ||
                    item.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    JSON.stringify(item.content)
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      router.push(`/help/${item.id}`);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge variant="outline">{item.category?.name}</Badge>
                      </div>
                      <CardDescription>
                        {item.views} görüntülenme
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {lexicalToString(item.content).substring(0, 150)}
                        ...
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Separator className="my-12" />
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-4">
          Hala yardıma mı ihtiyacınız var?
        </h3>
        <p className="text-muted-foreground mb-6">
          Sorularınızı destek ekibimize iletebilir veya ticket
          oluşturabilirsiniz.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="default" size="lg" onClick={() => router.push("/support")}>
            Destek Talebi Oluştur
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push(discordLink)}>
            Discord'a Katıl
          </Button>
        </div>
      </div>
    </div>
  );
}
