"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { staffFormService } from "@/lib/api/services/staffFormService";
import { StaffFormApplication } from "@/lib/types/staff-form";
import Title from "../ui/title";
import { useRouter } from "next/navigation";

export default function MyApplications() {
  const staffFormServiceInstance = staffFormService();
  const [applications, setApplications] = useState<StaffFormApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await staffFormServiceInstance.getMyApplications();
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Başvurularınız yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-500">Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      case "pending":
        return <Badge variant="secondary">Beklemede</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">
              Başvurularınız yükleniyor...
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
          title="Başvurularım"
          description="Daha önce gönderdiğiniz başvuruların durumunu takip edebilirsiniz."
        />
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz başvuru yapmadınız</h3>
          <p className="text-muted-foreground mb-6">
            Aktif pozisyonlar için başvuru yaparak ekibimizin bir parçası olabilirsiniz.
          </p>
          <Button onClick={() => router.push("/staff-forms")}>
            Başvuru Formlarını Görüntüle
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {application.form?.title || "Bilinmeyen Form"}
                    </CardTitle>
                    <CardDescription>
                      Başvuru ID: {application.id}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Application Details */}
                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Gönderim:</span>
                      <span className="font-medium">{formatDate(application.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Güncelleme:</span>
                      <span className="font-medium">{formatDate(application.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Form Values Preview */}
                  {application.values.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Gönderilen Bilgiler:</h4>
                        <div className="space-y-2">
                          {application.values.slice(0, 3).map((value, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-muted-foreground">
                                {value.inputId}:
                              </span>
                              <span className="ml-2 font-medium">
                                {value.value.length > 50 
                                  ? `${value.value.substring(0, 50)}...` 
                                  : value.value
                                }
                              </span>
                            </div>
                          ))}
                          {application.values.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{application.values.length - 3} daha fazla alan
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Status Message */}
                  {application.status === "pending" && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Başvurunuz incelenmektedir. Bu süreç genellikle 1-3 iş günü sürmektedir.
                      </AlertDescription>
                    </Alert>
                  )}

                  {application.status === "approved" && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Tebrikler! Başvurunuz onaylandı. Ekibimiz sizinle iletişime geçecektir.
                      </AlertDescription>
                    </Alert>
                  )}

                  {application.status === "rejected" && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Maalesef başvurunuz onaylanmadı. Daha sonra tekrar deneyebilirsiniz.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push("/staff-forms")}
          >
            Yeni Başvuru Yap
          </Button>
          
          <Button 
            onClick={() => router.push("/profile")}
          >
            Profilime Git
          </Button>
        </div>
      </div>
    </div>
  );
}
