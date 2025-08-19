"use client";

import { useState } from "react";
import { customerSupport } from "@/ai/flows/customer-support-flow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, Bot } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function CustomerSupportChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await customerSupport({ question: input });
      const assistantMessage: Message = {
        role: "assistant",
        content: result.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error calling customer support flow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start h-full p-4">
      <Card className="w-full max-w-2xl h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Customer Support Chat</CardTitle>
          <CardDescription>
            Ask me about our menu, opening hours, or promotions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                        key={index}
                        className={cn(
                            "flex items-start gap-3",
                            message.role === "user" ? "justify-end" : ""
                        )}
                        >
                        {message.role === "assistant" && (
                            <Avatar className="h-8 w-8">
                                 <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            "rounded-lg p-3 text-sm max-w-[80%]",
                            message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                        >
                            {message.content}
                        </div>
                         {message.role === "user" && (
                             <Avatar className="h-8 w-8">
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
