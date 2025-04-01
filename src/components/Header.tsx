
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full py-4 px-6 border-b border-border flex items-center justify-between bg-background">
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
          onClick={() => navigate("/premium")}
        >
          Premium
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
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 text-foreground" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
