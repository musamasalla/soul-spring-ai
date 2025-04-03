import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Sun, Moon, Home, Settings, Book, Brain, Activity, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBar } from '@/components/ui/StatusBar';
import { cn } from '@/lib/utils';

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
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Define navigation items
  const navigationItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      description: 'Your personal health dashboard'
    },
    { 
      name: 'Therapy', 
      href: '/therapy', 
      icon: Brain,
      description: 'AI-assisted therapy sessions'
    },
    { 
      name: 'Meditation', 
      href: '/meditation', 
      icon: Activity,
      description: 'Guided meditation practices'
    },
    { 
      name: 'Journal', 
      href: '/journal', 
      icon: Book,
      description: 'Reflective journaling'
    },
    { 
      name: 'Chat', 
      href: '/chat', 
      icon: MessageCircle,
      description: 'Talk with your AI assistant'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'Customize your experience'
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
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-30 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4 lg:space-x-0">
            {showNav && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Tranquil Mind</span>
            </Link>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
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
      
      {/* Mobile navigation sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="fixed top-0 left-0 z-50 h-screen w-3/4 max-w-xs bg-card border-r shadow-lg lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
          >
            <div className="flex h-14 items-center border-b px-4">
              <Link to="/" className="flex items-center space-x-2" onClick={closeSidebar}>
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">Tranquil Mind</span>
              </Link>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" onClick={closeSidebar}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            <nav className="space-y-1 p-4">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    to={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                );
              })}
            </nav>
            
            {user && (
              <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground"
                  onClick={logout}
                >
                  <span>Log out</span>
                </Button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Desktop sidebar */}
      {showNav && (
        <div className="hidden lg:flex">
          <aside className="fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-56 border-r">
            <nav className="space-y-0.5 p-3">
              <div className="py-2">
                <p className="text-xs font-medium text-muted-foreground px-3 mb-2">Navigation</p>
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
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
                                "flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium",
                                isActive 
                                  ? "bg-primary/10 text-primary" 
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.name}</span>
                              {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4" />
                              )}
                            </Link>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.description}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </nav>
            
            {/* User section */}
            {user && (
              <div className="absolute bottom-0 left-0 right-0 border-t p-3">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground mt-2"
                  onClick={logout}
                >
                  <span>Log out</span>
                </Button>
              </div>
            )}
          </aside>
          
          {/* Main content with sidebar margin */}
          <div className="ml-56 w-full">
            <main className="flex-1">{children}</main>
          </div>
        </div>
      )}
      
      {/* Mobile and no-sidebar layout */}
      <div className={cn("flex-1", showNav ? "lg:hidden" : "")}>
        <main className="flex-1">{children}</main>
      </div>
      
      {/* Status bar for offline mode */}
      <StatusBar isOffline={isOffline} />
    </div>
  );
} 