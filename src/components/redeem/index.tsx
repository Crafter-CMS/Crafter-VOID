"use client";

import {
    RedeemCodeResponse,
    redeemService,
} from "@/lib/api/services/redeemService";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {DefaultBreadcrumb} from "@/components/ui/breadcrumb";
import {useState} from "react";
import {
    FileText,
    Gift,
    CheckCircle,
    XCircle,
    Coins,
    Package,
    Info,
} from "lucide-react";
import Title from "../ui/title";

export default function Redeem() {
    const [code, setCode] = useState("");
    const [response, setResponse] = useState<RedeemCodeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const redeemServiceInstance = redeemService();

    const handleRedeem = async () => {
        if (!code.trim()) return;

        setIsLoading(true);
        try {
            const response = await redeemServiceInstance.redeemCode(code);
            setResponse(response);
            if (response.success) {
                setCode(""); // Clear input on success
            }
        } catch (error: any) {
            setResponse({
                success: false,
                message:
                    error.message ||
                    "Bir hata oluştu. Lütfen tekrar deneyin.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleRedeem();
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <DefaultBreadcrumb items={[{label: "Kod Kullan", href: "/redeem"}]}/>

            {/* Header Section */}
            <Title title="Kod Kullan"
                   description="Satın aldığınız ürünlerin kodlarını buradan kullanarak hesabınıza ekleyebilirsiniz"/>

            {/* Main Redeem Card */}
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Kod Girin</CardTitle>
                    <CardDescription>
                        Ürün kodunuzu aşağıdaki alana yazın ve kullanın
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <FileText
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                        <Input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Örnek: ABC123XYZ"
                            className="pl-10"
                        />
                    </div>
                    <Button
                        onClick={handleRedeem}
                        disabled={isLoading || !code.trim()}
                        className="w-full"
                        size="lg"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>İşleniyor...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Gift className="w-4 h-4"/>
                                <span>Kodu Kullan</span>
                            </div>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Response Display */}
            {response && (
                <Card
                    className={
                        response.success ? "border-green-200" : "border-destructive"
                    }
                >
                    <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                            {response.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600"/>
                            ) : (
                                <XCircle className="w-5 h-5 text-destructive"/>
                            )}
                            <CardTitle
                                className={
                                    response.success ? "text-green-800" : "text-destructive"
                                }
                            >
                                {response.success ? "Kod Başarıyla Kullanıldı!" : "Hata Oluştu"}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p
                            className={
                                response.success ? "text-green-700" : "text-destructive"
                            }
                        >
                            {response.message}
                        </p>

                        {/* Bonus Display */}
                        {response.success && response.bonus && (
                            <div className="bg-muted rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Coins className="w-5 h-5 text-green-600"/>
                                    <span className="font-medium text-foreground">
                    +{response.bonus} Bonus Puan
                  </span>
                                </div>
                            </div>
                        )}

                        {/* Products Display */}
                        {response.success &&
                            response.products &&
                            response.products.length > 0 && (
                                <div className="space-y-3">
                                    <Separator/>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Package className="w-5 h-5 text-muted-foreground"/>
                                        <span className="font-medium text-foreground">
                      Eklenen Ürünler:
                    </span>
                                    </div>
                                    <div className="space-y-2">
                                        {response.products.map((product, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-muted rounded-lg p-3"
                                            >
                        <span className="font-medium text-foreground">
                          {product.name}
                        </span>
                                                <Badge variant="secondary">Eklendi</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </CardContent>
                </Card>
            )}

            {/* Info Section */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"/>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Nasıl Çalışır?</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Satın aldığınız ürünlerin kodlarını buraya girin</li>
                                <li>Kod doğrulandıktan sonra ürünler hesabınıza eklenir</li>
                                <li>Bonus puanlar otomatik olarak hesabınıza tanımlanır</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
