import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Frown, Smile, Meh, Heart, ThumbsUp, Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TherapyTechniqueType } from "./TherapyTechniques";

interface EmotionDetectorProps {
  messages: Array<{
    role: string;
    content: string;
  }>;
  onEmotionDetected?: (emotions: EmotionData) => void;
  className?: string;
  showVisualization?: boolean;
}

// Common emotion keywords for detection
const EMOTION_KEYWORDS = {
  happy: ["happy", "joy", "excited", "pleased", "delighted", "content", "cheerful", "glad", "wonderful", "thrilled", "elated", "good"],
  sad: ["sad", "unhappy", "depressed", "down", "miserable", "gloomy", "heartbroken", "melancholy", "blue", "disappointed", "upset", "grief"],
  angry: ["angry", "mad", "furious", "irritated", "annoyed", "frustrated", "enraged", "hostile", "bitter", "resentful", "outraged", "displeased"],
  anxious: ["anxious", "worried", "nervous", "stressed", "tense", "uneasy", "afraid", "fearful", "overwhelmed", "panic", "distressed", "apprehensive"],
  calm: ["calm", "relaxed", "peaceful", "tranquil", "serene", "still", "quiet", "composed", "centered", "soothing", "at ease", "gentle"],
  neutral: ["neutral", "fine", "okay", "alright", "normal", "moderate", "average", "so-so", "indifferent"],
  tired: ["tired", "exhausted", "fatigued", "drained", "sleepy", "weary", "lethargic"],
  content: ["content", "satisfied", "fulfilled", "pleased", "gratified"],
  excited: ["excited", "thrilled", "eager", "enthusiastic", "animated", "energetic"],
  hopeful: ["hopeful", "optimistic", "encouraged", "confident", "positive", "reassured"],
  confused: ["confused", "perplexed", "puzzled", "uncertain", "unsure", "bewildered"],
  worried: ["worried", "concerned", "troubled", "disturbed", "bothered"],
  frustrated: ["frustrated", "blocked", "hindered", "thwarted", "foiled", "discouraged"]
};

// Map emotions to suitable therapy techniques
const EMOTION_TO_TECHNIQUES: Record<string, TherapyTechniqueType[]> = {
  happy: ["gratitude", "mindfulness", "values"],
  sad: ["cognitive_restructuring", "behavioral_activation", "acceptance", "mindfulness"],
  angry: ["emotional_regulation", "cognitive_restructuring", "mindfulness", "relaxation"],
  anxious: ["relaxation", "mindfulness", "cognitive_restructuring", "grounding", "exposure"],
  calm: ["mindfulness", "relaxation", "gratitude", "values"],
  neutral: ["mindfulness", "values", "behavioral_activation"],
  tired: ["behavioral_activation", "self_care", "relaxation"],
  content: ["gratitude", "values", "mindfulness"],
  excited: ["mindfulness", "behavioral_activation", "values"],
  hopeful: ["goal_setting", "values", "gratitude"],
  confused: ["cognitive_restructuring", "problem_solving", "mindfulness"],
  worried: ["cognitive_restructuring", "relaxation", "grounding", "mindfulness"],
  frustrated: ["emotional_regulation", "problem_solving", "acceptance", "relaxation"]
};

// Names for therapy techniques
const TECHNIQUE_NAMES: Record<TherapyTechniqueType, string> = {
  cognitive_restructuring: "Cognitive Restructuring",
  behavioral_activation: "Behavioral Activation",
  mindfulness: "Mindfulness",
  relaxation: "Relaxation Techniques",
  grounding: "Grounding Exercises",
  values: "Values Exploration",
  exposure: "Gradual Exposure",
  problem_solving: "Problem Solving",
  acceptance: "Acceptance Practice",
  gratitude: "Gratitude Practice",
  emotional_regulation: "Emotional Regulation",
  goal_setting: "Goal Setting",
  self_care: "Self-Care Activities"
};

// Color scheme for emotions
const EMOTION_COLORS = {
  happy: "#4ADE80",
  sad: "#64748B",
  angry: "#EF4444",
  anxious: "#FACC15",
  calm: "#3B82F6",
  neutral: "#A1A1AA",
  tired: "#8B5CF6",
  content: "#38BDF8",
  excited: "#FB923C",
  hopeful: "#34D399",
  confused: "#A78BFA",
  worried: "#FCD34D",
  frustrated: "#F87171"
};

export interface EmotionScore {
  name: string;
  value: number;
}

export interface EmotionData {
  primaryEmotion: string;
  emotionScores: EmotionScore[];
  sentiment: number; // 0-100
  emotionalTrend: 'improving' | 'declining' | 'stable';
  recommendedTechniques?: string[];
  intensityLevel?: 'low' | 'moderate' | 'high' | 'very high';
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({ 
  messages, 
  onEmotionDetected,
  className,
  showVisualization = true
}) => {
  const [emotionData, setEmotionData] = useState<EmotionData>({
    primaryEmotion: 'neutral',
    emotionScores: [],
    sentiment: 50,
    emotionalTrend: 'stable'
  });
  
  // Analyze text for emotions using a keyword-based approach
  const analyzeEmotions = (text: string): EmotionData => {
    const lowerText = text.toLowerCase();
    
    // Initialize scores for each emotion
    const scores: Record<string, number> = {};
    
    // Initialize with a base score
    Object.keys(EMOTION_KEYWORDS).forEach(emotion => {
      scores[emotion] = 0.1; // Small base score
    });
    
    // Count emotion keywords and calculate scores
    Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        // Use word boundary for more accurate matching
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        
        if (matches) {
          // Increase score based on number of matches
          scores[emotion] += matches.length * 1.0;
          
          // Increase score more for exact emotion words
          if (emotion === keyword) {
            scores[emotion] += 0.5;
          }
          
          // Check for intensifiers near emotion words
          const intensifiers = ["very", "really", "extremely", "so", "quite", "incredibly", "terribly"];
          intensifiers.forEach(intensifier => {
            if (lowerText.includes(`${intensifier} ${keyword}`)) {
              scores[emotion] += 0.5;
            }
          });
          
          // Check for negations
          const negations = ["not", "don't", "doesn't", "didn't", "no", "never"];
          negations.forEach(negation => {
            if (lowerText.includes(`${negation} ${keyword}`)) {
              scores[emotion] -= 1.5; // Subtract more than the original addition
            }
          });
        }
      });
    });
    
    // Check for phrases that indicate emotions more complex than single words
    const emotionPhrases = [
      { phrase: "feel better", emotion: "improving", score: 1.0 },
      { phrase: "getting better", emotion: "improving", score: 1.0 },
      { phrase: "feel worse", emotion: "declining", score: 1.0 },
      { phrase: "getting worse", emotion: "declining", score: 1.0 },
      { phrase: "mixed feelings", emotion: "neutral", score: 0.8 },
      { phrase: "ups and downs", emotion: "neutral", score: 0.8 },
      { phrase: "weight on my shoulders", emotion: "anxious", score: 1.2 },
      { phrase: "cloud hanging over", emotion: "sad", score: 1.2 },
      { phrase: "weight lifted", emotion: "happy", score: 1.2 },
      { phrase: "butterflies in my stomach", emotion: "anxious", score: 1.2 },
      { phrase: "at peace", emotion: "calm", score: 1.5 },
      { phrase: "on edge", emotion: "anxious", score: 1.5 },
      { phrase: "lost my temper", emotion: "angry", score: 1.5 },
      { phrase: "heavy heart", emotion: "sad", score: 1.2 },
      { phrase: "looking forward to", emotion: "hopeful", score: 1.2 },
      { phrase: "dread", emotion: "anxious", score: 1.5 },
      { phrase: "can't understand", emotion: "confused", score: 1.0 },
      { phrase: "don't know what to do", emotion: "confused", score: 1.0 },
      { phrase: "keep thinking about", emotion: "worried", score: 1.0 },
      { phrase: "can't stop thinking", emotion: "worried", score: 1.2 },
      { phrase: "over and over", emotion: "worried", score: 0.8 },
      { phrase: "stuck", emotion: "frustrated", score: 1.0 },
      { phrase: "can't make progress", emotion: "frustrated", score: 1.0 }
    ];
    
    emotionPhrases.forEach(({ phrase, emotion, score }) => {
      if (lowerText.includes(phrase)) {
        if (emotion === "improving" || emotion === "declining") {
          // These are for trend detection, not emotion scores
        } else if (emotion in scores) {
          scores[emotion] += score;
        }
      }
    });
    
    // Convert scores to array and sort
    const emotionScores = Object.entries(scores)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // Determine primary emotion (highest score)
    const primaryEmotion = emotionScores[0].name;
    
    // Calculate overall sentiment (0-100)
    const positiveEmotions = ["happy", "calm", "content", "excited", "hopeful"];
    const negativeEmotions = ["sad", "angry", "anxious", "frustrated", "worried", "confused"];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    emotionScores.forEach(({ name, value }) => {
      if (positiveEmotions.includes(name)) {
        positiveScore += value;
      } else if (negativeEmotions.includes(name)) {
        negativeScore += value;
      }
    });
    
    const totalScore = positiveScore + negativeScore;
    const sentiment = totalScore > 0 
      ? Math.round((positiveScore / totalScore) * 100) 
      : 50;
    
    // Determine emotional trend
    const improveTerms = ["better", "improving", "improved", "improvement", "progress", "progressing", "hopeful"];
    const declineTerms = ["worse", "declining", "declined", "deteriorating", "deteriorated", "struggling", "struggle"];
    
    let improvingCount = 0;
    let decliningCount = 0;
    
    improveTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        improvingCount += matches.length;
      }
    });
    
    declineTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        decliningCount += matches.length;
      }
    });
    
    let emotionalTrend: 'improving' | 'declining' | 'stable' = "stable";
    
    if (improvingCount > decliningCount && improvingCount > 0) {
      emotionalTrend = "improving";
    } else if (decliningCount > improvingCount && decliningCount > 0) {
      emotionalTrend = "declining";
    }
    
    // Recommend therapy techniques based on emotions
    const recommendedTechniques: string[] = [];
    
    // Get techniques for primary emotion
    if (primaryEmotion in EMOTION_TO_TECHNIQUES) {
      EMOTION_TO_TECHNIQUES[primaryEmotion].slice(0, 2).forEach(technique => {
        recommendedTechniques.push(TECHNIQUE_NAMES[technique]);
      });
    }
    
    // Add technique from secondary emotion if available and different
    if (emotionScores.length > 1) {
      const secondaryEmotion = emotionScores[1].name;
      if (secondaryEmotion in EMOTION_TO_TECHNIQUES) {
        const secondaryTechnique = EMOTION_TO_TECHNIQUES[secondaryEmotion][0];
        const techniqueName = TECHNIQUE_NAMES[secondaryTechnique];
        if (!recommendedTechniques.includes(techniqueName)) {
          recommendedTechniques.push(techniqueName);
        }
      }
    }
    
    // Determine intensity level
    const topEmotionValue = emotionScores[0].value;
    let intensityLevel: 'low' | 'moderate' | 'high' | 'very high' = 'moderate';
    
    if (topEmotionValue < 1) {
      intensityLevel = 'low';
    } else if (topEmotionValue < 3) {
      intensityLevel = 'moderate';
    } else if (topEmotionValue < 5) {
      intensityLevel = 'high';
    } else {
      intensityLevel = 'very high';
    }
    
    return {
      primaryEmotion,
      emotionScores,
      sentiment,
      emotionalTrend,
      recommendedTechniques,
      intensityLevel
    };
  };
  
  // Process messages to extract user text
  useEffect(() => {
    if (messages && messages.length > 0) {
      // Extract user messages (last 3)
      const userMessages = messages
        .filter(msg => msg.role === "user")
        .slice(-3)
        .map(msg => msg.content);
      
      // Combine and analyze user messages
      if (userMessages.length > 0) {
        const text = userMessages.join(" ");
        const data = analyzeEmotions(text);
        
        setEmotionData(data);
        
        // Call the callback if provided
        if (onEmotionDetected) {
          onEmotionDetected(data);
        }
      }
    }
  }, [messages, onEmotionDetected]);
  
  // Format top emotions for the pie chart
  const getChartData = () => {
    if (!emotionData.emotionScores || emotionData.emotionScores.length === 0) {
      return [];
    }
    
    // Take top 4 emotions
    return emotionData.emotionScores
      .slice(0, 4)
      .map(({ name, value }) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.max(value, 0.1) // Ensure minimum value for visibility
      }));
  };
  
  const chartData = getChartData();
  
  // Get appropriate icon for emotional trend
  const getTrendIcon = () => {
    switch (emotionData.emotionalTrend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getIntensityColor = () => {
    switch (emotionData.intensityLevel) {
      case 'very high':
        return "text-red-500";
      case 'high':
        return "text-amber-500";
      case 'moderate':
        return "text-blue-500";
      case 'low':
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Emotion Analysis
          <Badge 
            variant={emotionData.emotionalTrend === 'improving' ? 'success' : 
                   emotionData.emotionalTrend === 'declining' ? 'destructive' : 
                   'outline'} 
            className="ml-auto flex items-center gap-1 text-xs"
          >
            {getTrendIcon()}
            <span>{emotionData.emotionalTrend === 'improving' ? 'Improving' : 
                  emotionData.emotionalTrend === 'declining' ? 'Declining' : 
                  'Stable'}</span>
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Primary: <span className="font-medium capitalize">{emotionData.primaryEmotion}</span></span>
          <span className={cn("text-xs font-medium", getIntensityColor())}>
            {emotionData.intensityLevel} intensity
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="mb-3">
          <div className="flex justify-between mb-1 text-xs text-muted-foreground">
            <span>Negative</span>
            <span>Positive</span>
          </div>
          <Progress 
            value={emotionData.sentiment} 
            className="h-2" 
            indicatorClassName={emotionData.sentiment > 66 ? "bg-success" : 
                                emotionData.sentiment > 33 ? "bg-amber-500" : 
                                "bg-destructive"}
          />
        </div>
        
        {showVisualization && chartData.length > 0 && (
          <div className="flex items-center justify-center h-32 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={EMOTION_COLORS[entry.name.toLowerCase() as keyof typeof EMOTION_COLORS] || "#A1A1AA"} 
                    />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number, name: string) => [`${name}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {emotionData.recommendedTechniques && emotionData.recommendedTechniques.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Recommended techniques:</p>
            <div className="flex flex-wrap gap-1">
              {emotionData.recommendedTechniques.map((technique, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {technique}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionDetector; 