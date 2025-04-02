import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Menu, X, Activity, Brain, BookOpen, Users, Crown, ChevronLeft, ChevronRight, HeartPulse, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Custom hook for horizontal scroll handling
function useHorizontalScroll(options = { threshold: 5, scrollAmount: 150 }) {
  const scrollRef = useRef<HTMLElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Update scroll indicators
  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Calculate if we can scroll left or right
    const hasLeftScroll = el.scrollLeft > options.threshold;
    const hasRightScroll = Math.abs(
      el.scrollLeft + el.clientWidth - el.scrollWidth
    ) > options.threshold;
    
    setCanScrollLeft(hasLeftScroll);
    setCanScrollRight(hasRightScroll);
  }, [options.threshold]);
  
  // Handle scrolling functions
  const scrollLeft = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Calculate optimal scroll amount based on viewport width
    const scrollAmount = Math.min(
      options.scrollAmount, 
      window.innerWidth < 640 ? 100 : 200
    );
    
    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    // Update indicators after animation completes
    setTimeout(() => updateScrollIndicators(), 300);
  }, [options.scrollAmount, updateScrollIndicators]);
  
  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Calculate optimal scroll amount based on viewport width
    const scrollAmount = Math.min(
      options.scrollAmount, 
      window.innerWidth < 640 ? 100 : 200
    );
    
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    // Update indicators after animation completes
    setTimeout(() => updateScrollIndicators(), 300);
  }, [options.scrollAmount, updateScrollIndicators]);
  
  // Handle direct scrolling to a specific item
  const scrollToItem = useCallback((itemElement: HTMLElement) => {
    const el = scrollRef.current;
    if (!el || !itemElement) return;
    
    const containerLeft = el.getBoundingClientRect().left;
    const itemLeft = itemElement.getBoundingClientRect().left;
    const scrollOffset = itemLeft - containerLeft - 10; // 10px padding
    
    el.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    setTimeout(() => updateScrollIndicators(), 300);
  }, [updateScrollIndicators]);
  
  // Force update on window resize for reliability
  useEffect(() => {
    const forceUpdate = () => {
      // Small delay to let the DOM settle after resize
      setTimeout(updateScrollIndicators, 100);
    };
    
    window.addEventListener('resize', forceUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', forceUpdate);
    };
  }, [updateScrollIndicators]);
  
  // Set up listeners
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const handleScroll = () => updateScrollIndicators();
    
    // Handle resize with debounce for performance
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateScrollIndicators();
      }, 100);
    };
    
    // Initial check
    updateScrollIndicators();
    
    // Set up listeners
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Cleanup
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [updateScrollIndicators]);
  
  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    scrollToItem,
    updateScrollIndicators
  };
}

// Detect viewport size for responsive adaptations
function useViewport() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    // Debounced resize handler
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Return common breakpoints
  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024
  };
}

const Header = () => {
  const navigate = useNavigate();
  const { logout, user, isPremium } = useAuth();
  const viewport = useViewport();
  
  // Define menuItems with active state tracking
  const menuItems = [
    { label: "AI Therapy", path: "/ai-therapy", icon: Brain },
    { label: "Meditation", path: "/meditation", icon: Activity },
    { label: "Mood History", path: "/mood-history", icon: HeartPulse },
    { label: "Recommendations", path: "/recommendations", icon: Sparkles },
    { label: "Journal", path: "/journal", icon: BookOpen },
    { label: "Community", path: "/community", icon: Users },
    { label: "Premium", path: "/premium", icon: Crown },
  ];
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState('');
  
  // Update active path based on current location
  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);
  
  // Use our custom hook for desktop navigation
  const {
    scrollRef: desktopScrollRef,
    canScrollLeft: desktopCanScrollLeft,
    canScrollRight: desktopCanScrollRight,
    scrollLeft: desktopScrollLeft,
    scrollRight: desktopScrollRight,
    updateScrollIndicators: updateDesktopIndicators,
    scrollToItem: scrollToDesktopItem
  } = useHorizontalScroll({ threshold: 5, scrollAmount: viewport.isMobile ? 100 : 200 });
  
  // Use our custom hook for mobile navigation
  const {
    scrollRef: mobileScrollRef,
    canScrollLeft: mobileCanScrollLeft,
    canScrollRight: mobileCanScrollRight,
    scrollLeft: mobileScrollLeft,
    scrollRight: mobileScrollRight,
    updateScrollIndicators: updateMobileIndicators,
    scrollToItem: scrollToMobileItem
  } = useHorizontalScroll({ threshold: 5, scrollAmount: 100 });
  
  // Scroll active item into view on initial render
  useEffect(() => {
    if (activePath) {
      setTimeout(() => {
        // Find the active menu item button in desktop navigation
        const desktopActiveItem = document.querySelector(
          `.desktop-nav-items button[data-path="${activePath}"]`
        ) as HTMLElement;
        
        if (desktopActiveItem && desktopScrollRef.current) {
          scrollToDesktopItem(desktopActiveItem);
        }
        
        // Find the active menu item button in mobile navigation
        const mobileActiveItem = document.querySelector(
          `.mobile-nav-items button[data-path="${activePath}"]`
        ) as HTMLElement;
        
        if (mobileActiveItem && mobileScrollRef.current && isMenuOpen) {
          scrollToMobileItem(mobileActiveItem);
        }
      }, 300);
    }
  }, [activePath, isMenuOpen, scrollToDesktopItem, scrollToMobileItem]);
  
  // Handle window scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate therapy progress (replace with real data later)
  useEffect(() => {
    setProgress(65); // Example progress
  }, []);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    
    // If opening menu, check scroll indicators after a short delay
    if (newState) {
      setTimeout(() => {
        updateMobileIndicators();
        
        // Find and scroll to active item if necessary
        const activeItem = document.querySelector(
          `.mobile-nav-items button[data-path="${activePath}"]`
        ) as HTMLElement;
        
        if (activeItem && mobileScrollRef.current) {
          scrollToMobileItem(activeItem);
        }
      }, 100);
    }
  };
  
  // Handle navigation with active state update
  const handleNavigation = (path: string) => {
    setActivePath(path);
    navigate(path);
    if (viewport.isMobile) {
      setIsMenuOpen(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header 
      className={cn(
        "fixed top-0 w-full py-2 md:py-3 px-3 md:px-5 border-b flex items-center justify-between bg-background/80 backdrop-blur-sm z-50 transition-all duration-200",
        scrolled ? "shadow-sm" : ""
      )}
    >
      <div className="flex items-center gap-2 min-w-[180px]">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <Logo 
          size="xl" 
          variant="colored" 
          showText={true} 
          onClick={() => handleNavigation("/")} 
          useSvg={true}
        />
      </div>
      
      {/* Mobile Menu */}
      <div className={cn(
        "fixed left-0 right-0 top-[65px] p-4 bg-background border-b md:hidden transition-transform duration-200",
        isMenuOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="relative w-full overflow-hidden">
          {/* Left scroll indicator */}
          {mobileCanScrollLeft && (
            <button 
              onClick={mobileScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-sm rounded-r-full p-2 hover:bg-secondary transition-opacity" 
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          
          {/* Mobile navigation */}
          <div 
            ref={mobileScrollRef as React.RefObject<HTMLDivElement>}
            className="overflow-x-auto scrollbar-hide pb-2 px-10 w-full"
          >
            <div className="flex space-x-3 min-w-max pb-2 mobile-nav-items">
              {menuItems.map((item) => (
                <Button 
                  key={item.path}
                  data-path={item.path}
                  variant={activePath === item.path ? "default" : "ghost"}
                  className="flex-shrink-0 whitespace-nowrap gap-2" 
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Right scroll indicator */}
          {mobileCanScrollRight && (
            <button 
              onClick={mobileScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-sm rounded-l-full p-2 hover:bg-secondary transition-opacity" 
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:block flex-1 mx-4 overflow-hidden">
        <div className="relative w-full">
          {/* Left scroll indicator */}
          {desktopCanScrollLeft && (
            <button 
              onClick={desktopScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-sm rounded-r-full p-2 hover:bg-secondary transition-opacity" 
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          
          {/* Desktop navigation */}
          <nav 
            ref={desktopScrollRef as React.RefObject<HTMLElement>}
            className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-10 py-2 w-full"
          >
            <div className="flex items-center space-x-3 desktop-nav-items">
              {menuItems.map((item) => (
                <Button 
                  key={item.path}
                  data-path={item.path}
                  variant={activePath === item.path ? "default" : "ghost"}
                  className="text-foreground hover:bg-secondary gap-2 flex-shrink-0 whitespace-nowrap" 
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
          
          {/* Right scroll indicator */}
          {desktopCanScrollRight && (
            <button 
              onClick={desktopScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-sm rounded-l-full p-2 hover:bg-secondary transition-opacity" 
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 min-w-[120px] justify-end">
        {/* Progress Indicator */}
        <div className="hidden lg:flex items-center gap-2 mr-4">
          <div className="w-32">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Premium Badge */}
        {isPremium && (
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex items-center gap-1 rounded-full border-primary/50 text-primary"
            onClick={() => handleNavigation("/premium")}
          >
            <Crown className="h-4 w-4" />
            <span className="text-xs">PRO</span>
          </Button>
        )}
        
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
