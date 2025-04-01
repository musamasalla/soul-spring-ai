
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
      <p className="text-xl text-foreground mb-4">Oops! Page not found</p>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Return to Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
