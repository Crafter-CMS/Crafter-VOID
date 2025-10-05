"use client";

import { useState, useEffect, useContext } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Calendar,
  User,
  ArrowRight,
  Clock,
  ClipboardList,
} from "lucide-react";
import { staffFormService } from "@/lib/api/services/staffFormService";
import { StaffForm } from "@/lib/types/staff-form";
import Title from "../ui/title";
import { useRouter } from "next/navigation";
import MyApplications from "./my-applications";
import { AuthContext } from "@/lib/context/AuthContext";

export default function StaffForms() {
  const staffFormServiceInstance = staffFormService();
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const [forms, setForms] = useState<StaffForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("forms");
  const router = useRouter();

  if(!isAuthenticated && !isLoading) {
    router.push("/auth/sign-in?return=/staff-forms");
    return null;
  }

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await staffFormServiceInstance.getForms();
        setForms(data);
      } catch (error) {
        console.error("Error fetching staff forms:", error);
        setError("Başvuru formları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormClick = (formSlug: string) => {
    router.push(`/staff-forms/${formSlug}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">
              Başvuru formları yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <Title
          title="Başvuru Formları"
          description="Mevcut pozisyonlar için başvuru yapabilir veya mevcut başvurularınızı takip edebilirsiniz."
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Mevcut Formlar
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Başvurularım
          </TabsTrigger>
        </TabsList>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          {/* Search Section */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Form ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Forms Grid */}
          {filteredForms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Form bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Arama kriterlerinize uygun form bulunamadı."
                  : "Henüz aktif başvuru formu bulunmuyor."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form) => (
                <Card
                  key={form.id}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                  onClick={() => handleFormClick(form.slug)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {form.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {form.description}
                        </CardDescription>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Form Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{form.inputs.length} alan</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(form.createdAt)}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={form.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {form.isActive ? "Aktif" : "Pasif"}
                        </Badge>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFormClick(form.slug);
                          }}
                        >
                          Başvur
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Section */}
          {forms.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-lg font-semibold mb-3">
                  Başvuru Süreci Hakkında
                </h3>
                <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <span>Formu inceleyin</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <span>Gerekli bilgileri doldurun</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <span>Başvurunuzu gönderin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <MyApplications />
        </TabsContent>
      </Tabs>
    </div>
  );
}
