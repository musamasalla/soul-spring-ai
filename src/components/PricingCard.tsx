
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  onButtonClick: () => void;
}

const PricingCard = ({
  title,
  price,
  description,
  features,
  popular,
  buttonText,
  onButtonClick,
}: PricingCardProps) => {
  return (
    <Card className={`relative glass-card ${popular ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
      {popular && (
        <Badge className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="flex justify-center items-end mt-4 mb-2">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-muted-foreground ml-1">/month</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`} 
          variant={popular ? 'default' : 'outline'}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
