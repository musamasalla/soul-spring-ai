
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCard from "@/components/TestimonialCard";
import PricingCard from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Sparkles, Users, BookOpen, Brain } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Your Mental Health Journey <span className="text-primary">Enhanced</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-10">
            Discover how MindSpring AI helps you navigate your mental health journey with personalized guidance and support
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/ai-therapy')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start AI Therapy
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/meditation')}
            >
              <Brain className="mr-2 h-4 w-4" />
              Try Guided Meditation
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 bg-secondary/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Personalized Mental Wellness Tools</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={MessageSquare}
                title="AI Therapy Chat"
                description="Connect with our AI therapist for personalized conversations about your mental health journey"
                onClick={() => navigate('/ai-therapy')}
              />
              <FeatureCard 
                icon={Brain}
                title="Guided Meditation"
                description="Experience tailored meditation sessions to help reduce anxiety and improve mindfulness"
                onClick={() => navigate('/meditation')}
              />
              <FeatureCard 
                icon={Heart}
                title="Mood Tracking"
                description="Monitor your emotional wellbeing with AI-powered insights and visualization tools"
                onClick={() => navigate('/mood')}
              />
              <FeatureCard 
                icon={BookOpen}
                title="Journaling"
                description="Express your thoughts in a secure space with AI-guided reflection prompts"
                onClick={() => navigate('/journal')}
              />
              <FeatureCard 
                icon={Users}
                title="Support Community"
                description="Connect with others on their mental health journey in a moderated, safe environment"
                onClick={() => navigate('/community')}
              />
              <FeatureCard 
                icon={Sparkles}
                title="AI Insights"
                description="Receive personalized mental health insights and recommendations based on your activity"
                onClick={() => navigate('/insights')}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Community Stories</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              See how MindSpring is helping people on their mental health journey
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard 
                quote="MindSpring has transformed how I deal with anxiety. The AI therapy sessions feel surprisingly personal and helpful."
                name="Sarah M."
                title="Using MindSpring for 6 months"
                initials="SM"
              />
              <TestimonialCard 
                quote="The guided meditations have helped me find moments of peace during an otherwise chaotic time in my life."
                name="Michael R."
                title="Mental Health Advocate"
                initials="MR"
              />
              <TestimonialCard 
                quote="Having an AI therapist available 24/7 has been incredibly valuable for managing my depression and building healthy habits."
                name="Lisa K."
                title="Wellness Coach"
                initials="LK"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-6 bg-secondary/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Choose Your Wellness Path</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Select the journey that best aligns with your mental health goals
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard 
                title="Free"
                price="$0"
                description="Start your wellness journey"
                features={[
                  "Basic AI chat functionality",
                  "Limited meditation content",
                  "Access to community forums",
                  "Daily mood tracking"
                ]}
                buttonText="Get Started"
                onButtonClick={() => navigate('/signup')}
              />
              <PricingCard 
                title="Premium"
                price="$9.99"
                description="Enhance your mental wellness"
                features={[
                  "Unlimited AI therapy sessions",
                  "Personalized meditation library",
                  "Full journaling features",
                  "Priority community support",
                  "Advanced mood insights"
                ]}
                popular
                buttonText="Go Premium"
                onButtonClick={() => navigate('/premium')}
              />
              <PricingCard 
                title="Professional"
                price="$19.99"
                description="Connect with human professionals"
                features={[
                  "All Premium features",
                  "Monthly session with licensed therapist",
                  "Custom wellness plan",
                  "AI-enhanced progress tracking",
                  "Exclusive group sessions"
                ]}
                buttonText="Choose Professional"
                onButtonClick={() => navigate('/professional')}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-primary/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Begin Your Wellness Journey Today</h2>
            <p className="text-lg mb-8">
              Join our community and discover the transformative power of AI-assisted mental health support.
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/get-started')}
            >
              Start Your Journey
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Mind<span className="text-primary">Spring</span></h3>
              <p className="text-sm text-muted-foreground">AI-powered mental wellness</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">About</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</a>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} MindSpring AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
