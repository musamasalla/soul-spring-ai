import { useState, useEffect, useRef, useCallback } from "react";
import { Send, RefreshCw, Mic, MicOff, Volume2, VolumeX, Clock, PlusCircle, Save, Calendar, FileText, ChevronUp, ChevronDown, Heart, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useSpeechToText } from "@/utils/speechToText";
import { useTextToSpeech } from "@/utils/textToSpeech";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EmotionDetector, { EmotionData } from "./EmotionDetector";
import TherapyTechniques, { TechniqueData } from "./TherapyTechniques";
import "./EnhancedAIChat.css";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isThinking?: boolean;
  isTransition?: boolean;
}

interface ConversationSession {
  id: string;
  title: string;
  lastUpdated: Date;
  topicCategory?: string;
}

// Therapy session stages and topics
const sessionStages = ['opening', 'exploration', 'closing'] as const;
type SessionStage = typeof sessionStages[number];

const therapyTopics = [
  { name: 'Anxiety', category: 'mental_health' },
  { name: 'Depression', category: 'mental_health' },
  { name: 'Stress', category: 'mental_health' },
  { name: 'Relationships', category: 'relationships' },
  { name: 'Family Issues', category: 'relationships' },
  { name: 'Work-life Balance', category: 'work' },
  { name: 'Self-esteem', category: 'personal_growth' },
  { name: 'Grief', category: 'emotions' },
  { name: 'Sleep Issues', category: 'wellness' },
  { name: 'General Wellness', category: 'wellness' },
];

// Session transition hints and reflections
const stageTransitionPrompts = {
  'opening': {
    title: 'Starting Your Session',
    prompts: [
      "How are you feeling today?",
      "What brings you here today?",
      "What's been on your mind recently?",
      "Is there something specific you'd like to focus on in our session today?",
      "How have things been since our last conversation?"
    ]
  },
  'assessment': {
    title: 'Exploring Your Situation',
    prompts: [
      "Can you tell me more about when you first noticed this?",
      "How has this been affecting your daily life?",
      "What thoughts come up for you when you experience this?",
      "Have you noticed any patterns around when this happens?",
      "On a scale of 1-10, how would you rate the intensity of this experience?"
    ]
  },
  'intervention': {
    title: 'Working Through Solutions',
    prompts: [
      "What strategies have you tried so far?",
      "What do you think might help in this situation?",
      "Would you be open to exploring a different perspective on this?",
      "Let's think about what a small, manageable step forward might look like",
      "What resources or support do you already have that could help?"
    ]
  },
  'closing': {
    title: 'Wrapping Up Our Session',
    prompts: [
      "What's your main takeaway from our conversation today?",
      "How are you feeling now compared to when we started?",
      "What's one small step you might take based on what we discussed?",
      "What would you like to focus on in our next session?",
      "Is there anything else you'd like to address before we wrap up?"
    ]
  }
};

// Therapy reflections to deepen the conversation
const therapeuticReflections = {
  anxiety: [
    "I notice you mentioned feeling anxious. How does anxiety typically show up in your body?",
    "Anxiety often involves worry about future events. Is that something you experience?",
    "Many people with anxiety describe racing thoughts. Does that resonate with your experience?",
    "Sometimes anxiety is connected to specific triggers. Have you noticed any patterns?"
  ],
  depression: [
    "Depression can affect our energy levels and motivation. How has your energy been lately?",
    "Sometimes depression changes how we see ourselves. Has it affected how you view yourself?",
    "Many people experience changes in sleep or appetite with depression. Have you noticed any changes?",
    "Depression can make it hard to find enjoyment. Are there things that still bring you some pleasure?"
  ],
  relationships: [
    "Relationship difficulties often involve communication patterns. What's communication like in this relationship?",
    "Boundaries are important in relationships. How do you feel about the boundaries in this situation?",
    "Our past relationships sometimes influence our current ones. Do you see any patterns from your past?",
    "Relationships involve balancing our needs with others'. How do you feel your needs are being met?"
  ],
  general: [
    "It sounds like this has been challenging for you. What helps you cope when things are difficult?",
    "Our thoughts can strongly influence our emotions. Have you noticed how your thoughts affect how you feel?",
    "Self-compassion can be helpful when we're struggling. How kind are you to yourself during difficult times?",
    "Sometimes our values guide us through challenges. What values are important to you in this situation?"
  ]
};

interface TherapySessionProps {
  sessionId?: string | null;
  currentStage?: 'opening' | 'assessment' | 'intervention' | 'closing';
  onStageUpdate?: (stage: string) => void;
  sessionTopics?: string[];
  completionPercentage?: number;
  onCompletionUpdate?: (percentage: number) => void;
  onNewMessage?: (message: { role: string; content: string }) => void;
}

const EnhancedAIChat = ({
  sessionId,
  currentStage = 'opening',
  onStageUpdate,
  sessionTopics = [],
  completionPercentage = 0,
  onCompletionUpdate,
  onNewMessage
}: TherapySessionProps = {}) => {
  const { user, isPremium } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI therapy assistant. How are you feeling today? What's on your mind that you'd like to talk about?",
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("New Session");
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [sessionStage, setSessionStage] = useState<SessionStage>('opening');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sessionGoal, setSessionGoal] = useState<string>("");
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showReflectionPrompts, setShowReflectionPrompts] = useState(false);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [recommendedTechniques, setRecommendedTechniques] = useState<string[]>([]);
  const [showEmotionPanel, setShowEmotionPanel] = useState(false);
  const [showTechniquesPanel, setShowTechniquesPanel] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  
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
    selectedVoice,
    setSelectedVoice
  } = useTextToSpeech();
  
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Load chat history on component mount
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);
  
  // Show session setup dialog for new sessions
  useEffect(() => {
    if (!activeSession && messages.length === 1) {
      // Only show for new sessions
      setShowSetupDialog(true);
    }
  }, [activeSession, messages.length]);
  
  // Handle session setup completion
  const handleSessionSetup = () => {
    setShowSetupDialog(false);
    
    // Add personalized initial message based on topics
    if (selectedTopics.length > 0) {
      const topicNames = selectedTopics.map(topicId => 
        therapyTopics.find(t => t.name === topicId)?.name || topicId
      );
      
      const topicMessage = topicNames.length === 1 
        ? `I understand you'd like to discuss ${topicNames[0]}.` 
        : `I understand you'd like to discuss topics like ${topicNames.join(', ')}.`;
        
      const goalMessage = sessionGoal 
        ? ` Your goal for today's session is: ${sessionGoal}.` 
        : '';
        
      setMessages([{
        role: "assistant",
        content: `Hi there! I'm your AI therapy assistant. ${topicMessage}${goalMessage} How are you feeling about this today?`,
        timestamp: new Date()
      }]);
    }
  };
  
  // Load chat sessions from Supabase
  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setSessions(data.map(session => ({
        id: session.id,
        title: session.title,
        lastUpdated: new Date(session.created_at)
      })));
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };
  
  // Load messages for a session
  const loadSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const sessionMessages: Message[] = data.map(msg => ({
        id: msg.id,
        role: msg.is_ai ? 'assistant' : 'user',
        content: msg.is_ai ? msg.ai_response : msg.user_message,
        timestamp: new Date(msg.created_at)
      }));
      
      if (sessionMessages.length > 0) {
        setMessages(sessionMessages);
        
        // Find session title
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          setSessionTitle(session.title);
        }
        
        setActiveSession(sessionId);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new chat session
  const createNewSession = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi there! I'm your AI therapy assistant. How are you feeling today? What's on your mind that you'd like to talk about?",
        timestamp: new Date()
      },
    ]);
    setSessionTitle("New Session");
    setActiveSession(null);
    setSessionStage('opening');
    setSelectedTopics([]);
    setSessionGoal("");
    setShowSetupDialog(true);
  };
  
  // Save current session
  const saveSession = async () => {
    try {
      // If no active session, create one
      if (!activeSession) {
        const selectedTopicCategories = selectedTopics.map(topic => 
          therapyTopics.find(t => t.name === topic)?.category || 'general'
        );
        
        // Get most common category
        const categoryCounts: Record<string, number> = {};
        selectedTopicCategories.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        
        const topCategory = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0])[0] || 'general';
          
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user?.id,
            title: sessionTitle,
            topic_category: topCategory,
            session_goal: sessionGoal,
            topics: selectedTopics
          })
          .select('id')
          .single();
        
        if (error) throw error;
        
        // Save all messages
        const messagesToSave = messages.map(msg => ({
          session_id: data.id,
          user_id: user?.id,
          user_message: msg.role === 'user' ? msg.content : '',
          ai_response: msg.role === 'assistant' ? msg.content : '',
          is_ai: msg.role === 'assistant'
        }));
        
        const { error: messagesError } = await supabase
          .from('ai_chat_history')
          .insert(messagesToSave);
          
        if (messagesError) throw messagesError;
        
        setActiveSession(data.id);
        toast.success('Conversation saved');
        loadSessions();
      } else {
        // Update existing session title
        const { error } = await supabase
          .from('chat_sessions')
          .update({ 
            title: sessionTitle,
            topics: selectedTopics,
            session_goal: sessionGoal
          })
          .eq('id', activeSession);
          
        if (error) throw error;
        toast.success('Conversation updated');
        loadSessions();
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save conversation');
    }
  };

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
  }, [messages, autoSpeak, isSpeaking, speakText]);

  // Function to use suggested prompt
  const usePrompt = (prompt: string) => {
    setInput(prompt);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };
  
  // Update suggested prompts based on current stage and topics
  useEffect(() => {
    // Get stage-specific prompts
    const stagePrompts = stageTransitionPrompts[currentStage as keyof typeof stageTransitionPrompts]?.prompts || [];
    
    // Get topic-specific reflections
    let topicReflections: string[] = [];
    if (sessionTopics.length > 0) {
      // Map topics to reflection categories
      const topicToCategory: Record<string, keyof typeof therapeuticReflections> = {
        'Anxiety': 'anxiety',
        'Depression': 'depression',
        'Relationships': 'relationships',
        'Family Issues': 'relationships',
        'Work Issues': 'relationships',
        'Stress': 'anxiety',
        'Self-esteem': 'depression',
        'Sleep': 'depression',
        'Trauma': 'general'
      };
      
      // Get reflections for the first matching topic
      for (const topic of sessionTopics) {
        const category = topicToCategory[topic] || 'general';
        if (therapeuticReflections[category]) {
          topicReflections = therapeuticReflections[category];
          break;
        }
      }
    }
    
    if (topicReflections.length === 0) {
      topicReflections = therapeuticReflections.general;
    }
    
    // Combine and shuffle prompts
    const combinedPrompts = [...stagePrompts, ...topicReflections];
    const shuffled = combinedPrompts.sort(() => 0.5 - Math.random());
    
    // Take first 5 or fewer
    setSuggestedPrompts(shuffled.slice(0, 5));
  }, [currentStage, sessionTopics]);

  // Check for stage progression based on message content and count
  useEffect(() => {
    if (!onStageUpdate || messages.length < 4 || stageCompleted) return;
    
    // Simple logic for stage transitions based on message count
    const messageThresholds = {
      'opening': 6,      // 3 exchanges
      'assessment': 14,  // 7 exchanges
      'intervention': 24, // 12 exchanges
      'closing': 30      // 15 exchanges
    };
    
    const currentThreshold = messageThresholds[currentStage as keyof typeof messageThresholds];
    
    if (currentStage !== 'closing' && messages.length >= currentThreshold) {
      // Check content of last few messages to see if the stage is complete
      const lastMessages = messages.slice(-4);
      const combinedContent = lastMessages.map(m => m.content).join(' ').toLowerCase();
      
      // Stage-specific completion markers
      const completionMarkers: Record<string, string[]> = {
        'opening': ['understand', 'tell me more', 'go deeper', 'explore', 'let\'s focus on'],
        'assessment': ['strategy', 'technique', 'could try', 'might help', 'suggestion', 'recommend'],
        'intervention': ['reflect', 'learned', 'insight', 'progress', 'next time', 'conclusion']
      };
      
      const markers = completionMarkers[currentStage as keyof typeof completionMarkers] || [];
      const hasCompletionMarker = markers.some(marker => combinedContent.includes(marker));
      
      if (hasCompletionMarker) {
        // Calculate next stage
        const stages = ['opening', 'assessment', 'intervention', 'closing'];
        const currentIndex = stages.indexOf(currentStage);
        if (currentIndex >= 0 && currentIndex < stages.length - 1) {
          const nextStage = stages[currentIndex + 1];
          onStageUpdate(nextStage);
          
          // Add a transition message
          const transitionMessage = {
            role: "assistant",
            content: `I think we've made good progress understanding your situation. Let's move into ${stageTransitionPrompts[nextStage as keyof typeof stageTransitionPrompts]?.title.toLowerCase()}.`,
            timestamp: new Date(),
            isTransition: true
          };
          
          setMessages(prev => [...prev, transitionMessage]);
          setStageCompleted(true);
          
          // Reset after a short delay
          setTimeout(() => {
            setStageCompleted(false);
          }, 2000);
        }
      }
    }
    
    // Update completion percentage
    if (onCompletionUpdate) {
      const stagesOrder = ['opening', 'assessment', 'intervention', 'closing'];
      const currentStageIndex = stagesOrder.indexOf(currentStage);
      const totalStages = stagesOrder.length;
      
      // Calculate progress within current stage
      const currentThreshold = messageThresholds[currentStage as keyof typeof messageThresholds] || 10;
      const prevThreshold = currentStageIndex > 0 
        ? messageThresholds[stagesOrder[currentStageIndex - 1] as keyof typeof messageThresholds] 
        : 0;
      
      const messagesInCurrentStage = Math.min(messages.length - prevThreshold, currentThreshold - prevThreshold);
      const progressInCurrentStage = messagesInCurrentStage / (currentThreshold - prevThreshold);
      
      // Overall progress is previous stages plus progress in current stage
      const previousStagesPercentage = (currentStageIndex / totalStages) * 100;
      const currentStagePercentage = (1 / totalStages) * progressInCurrentStage * 100;
      
      const totalPercentage = Math.min(previousStagesPercentage + currentStagePercentage, 100);
      onCompletionUpdate(totalPercentage);
    }
  }, [messages, currentStage, onStageUpdate, stageCompleted, onCompletionUpdate]);

  // Override sendMessageToAI to include session context
  const sendMessageToAI = useCallback(async (userMessage: string) => {
    try {
      setChatError(null);
      
      // Get session token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Call the Supabase Edge Function with enhanced context
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          message: userMessage,
          sessionId: activeSession,
          sessionStage: currentStage,
          topics: sessionTopics,
          messageCount: messages.length
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle usage limits error
        if (response.status === 403 && errorData.error === "Usage limit reached") {
          toast.error(errorData.message);
          return null;
        }
        
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Update session stage if needed
      if (data.sessionStage && data.sessionStage !== sessionStage) {
        setSessionStage(data.sessionStage);
      }
      
      return data.response;
    } catch (error) {
      setChatError('Failed to communicate with AI assistant. Please try again.');
      console.error('Error in AI communication:', error);
      return null;
    }
  }, [activeSession, currentStage, sessionTopics, messages.length]);

  // Handle sending user message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message immediately
    const userMessageObj: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    
    // Notify parent about the new message
    if (onNewMessage) {
      onNewMessage({ role: "user", content: userMessage });
    }
    
    // Add AI thinking indicator
    setIsTyping(true);
    
    try {
      // Get AI response
      const response = await sendMessageToAI(userMessage);
      
      // Remove typing indicator and add actual response
      setIsTyping(false);
      
      if (response) {
        // Add AI response
        const aiMessageObj: Message = {
        role: "assistant",
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev.filter(m => !m.isThinking), aiMessageObj]);
        
        // Notify parent about the new AI message
        if (onNewMessage) {
          onNewMessage({ role: "assistant", content: response });
        }
        
        // If it's a new session, try to generate a title from the first exchange
        if (!activeSession && messages.length === 2) {
          const suggestedTitle = generateSessionTitle(userMessage, response);
          if (suggestedTitle) {
            setSessionTitle(suggestedTitle);
          }
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      setIsTyping(false);
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate a session title from the first exchange
  const generateSessionTitle = (userMessage: string, aiResponse: string) => {
    // Extract key topics using a simple approach
    const combinedText = `${userMessage} ${aiResponse}`;
    
    // Look for therapy topics in the text
    const foundTopic = therapyTopics.find(topic => 
      combinedText.toLowerCase().includes(topic.name.toLowerCase())
    );
    
    if (foundTopic) {
      return `${foundTopic.name} Discussion`;
    }
    
    // Try to extract a key phrase (simplified)
    const words = userMessage.split(/\s+/).filter(w => w.length > 3);
    if (words.length > 2) {
      return `Discussion about ${words[0]} ${words[1]}...`;
    }
    
    return null;
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

  // Handle emotion detection
  const handleEmotionDetected = (emotion: EmotionData) => {
    setEmotionData(emotion);
    
    // If negative emotions are high, suggest showing crisis resources
    if (emotion.sentiment < 30 && 
        (emotion.primaryEmotion === 'sad' || 
         emotion.primaryEmotion === 'anxious' || 
         emotion.emotionalTrend === 'declining')) {
      setShowCrisisResources(true);
    }
    
    // Set recommended techniques
    if (emotion.recommendedTechniques) {
      setRecommendedTechniques(emotion.recommendedTechniques);
    }
  };
  
  // Handle technique selection
  const handleTechniqueSelected = (technique: TechniqueData) => {
    // Add a message from the assistant explaining the technique
    const techniqueMessage = {
      role: "assistant" as const,
      content: `I think the **${technique.name}** technique might be helpful for you right now. 
      
${technique.description}

It only takes about ${technique.duration} minutes. Would you like me to guide you through it?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, techniqueMessage]);
    scrollToBottom();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 rounded-lg shadow-sm">
        {/* Chat Header */}
        <div className="border rounded-t-lg bg-card p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                <AvatarImage src="/ai-therapist-avatar.png" alt="AI Therapist" />
              </Avatar>
              <div>
                <h3 className="font-semibold">AI Therapist</h3>
                <p className="text-xs text-muted-foreground">
                  {sessionTitle || "New Session"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowEmotionPanel(!showEmotionPanel)}
                      className={showEmotionPanel ? "text-primary" : ""}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Emotion Analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                      onClick={() => setShowTechniquesPanel(!showTechniquesPanel)}
                      className={showTechniquesPanel ? "text-primary" : ""}
                    >
                      <Brain className="h-5 w-5" />
                  </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Therapy Techniques</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={toggleListening}
                    className={isListening ? "voice-active text-primary" : ""}
                  >
                    {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? "Stop Listening" : "Start Listening"}
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
          <Button 
                    size="icon"
                    variant="outline"
                    onClick={toggleSpeaking}
                    className={autoSpeak ? "text-primary" : ""}
                  >
                    {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {autoSpeak ? "Disable Auto-Speak" : "Enable Auto-Speak"}
                </TooltipContent>
              </Tooltip>
              
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                    size="icon"
                  variant="outline"
                    onClick={createNewSession}
                  >
                    <PlusCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                  New conversation
              </TooltipContent>
            </Tooltip>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stage transition banner */}
          {currentStage && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-medium flex items-center text-primary">
                {stageTransitionPrompts[currentStage as keyof typeof stageTransitionPrompts]?.title || 'Therapy Session'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {currentStage === 'opening' && "Let's begin by understanding what's on your mind today."}
                {currentStage === 'assessment' && "Now let's explore your situation more deeply to understand the context."}
                {currentStage === 'intervention' && "Let's work on some strategies and perspectives that might help."}
                {currentStage === 'closing' && "Let's reflect on what we've discussed and identify next steps."}
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/ai-avatar.png" alt="AI" />
                  <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground chat-bubble-user"
                    : message.isTransition 
                      ? "bg-primary/10 border border-primary/20 chat-bubble-assistant" 
                      : "bg-secondary chat-bubble-assistant"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 text-right mt-1">
                  {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {message.role === "user" && (
                <Avatar className="h-8 w-8 ml-2">
                  <AvatarImage src={user?.avatarUrl || ""} alt="User" />
                  <AvatarFallback className="bg-primary/10">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/ai-avatar.png" alt="AI" />
                <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
              </Avatar>
              <div className="bg-secondary p-3 rounded-lg chat-bubble-assistant">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          {chatError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm text-center">
              {chatError}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setChatError(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Crisis Resources Dialog */}
        <Dialog open={showCrisisResources} onOpenChange={setShowCrisisResources}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Need immediate support?</DialogTitle>
              <DialogDescription>
                If you're having thoughts of harming yourself or experiencing a mental health crisis, please reach out for help immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="border-l-4 border-primary p-3 bg-primary/10 rounded">
                <h4 className="font-semibold">Crisis Text Line</h4>
                <p className="text-sm">Text HOME to 741741 to connect with a Crisis Counselor</p>
              </div>
              
              <div className="border-l-4 border-primary p-3 bg-primary/10 rounded">
                <h4 className="font-semibold">National Suicide Prevention Lifeline</h4>
                <p className="text-sm">Call 988 or 1-800-273-8255 (available 24/7)</p>
              </div>
              
              <div className="border-l-4 border-primary p-3 bg-primary/10 rounded">
                <h4 className="font-semibold">Emergency Services</h4>
                <p className="text-sm">Call 911 (US) or your local emergency number</p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Note: This AI is not a replacement for professional mental health support. If you're in crisis, please use one of the resources above.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowCrisisResources(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Suggested prompts */}
        {suggestedPrompts.length > 0 && (
          <div className="px-4 py-2 border-t border-border/40 bg-secondary/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-muted-foreground">Suggested prompts</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => setShowReflectionPrompts(!showReflectionPrompts)}
              >
                {showReflectionPrompts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
            
            {showReflectionPrompts && (
              <div className="flex flex-wrap gap-2 mb-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs bg-background/50 whitespace-normal h-auto py-1 justify-start"
                    onClick={() => usePrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Side panels */}
      <div className="w-full md:w-[350px] space-y-4">
        {showEmotionPanel && (
          <EmotionDetector 
            messages={messages} 
            onEmotionDetected={handleEmotionDetected}
          />
        )}
        
        {showTechniquesPanel && (
          <TherapyTechniques 
            emotionData={emotionData || undefined}
            recommendedTechniques={recommendedTechniques}
            onTechniqueSelected={handleTechniqueSelected}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedAIChat;

