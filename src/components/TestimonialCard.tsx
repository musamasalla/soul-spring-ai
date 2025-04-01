
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  initials: string;
}

const TestimonialCard = ({ quote, name, title, initials }: TestimonialCardProps) => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20">
          Verified User
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <CardDescription className="text-foreground text-sm italic">
          "{quote}"
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Avatar className="h-10 w-10 bg-primary/20 text-primary">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TestimonialCard;
