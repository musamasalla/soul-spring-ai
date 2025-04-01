
import { useState } from "react";
import { Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI therapy assistant. How are you feeling today? What's on your mind that you'd like to talk about?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response - in a real app, this would be an API call
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "I understand how you feel. It's natural to experience these emotions. Would you like to explore why you might be feeling this way, or would you prefer some techniques to help manage these feelings?",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card className={`max-w-[80%] ${message.role === "user" ? "bg-primary/10" : "glass-card"}`}>
              <CardContent className="p-3">
                <p className="text-sm">{message.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="glass-card">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">AI is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-end space-x-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-secondary/30 border-white/10 resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            AI Therapy
          </Badge>
          <span className="text-xs text-muted-foreground">All conversations are private and secure</span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
