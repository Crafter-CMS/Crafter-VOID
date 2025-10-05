"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ticketService } from "@/lib/api/services/ticketService";
import { TicketCategory, CreateTicketDto } from "@/lib/types/ticket";
import { SerializedEditorState } from "lexical";
import Editor00 from "../../blocks/editor-00";

interface CreateTicketProps {
  categories: TicketCategory[];
  onTicketCreated: () => void;
}

export default function CreateTicket({ categories, onTicketCreated }: CreateTicketProps) {
  const ticketServiceInstance = ticketService();
  const [newTicket, setNewTicket] = useState({
    title: "",
    categoryId: "",
    message: undefined as SerializedEditorState | undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.categoryId || !newTicket.message) {
      return;
    }

    try {
      setSubmitting(true);
      
      const createTicketDto: CreateTicketDto = {
        title: newTicket.title,
        categoryId: newTicket.categoryId,
        message: newTicket.message,
      };

      await ticketServiceInstance.createTicket({ ticket: createTicketDto });
      
      // Form'u temizle
      setNewTicket({
        title: "",
        categoryId: "",
        message: undefined,
      });
      
      onTicketCreated(); // Parent component'e bildir
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditorChange = (value: SerializedEditorState) => {
    setNewTicket({ ...newTicket, message: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Destek Talebi</CardTitle>
        <CardDescription>
          Destek ekibimiz size yardımcı olmak için burada. Lütfen detayları eksiksiz doldurun.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            placeholder="Destek talebinizin başlığını girin"
            value={newTicket.title}
            onChange={(e) =>
              setNewTicket({ ...newTicket, title: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={newTicket.categoryId}
            onValueChange={(value) =>
              setNewTicket({ ...newTicket, categoryId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((cat) => cat.isActive)
                .sort((a, b) => a.order - b.order)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="message">Mesaj</Label>
          <div className="min-h-[200px]">
            <Editor00
              editorSerializedState={newTicket.message}
              onSerializedChange={handleEditorChange}
            />
          </div>
        </div>

        <Button
          onClick={handleCreateTicket}
          disabled={
            !newTicket.title ||
            !newTicket.categoryId ||
            !newTicket.message ||
            submitting
          }
          className="w-full"
        >
          {submitting ? "Oluşturuluyor..." : "Destek Talebi Oluştur"}
        </Button>
      </CardContent>
    </Card>
  );
}
