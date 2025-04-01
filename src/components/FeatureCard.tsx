
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

const FeatureCard = ({ icon: Icon, title, description, onClick }: FeatureCardProps) => {
  return (
    <Card 
      className="glass-card card-hover cursor-pointer" 
      onClick={onClick}
    >
      <CardHeader className="text-center pb-2">
        <Icon className="feature-icon" />
        <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="text-muted-foreground text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
