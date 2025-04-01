
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings, LogOut } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would toggle the theme
  };

  return (
    <header className="w-full py-4 px-6 border-b border-white/10 flex items-center justify-between bg-background">
      <div className="flex items-center">
        <h1 
          className="text-xl font-bold cursor-pointer" 
          onClick={() => navigate("/")}
        >
          Mind<span className="text-primary">Spring</span>
        </h1>
      </div>
      
      <nav className="hidden md:flex items-center space-x-1">
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-secondary" 
          onClick={() => navigate("/ai-therapy")}
        >
          AI Therapy
        </Button>
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-secondary" 
          onClick={() => navigate("/meditation")}
        >
          Meditation
        </Button>
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-secondary" 
          onClick={() => navigate("/journal")}
        >
          Journal
        </Button>
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-secondary" 
          onClick={() => navigate("/community")}
        >
          Community
        </Button>
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-secondary" 
          onClick={() => navigate("/resources")}
        >
          Resources
        </Button>
      </nav>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full border-primary/50 text-primary"
          onClick={() => navigate("/premium")}
        >
          <span className="text-xs">PRO</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5 text-foreground" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => navigate("/logout")}
        >
          <LogOut className="h-5 w-5 text-foreground" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
