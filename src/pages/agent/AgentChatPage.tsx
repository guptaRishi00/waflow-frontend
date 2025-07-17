import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Phone, Video, Users } from "lucide-react";
import { mockChatMessages, mockUsers } from "@/lib/mock-data";
// import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const AgentChatPage: React.FC = () => {
  const [messages, setMessages] = useState(mockChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedCustomer] = useState(
    mockUsers.find((u) => u.role === "customer")
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message = {
      id: `msg-${Date.now()}`,
      applicationId: "APP-2024-001",
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Mock customer response for demo
    if (user.role === "agent") {
      setTimeout(() => {
        const customerResponse = {
          id: `msg-${Date.now() + 1}`,
          applicationId: "APP-2024-001",
          senderId: "user-1",
          senderName: "John Doe",
          senderRole: "customer" as const,
          message: "Thank you for the update! That's very helpful.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, customerResponse]);
      }, 1500);
    }
  };

  const handleFileAttach = () => {
    toast({
      title: "File Upload",
      description: "File attachment feature would be implemented here.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Customer Communication
        </h1>
        <p className="text-muted-foreground">
          Chat with customers about their applications
        </p>
      </div>

      <div className="flex-1 flex flex-col mt-6">
        {/* Customer Info Header */}
        {selectedCustomer && (
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {selectedCustomer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                    <Badge variant="outline" className="text-xs">
                      APP-2024-001
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Messages Container */}
        <Card className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderRole === user?.role
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                    message.senderRole === user?.role
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={
                        message.senderRole === "agent"
                          ? "bg-primary text-primary-foreground text-xs"
                          : "bg-secondary text-secondary-foreground text-xs"
                      }
                    >
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.senderRole === user?.role
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>

                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {message.senderRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-2"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFileAttach}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />

              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
