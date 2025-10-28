"use client";

import {useState, useEffect, useContext} from "react";
import {useParams, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Separator} from "@/components/ui/separator";
import {ticketService} from "@/lib/api/services/ticketService";
import {Ticket, ReplyTicketDto} from "@/lib/types/ticket";
import {lexicalToString} from "@/lib/helpers/lexicalToString";
import {SerializedEditorState} from "lexical";
import {Editor} from "@/components/blocks/editor-00/editor";
import {AuthContext} from "@/lib/context/AuthContext";

export default function TicketDetail() {
    const ticketServiceInstance = ticketService();
    const params = useParams();
    const router = useRouter();
    const ticketId = params.ticket_id as string;
    const {isAuthenticated, isLoading} = useContext(AuthContext);

    if (!isLoading && !isAuthenticated) {
        router.push(`/auth/sign-in?return=/support/${ticketId}`);
    }

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState<SerializedEditorState>({
        root: {
            children: [
                {
                    children: [
                        {
                            detail: 0,
                            format: 0,
                            mode: "normal",
                            style: "",
                            text: "",
                            type: "text",
                            version: 1,
                        },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
        },
    } as unknown as SerializedEditorState);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (ticketId) {
            loadTicket();
        }
    }, [ticketId]);

    const loadTicket = async () => {
        try {
            setLoading(true);
            const ticketData = await ticketServiceInstance.getTicket({ticketId});
            setTicket(ticketData);
        } catch (error) {
            console.error("Error loading ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!ticket || !replyContent) return;

        try {
            setSubmitting(true);

            // Lexical content'i doğru formatta hazırla
            const replyDto: ReplyTicketDto = {
                message: replyContent,
            };

            await ticketServiceInstance.replyToTicket({
                ticketId: ticket.id,
                reply: replyDto,
            });

            // Reply content'i temizle ve ticket'ı yenile
            setReplyContent({
                root: {
                    children: [
                        {
                            children: [
                                {
                                    detail: 0,
                                    format: 0,
                                    mode: "normal",
                                    style: "",
                                    text: "",
                                    type: "text",
                                    version: 1,
                                },
                            ],
                            direction: "ltr",
                            format: "",
                            indent: 0,
                            type: "paragraph",
                            version: 1,
                        },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "root",
                    version: 1,
                },
            } as unknown as SerializedEditorState);

            await loadTicket(); // Ticket'ı yenile
        } catch (error) {
            console.error("Error replying to ticket:", error);
        } finally {
            setSubmitting(false);
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
            <div>
                <div className="text-center">Yükleniyor...</div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div>
                <div className="text-center">Ticket bulunamadı.</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{ticket.category.name}</Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                                {getStatusText(ticket.status)}
                            </Badge>
                        </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        <div>Oluşturulma: {formatDate(ticket.createdAt)}</div>
                        <div>Son güncelleme: {formatDate(ticket.updatedAt)}</div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="space-y-6 mb-8">
                {ticket.messages.map((message, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={`https://mc-heads.net/avatar/${message.sender?.username}/256`}
                                    />
                                </Avatar>
                                <div>
                                    <div className="font-medium">
                                        {message.sender?.username || "Bilinmeyen"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDate(ticket.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                {lexicalToString(message.content)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Reply Section */}
            {ticket.status !== "CLOSED" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Yanıt Yaz</CardTitle>
                        <CardDescription>Bu ticket'a yanıt yazın</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="min-h-[200px]">
                            <Editor
                                editorSerializedState={replyContent}
                                onSerializedChange={(value) => {
                                    console.log("Editor content changed:", value); // Debug için
                                    setReplyContent(value);
                                }}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleReply}
                                disabled={submitting}
                                className="min-w-[120px]"
                            >
                                {submitting ? "Gönderiliyor..." : "Yanıt Gönder"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
