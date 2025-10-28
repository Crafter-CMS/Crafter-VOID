"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ticketService } from "@/lib/api/services/ticketService";
import { Ticket, TicketCategory } from "@/lib/types/ticket";
import { lexicalToString } from "@/lib/helpers/lexicalToString";
import CreateTicket from "./ticket/create";
import { AuthContext } from "@/lib/context/AuthContext";

export default function Support() {
  const router = useRouter();
  const {isAuthenticated, isLoading} = useContext(AuthContext);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const ticketServiceInstance = ticketService();

  if(!isLoading && !isAuthenticated) {
    router.push("/auth/sign-in?return=/support");
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, categoriesData] = await Promise.all([
        ticketServiceInstance.getTickets(),
        ticketServiceInstance.getTicketCategories(),
      ]);
      setTickets(ticketsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500";
      case "REPLIED":
        return "bg-yellow-500";
      case "ON_OPERATE":
        return "bg-orange-500";
      case "CLOSED":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Açık";
      case "REPLIED":
        return "Yanıtlandı";
      case "ON_OPERATE":
        return "İşlemde";
      case "CLOSED":
        return "Kapalı";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Destek Merkezi</h1>
        <p className="text-muted-foreground">
          Destek taleplerinizi görüntüleyin ve yeni talep oluşturun
        </p>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets">Destek Talepleri</TabsTrigger>
          <TabsTrigger value="create">Yeni Talep</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <div className="grid gap-4">
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Henüz destek talebiniz bulunmuyor.
                  </p>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/support/${ticket.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {ticket.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {ticket.messages.length > 0 &&
                            lexicalToString(ticket.messages[0].content).substring(0, 100) +
                              "..."}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(ticket.status)}
                        >
                          {getStatusText(ticket.status)}
                        </Badge>
                        <Badge variant="outline">{ticket.category.name}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                      <AvatarImage
                          src={`https://mc-heads.net/avatar/${ticket.createdByUser?.username}/256`}
                        />
                      </Avatar>
                        <span>
                          {ticket.createdByUser?.username || "Bilinmeyen"}
                        </span>
                      </div>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{ticket.messages.length} mesaj</span>
                      <span>•</span>
                      <span>
                        Son güncelleme: {formatDate(ticket.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateTicket 
            categories={categories}
            onTicketCreated={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
