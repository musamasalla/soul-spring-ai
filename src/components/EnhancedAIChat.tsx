
import { useState, useEffect, useRef } from "react";
import { Send, RefreshCw, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useSpeechToText } from "@/utils/speechToText";
import { useTextToSpeech } from "@/utils/textToSpeech";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EnhancedAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI therapy assistant. How are you feeling today? What's on your mind that you'd like to talk about?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech to text
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening 
  } = useSpeechToText();
  
  // Text to speech
  const { 
    isSpeaking, 
    speakText, 
    stopSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice
  } = useTextToSpeech();
  
  const [autoSpeak, setAutoSpeak] = useState(false);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-speak assistant messages if enabled
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (autoSpeak && lastMessage && lastMessage.role === "assistant" && !isSpeaking) {
      speakText(lastMessage.content);
    }
  }, [messages, autoSpeak, isSpeaking]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Stop speaking if active
    if (isSpeaking) {
      stopSpeaking();
    }

    // Simulate AI response - in a real app, this would be an API call
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "I understand how you feel. It's natural to experience these emotions. Would you like to explore why you might be feeling this way, or would you prefer some techniques to help manage these feelings?",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
      
      // Auto-speak the response if enabled
      if (autoSpeak) {
        speakText(aiMessage.content);
      }
    }, 1000);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast.info("Listening... Speak clearly into your microphone.");
    }
  };

  const toggleSpeaking = () => {
    setAutoSpeak(!autoSpeak);
    toast.info(autoSpeak ? "Voice responses disabled" : "Voice responses enabled");
  };

  const speakMessage = (message: Message) => {
    if (message.role === "assistant") {
      speakText(message.content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card 
              className={`max-w-[80%] ${message.role === "user" ? "bg-primary/10" : "glass-card"} hover:shadow-md transition-all duration-200`}
              onClick={() => message.role === "assistant" && speakMessage(message)}
            >
              <CardContent className="p-3">
                <p className="text-sm">{message.content}</p>
                {message.role === "assistant" && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-50 hover:opacity-100 mt-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      speakMessage(message);
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="glass-card animate-pulse">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">AI is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-end space-x-2">
          <div className="relative flex-1">
            <Textarea
              placeholder={isListening ? "Listening..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 bg-secondary/30 border-white/10 resize-none pr-10 ${
                isListening ? "border-primary animate-pulse" : ""
              }`}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 bottom-2"
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 text-primary animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? "Stop voice input" : "Start voice input"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSpeaking}
                  className={autoSpeak ? "border-primary" : ""}
                >
                  {autoSpeak ? (
                    <Volume2 className="h-4 w-4 text-primary" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {autoSpeak ? "Disable voice responses" : "Enable voice responses"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

export default EnhancedAIChat;
