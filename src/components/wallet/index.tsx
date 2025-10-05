"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Wallet as WalletIcon,
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit3,
  Loader2,
} from "lucide-react";
import { AuthContext } from "@/lib/context/AuthContext";
import { paymentService } from "@/lib/api/services/paymentService";
import { userService } from "@/lib/api/services/userService";
import { PaymentProvider } from "@/lib/types/payment";
import {
  InitiatePaymentData,
  InitiatePaymentResponse,
} from "@/lib/types/payment";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface WalletProps {
  paymentId?: string | null;
  event?: string | null;
}

export default function Wallet({ paymentId, event }: WalletProps) {
  const router = useRouter();
  const WEBSITE_ID = localStorage.getItem("websiteId");
  const { isAuthenticated, isLoading, user, reloadUser } =
    useContext(AuthContext);

  if (!isAuthenticated && !isLoading) {
    router.push("/auth/sign-in?return=/wallet");
  }

  // Create service instances for client-side usage
  const paymentServiceInstance = paymentService();
  const userServiceInstance = userService();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentCredit, setCurrentCredit] = useState(user?.balance || 0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("credit-card");
  const [amount, setAmount] = useState("");
  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    username: user?.username || "",
    email: user?.email || "",
    phone: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  // Payment dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentResponse, setPaymentResponse] =
    useState<InitiatePaymentResponse | null>(null);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Payment status notification states
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"COMPLETED" | "FAILED" | "PENDING" | "ERROR" | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Payment check effect
  useEffect(() => {
    const checkPayment = async () => {
      if (event === "check" && paymentId) {
        setIsCheckingPayment(true);
        setShowPaymentStatus(true);
        
        try {
          const result = await paymentServiceInstance.checkPayment({
            website_id: WEBSITE_ID || "",
            payment_id: paymentId
          });
          
          if (result.success) {
            setPaymentStatus(result.status);
          } else {
            setPaymentStatus("ERROR");
          }
        } catch (error) {
          console.error("Payment check failed:", error);
          setPaymentStatus("ERROR");
        } finally {
          setIsCheckingPayment(false);
        }
      }
    };

    checkPayment();
  }, [event, paymentId]);

  useEffect(() => {
    // Initialize billing info with user data
    if (user) {
      setBillingInfo((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
      }));
      setTempEmail(user.email || "");
      // Update current credit when user data changes
      setCurrentCredit(user.balance || 0);
    }

    paymentServiceInstance
      .getPaymentProviders()
      .then((providers) => {
        setPaymentMethods(
          providers.map((provider: PaymentProvider) => ({
            id: provider.id,
            name: provider.name,
            icon: <CreditCard className="h-5 w-5" />,
            description: provider.description,
          }))
        );
      });
  }, [user]);

  // Handle payment status from URL params
  useEffect(() => {
    if (paymentStatus && paymentId && !isCheckingPayment) {
      // If payment is completed, refresh user data to get updated balance
      if (paymentStatus === "COMPLETED" && user) {
        // Refresh user data after a short delay to allow backend to process
        const refreshTimer = setTimeout(async () => {
          try {
            await reloadUser();
            router.replace("/wallet");
            // Update local credit state with new user data
            if (user.balance !== undefined) {
              setCurrentCredit(user.balance);
            }
          } catch (error) {
            console.error("Failed to refresh user data:", error);
          }
        }, 2000);

        return () => clearTimeout(refreshTimer);
      }

      // Auto-hide the notification after 5 seconds
      const timer = setTimeout(() => {
        setShowPaymentStatus(false);
        // Clear URL parameters to prevent showing notification again on refresh
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("event");
          url.searchParams.delete("paymentId");
          window.history.replaceState({}, "", url.toString());
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, paymentId, user, isCheckingPayment]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleBillingInfoChange = (field: string, value: string) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailEdit = () => {
    setIsEmailEditing(true);
    setTempEmail(billingInfo.email);
  };

  const handleEmailSave = async () => {
    if (!user || !tempEmail || tempEmail === billingInfo.email) {
      setIsEmailEditing(false);
      return;
    }

    setIsUpdatingEmail(true);
    try {
      await userServiceInstance.updateUser(user.id, { email: tempEmail });
      setBillingInfo((prev) => ({ ...prev, email: tempEmail }));
      setIsEmailEditing(false);
    } catch (error) {
      console.error("Email güncellenirken hata oluştu:", error);
      // Reset to original email on error
      setTempEmail(billingInfo.email);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleEmailCancel = () => {
    setIsEmailEditing(false);
    setTempEmail(billingInfo.email);
  };

  const handlePayment = async () => {
    if (!termsAccepted || !amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData: InitiatePaymentData = {
        websiteId: WEBSITE_ID || "",
        providerId: selectedPaymentMethod,
        amount: parseFloat(amount),
        currency: "TRY",
        basket: [
          {
            name: "Kredi Yükleme",
            price: amount,
            quantity: 1,
          },
        ],
        user: {
          name: billingInfo.fullName,
          email: billingInfo.email,
          phone: billingInfo.phone,
          address: "Türkiye",
        },
      };

      const response = await paymentServiceInstance.initiatePayment(paymentData);

      if (response.success) {
        setPaymentResponse(response);
        setShowPaymentDialog(true);

        if (response.type === "redirect") {
          // Redirect to payment URL
          window.location.href = response.redirectUrl;
        }
        // If iframe, it will be displayed in the dialog
      } else {
        console.error("Ödeme başlatılamadı");
      }
    } catch (error) {
      console.error("Ödeme işlemi sırasında hata:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return (
      billingInfo.fullName &&
      billingInfo.phone &&
      termsAccepted &&
      amount &&
      parseFloat(amount) > 0
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Geri Butonu */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cüzdan & Ödeme
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kredinizi görüntüleyin ve güvenli bir şekilde yükleyin
        </p>
      </div>

      {/* Payment Status Notification */}
      {showPaymentStatus && (
        isCheckingPayment ? (
          <div className="mb-6">
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Ödeme durumu kontrol ediliyor...
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lütfen bekleyin, ödeme durumunuzu alıyoruz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : paymentStatus && paymentId ? (
          <div className="mb-6">
            <Card
              className={`${
                paymentStatus === "COMPLETED"
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : paymentStatus === "FAILED"
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : paymentStatus === "ERROR"
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                  : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {paymentStatus === "COMPLETED" ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : paymentStatus === "FAILED" ? (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  ) : paymentStatus === "ERROR" ? (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {paymentStatus === "COMPLETED"
                        ? "Ödeme Başarılı!"
                        : paymentStatus === "FAILED"
                        ? "Ödeme Başarısız"
                        : paymentStatus === "ERROR"
                        ? "Ödeme Hatası"
                        : "Ödeme Beklemede"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {paymentStatus === "COMPLETED"
                        ? "Krediniz başarıyla yüklendi. Krediniz güncelleniyor..."
                        : paymentStatus === "FAILED"
                        ? "Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin."
                        : paymentStatus === "ERROR"
                        ? "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
                        : "Ödeme işleminiz işleniyor. Lütfen bekleyin."}
                    </p>
                    {paymentId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        İşlem ID: {paymentId}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPaymentStatus(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf - Mevcut Kredi ve Billing Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mevcut Kredi Kartı */}
          <Card className="bg-blue-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-6 w-6" />
                Mevcut Krediniz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                ₺
                {currentCredit.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-blue-100 text-sm mb-3">
                Krediniz, mağazada satın aldığınız ürünlerde kullanılabilir.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await reloadUser();
                    // Update local credit state with new user data
                    if (user?.balance !== undefined) {
                      setCurrentCredit(user.balance);
                    }
                  } catch (error) {
                    console.error("Failed to refresh user data:", error);
                  }
                }}
                className="text-blue-100 border-blue-300 hover:bg-blue-400 hover:text-white"
              >
                Krediyi Yenile
              </Button>
            </CardContent>
          </Card>

          {/* Billing Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Fatura Bilgileri
              </CardTitle>
              <CardDescription>
                Ödeme işlemi için gerekli bilgileri doldurun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">İsim Soyisim *</Label>
                  <Input
                    id="fullName"
                    value={billingInfo.fullName}
                    onChange={(e) =>
                      handleBillingInfoChange("fullName", e.target.value)
                    }
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input
                    id="username"
                    value={billingInfo.username}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="Kullanıcı adı"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-posta Adresi</Label>
                  <div className="flex gap-2">
                    {isEmailEditing ? (
                      <>
                        <Input
                          id="email"
                          type="email"
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          placeholder="E-posta adresi"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleEmailSave}
                          disabled={isUpdatingEmail}
                          className="px-3"
                        >
                          {isUpdatingEmail ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEmailCancel}
                          disabled={isUpdatingEmail}
                          className="px-3"
                        >
                          İptal
                        </Button>
                      </>
                    ) : (
                      <>
                        <Input
                          id="email"
                          type="email"
                          value={billingInfo.email}
                          disabled
                          className="bg-gray-100 cursor-not-allowed flex-1"
                          placeholder="E-posta adresi"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEmailEdit}
                          className="px-3"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={billingInfo.phone}
                    onChange={(e) =>
                      handleBillingInfoChange("phone", e.target.value)
                    }
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ödeme Özeti */}
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Yüklenecek Miktar (₺) *</Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="text-lg font-semibold"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Yüklenecek Kredi:</span>
                  <span className="font-medium">₺{amount || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>İşlem Ücreti:</span>
                  <span className="font-medium">₺0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam:</span>
                  <span>₺{amount || "0.00"}</span>
                </div>
              </div>

              {/* Onay Checkbox */}
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={setTermsAccepted}
                />
                <Label htmlFor="terms" className="text-sm">
                  <span className="text-red-500">*</span>{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Kullanım şartlarını
                  </a>{" "}
                  ve{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    gizlilik politikasını
                  </a>{" "}
                  kabul ediyorum
                </Label>
              </div>

              {/* Ödeme Butonu */}
              <Button
                onClick={handlePayment}
                disabled={!isFormValid() || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    İşleniyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Ödemeyi Tamamla
                  </div>
                )}
              </Button>

              {!isFormValid() && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  Lütfen tüm gerekli alanları doldurun ve şartları kabul edin
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Taraf - Ödeme Yöntemi */}
        <div className="space-y-6">
          {/* Ödeme Yöntemi Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Yöntemi
              </CardTitle>
              <CardDescription>
                Tercih ettiğiniz ödeme yöntemini seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex-shrink-0">{method.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentMethod === method.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedPaymentMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog for iframe */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Ödeme İşlemi</DialogTitle>
          </DialogHeader>
          {paymentResponse && paymentResponse.type === "iframe" && (
            <div
              className="w-full h-[calc(90vh-120px)] overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: paymentResponse.iframeHtml.replace(
                  /<iframe/g,
                  '<iframe style="width: 100% !important; height: 100% !important; border: none !important; margin: 0 !important; padding: 0 !important;"'
                ),
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
