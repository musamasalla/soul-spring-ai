import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Sun, Moon, Home, Settings, Book, Brain, Activity, MessageCircle, Inbox, Heart, Users, Bot, Crown, Star, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBar } from '@/components/ui/StatusBar';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
  isOffline?: boolean;
}

export function AppShell({ 
  children, 
  showNav = true,
  isOffline = false
}: AppShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auto-collapse sidebar on small screens
  useEffect(() => {
    if (windowWidth < 1024) {
      setSidebarExpanded(false);
    }
  }, [windowWidth]);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    setIsOpen(false);
  };

  const toggleSidebarExpansion = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Define navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview of your wellness journey'
    },
    {
      name: 'Therapy Goals',
      href: '/therapy',
      icon: CheckCircle2,
      description: 'Manage therapy goals and sessions'
    },
    {
      name: 'Mood History',
      href: '/mood-history',
      icon: Activity,
      description: 'Track your mood over time'
    },
    {
      name: 'AI Therapy',
      href: '/ai-therapy',
      icon: Bot,
      description: 'Advanced AI-powered therapy sessions'
    },
    {
      name: 'Meditation',
      href: '/meditation',
      icon: Heart,
      description: 'Guided meditation exercises'
    },
    {
      name: 'Programs',
      href: '/meditation-programs',
      icon: Star,
      description: 'Structured meditation programs'
    },
    {
      name: 'Journal',
      href: '/journal',
      icon: Inbox,
      description: 'Write and reflect on your thoughts'
    },
    {
      name: 'Community',
      href: '/community',
      icon: Users,
      description: 'Connect with supportive community'
    },
    {
      name: 'Recommendations',
      href: '/recommendations',
      icon: Book,
      description: 'Personalized mental health recommendations'
    },
    {
      name: 'Premium',
      href: '/premium',
      icon: Crown,
      description: 'Upgrade to premium features'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'App and account settings'
    }
  ];
  
  // Sidebar animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    }
  };
  
  // Overlay animation variants
  const overlayVariants = {
    open: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    closed: { 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  
  // Navigation item hover animation
  const navItemVariants = {
    initial: { y: 0 },
    hover: { y: -2 }
  };
  
  // Handle sidebar expansion on mouse events for desktop
  const handleMouseEnter = () => {
    if (!sidebarExpanded) {
      setSidebarExpanded(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isOpen) {
      setSidebarExpanded(false);
    }
  };
  
  // Handle window resize to auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-30 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-3 sm:px-4">
          <div className="flex items-center space-x-3 lg:space-x-0">
            {showNav && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="touch-target -ml-2 lg:hidden">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="sm" showText={true} />
            </Link>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />
            
            {/* User avatar */}
            {user && (
              <div className="flex items-center space-x-1 lg:space-x-2">
                <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline-block text-sm font-medium">
                  {user.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Mobile navigation overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>
      
      {/* Layout with conditional sidebar */}
      <div className="flex flex-1">
        {/* Sidebar for larger screens */}
        {showNav && (
          <>
            {/* Mobile sidebar */}
            <AnimatePresence>
              {isOpen && (
                <motion.aside
                  className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-[280px] bg-background border-r shadow-lg lg:hidden overflow-y-auto"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sidebarVariants}
                >
                  <div className="flex items-center justify-between h-14 px-4 border-b">
                    <Link to="/" className="flex items-center space-x-2" onClick={closeSidebar}>
                      <Logo size="sm" showText={true} />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={closeSidebar} className="touch-target">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="py-2">
                    <div className="px-3 py-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={closeSidebar}
                          className={cn(
                            "flex items-center py-3 px-3 rounded-md mb-1 touch-target",
                            "hover:bg-secondary/50 transition-colors",
                            location.pathname === item.href
                              ? "bg-secondary text-secondary-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 mr-3 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
            
            {/* Desktop sidebar - collapsible */}
            <aside 
              className={cn(
                "fixed top-14 z-30 h-[calc(100vh-3.5rem)] border-r shrink-0 overflow-y-auto transition-all duration-300",
                "hidden lg:block",
                sidebarExpanded ? "w-64" : "w-16"
              )}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex justify-end p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={toggleSidebarExpansion}
                >
                  {sidebarExpanded ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <nav className="grid gap-1 p-2">
                {navigationItems.map((item) => (
                  <TooltipProvider key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial="initial"
                          whileHover="hover"
                          variants={navItemVariants}
                        >
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center py-3 rounded-md transition-colors overflow-hidden whitespace-nowrap",
                              sidebarExpanded ? "px-4" : "px-0 justify-center",
                              location.pathname === item.href
                                ? "bg-secondary text-secondary-foreground font-medium"
                                : "text-muted-foreground hover:bg-secondary/50"
                            )}
                          >
                            <item.icon className={cn(
                              "h-5 w-5 shrink-0",
                              sidebarExpanded ? "mr-3" : "mr-0"
                            )} />
                            <span className={cn(
                              "transition-opacity duration-200",
                              sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
                            )}>
                              {item.name}
                            </span>
                          </Link>
                        </motion.div>
                      </TooltipTrigger>
                      {!sidebarExpanded && (
                        <TooltipContent side="right" align="center" className="max-w-[200px]">
                          {item.description}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </nav>
            </aside>
          </>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {isOffline && <StatusBar isOffline={isOffline} />}
          <div className="relative lg:pl-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 