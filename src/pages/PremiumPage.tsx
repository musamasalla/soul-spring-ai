import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Check } from "lucide-react";
import PricingCard from "@/components/PricingCard";
import { toast } from "sonner";

const PremiumPage = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock function to simulate subscription process
  const handleSubscribe = async (plan: string) => {
    if (isPremium) {
      toast.info("You're already a premium subscriber!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would call a Supabase edge function to generate a Stripe checkout session
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful subscription
      toast.success(`Redirecting to complete your ${plan} subscription...`);
      
      // In a real app, you'd redirect to Stripe checkout
      // window.location.href = stripeCheckoutUrl;
      
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to process subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = {
    free: [
      "Basic AI therapy assistance",
      "5 journal entries per month",
      "Limited meditation library",
      "Community access"
    ],
    premium: [
      "Unlimited AI therapy sessions",
      "Unlimited journal entries",
      "Full meditation library",
      "Advanced mood tracking analytics",
      "Priority community support",
      "Exclusive premium content"
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 p-4 md:p-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Upgrade Your Well-being Journey</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of MindSpring with our premium features designed to enhance your mental health journey
          </p>
        </div>
        
        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-10">
          <span className={`mr-2 ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <div className="relative">
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <div className="absolute -top-3 -right-3">
              <div className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                Save 25%
              </div>
            </div>
          </div>
          <span className={`ml-2 ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <PricingCard
            title="Free"
            price="Free"
            description="Basic features for your mental wellness journey"
            features={features.free}
            buttonText={isPremium ? "Current Plan" : "Current Plan"}
            onButtonClick={() => navigate('/dashboard')}
          />
          
          {/* Premium Plan */}
          <PricingCard
            title="Premium"
            price={isAnnual ? "$79.99" : "$8.99"}
            description={isAnnual ? "Best value, billed annually" : "Full access, billed monthly"}
            features={features.premium}
            popular={true}
            buttonText={isPremium ? "Current Plan" : "Upgrade Now"}
            onButtonClick={() => handleSubscribe(isAnnual ? 'annual' : 'monthly')}
          />
        </div>
        
        {/* Feature comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center">Free</th>
                  <th className="p-4 text-center">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4">AI Therapy Sessions</td>
                  <td className="p-4 text-center">10 per month</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Journal Entries</td>
                  <td className="p-4 text-center">5 per month</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Meditations</td>
                  <td className="p-4 text-center">10 basic meditations</td>
                  <td className="p-4 text-center">Full library (50+)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Mood Analytics</td>
                  <td className="p-4 text-center">Basic</td>
                  <td className="p-4 text-center">Advanced</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">AI Chat Model</td>
                  <td className="p-4 text-center">Standard</td>
                  <td className="p-4 text-center">Advanced</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Community Access</td>
                  <td className="p-4 text-center">
                    <Check className="h-5 w-5 mx-auto text-green-500" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="h-5 w-5 mx-auto text-green-500" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Premium Community Groups</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">
                    <Check className="h-5 w-5 mx-auto text-green-500" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Voice-to-Text</td>
                  <td className="p-4 text-center">Limited</td>
                  <td className="p-4 text-center">Enhanced</td>
                </tr>
                <tr>
                  <td className="p-4">Priority Support</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">
                    <Check className="h-5 w-5 mx-auto text-green-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the premium subscription work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>When you subscribe to MindSpring Premium, you'll immediately gain access to all premium features, including unlimited AI therapy sessions, the full meditation library, and advanced analytics. You can choose between monthly or annual billing options.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel my subscription?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to premium features until the end of your current billing period. After that, your account will revert to the free tier.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my payment information secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Absolutely. We use Stripe, a PCI-compliant payment processor, to handle all payments securely. Your payment details are never stored on our servers.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens to my data if I downgrade?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your data is never deleted when you downgrade. However, you may lose access to some premium features and content. If you exceed the free tier limits (e.g., more than 5 journal entries per month), you won't be able to add new entries until you upgrade or the next month begins.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumPage;
