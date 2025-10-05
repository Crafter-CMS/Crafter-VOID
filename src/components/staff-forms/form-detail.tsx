"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, User, CheckCircle, AlertCircle } from "lucide-react";
import { StaffForm, StaffFormApplicationValue, StaffFormInput } from "@/lib/types/staff-form";
import { staffFormService } from "@/lib/api/services/staffFormService";
import Title from "../ui/title";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/context/AuthContext";

interface StaffFormDetailProps {
  form: StaffForm;
}

export default function StaffFormDetail({ form }: StaffFormDetailProps) {
  const staffFormServiceInstance = staffFormService();
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if(!isAuthenticated && !isLoading) {
    router.push("/auth/sign-in?return=/staff-forms");
    return null;
  }

  const handleInputChange = (inputId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [inputId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.isActive) {
      setError("Bu form artık aktif değil.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const values: StaffFormApplicationValue[] = Object.entries(formValues).map(([inputId, value]) => ({
        inputId,
        value
      }));

      await staffFormServiceInstance.submitFormApplication(form.id, values);
      setSuccess(true);
      
      // Redirect to main staff forms page after successful submission
      setTimeout(() => {
        router.push("/staff-forms");
      }, 3000);
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderInputField = (input: StaffFormInput) => {
    const inputId = input.name;
    const value = formValues[inputId] || "";

    switch (input.type) {
      case "text":
        return (
          <Input
            id={input.index.toString()}
            name={input.name}
            placeholder={`${input.name} giriniz`}
            value={value}
            onChange={(e) => handleInputChange(inputId, e.target.value)}
            required
          />
        );
      
      case "textarea":
        return (
          <Textarea
            id={input.index.toString()}
            name={input.name}
            placeholder={`${input.name} giriniz`}
            value={value}
            onChange={(e) => handleInputChange(inputId, e.target.value)}
            rows={4}
            required
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={input.index.toString()}
              checked={value === "true"}
              onCheckedChange={(checked) => handleInputChange(inputId, checked ? "true" : "false")}
            />
            <label htmlFor={inputId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {input.name}
            </label>
          </div>
        );
      
      default:
        return (
          <Input
            id={input.index.toString()}
            name={input.name}
            placeholder={`${input.name} giriniz`}
            value={value}
            onChange={(e) => handleInputChange(inputId, e.target.value)}
            required
          />
        );
    }
  };

  if (success) {
    return (
      <div className="container px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Başvurunuz Gönderildi!</h1>
          <p className="text-muted-foreground mb-6">
            {form.title} pozisyonu için başvurunuz başarıyla alındı. 
            En kısa sürede size geri dönüş yapılacaktır.
          </p>
          <Button onClick={() => router.push("/staff-forms")}>
            Diğer Formlara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Form Header */}
      <div className="mb-8">
        <Title
          title={form.title}
          description={form.description}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Details Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Form Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Durum:</span>
                <Badge variant={form.isActive ? "default" : "secondary"}>
                  {form.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Alan Sayısı:</span>
                <span className="text-sm font-medium">{form.inputs.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Oluşturulma:</span>
                <span className="text-sm font-medium">{formatDate(form.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Başvuru Formu</CardTitle>
              <CardDescription>
                Lütfen tüm alanları eksiksiz olarak doldurunuz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!form.isActive && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bu form artık aktif değil ve yeni başvuru kabul etmemektedir.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {form.inputs.map((input, index) => (
                  <div key={input.name} className="space-y-2">
                    <label htmlFor={input.name} className="text-sm font-medium">
                      {input.name}
                      {input.type !== "checkbox" && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderInputField(input)}
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/staff-forms")}
                    disabled={loading}
                  >
                    Geri Dön
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={!form.isActive || loading}
                    className="min-w-[120px]"
                  >
                    {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
