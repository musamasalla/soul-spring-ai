import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import AuthGuard from "./components/AuthGuard";

import Index from "./pages/Index";
import AITherapyPage from "./pages/AITherapyPage";
import MeditationPage from "./pages/MeditationPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import JournalPage from "./pages/JournalPage";
import CommunityPage from "./pages/CommunityPage";
import PremiumPage from "./pages/PremiumPage";
import DemoMeditationPage from "./components/DemoMeditationPage";

const App = () => {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes - do not require authentication */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={
                    <AuthGuard requireAuth={false}>
                      <LoginPage />
                    </AuthGuard>
                  } />
                  <Route path="/signup" element={
                    <AuthGuard requireAuth={false}>
                      <SignupPage />
                    </AuthGuard>
                  } />
                  <Route path="/demo-meditation" element={<DemoMeditationPage />} />

                  {/* Protected routes - require authentication */}
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <DashboardPage />
                    </AuthGuard>
                  } />
                  <Route path="/ai-therapy" element={
                    <AuthGuard>
                      <AITherapyPage />
                    </AuthGuard>
                  } />
                  <Route path="/meditation" element={
                    <AuthGuard>
                      <MeditationPage />
                    </AuthGuard>
                  } />
                  <Route path="/settings" element={
                    <AuthGuard>
                      <SettingsPage />
                    </AuthGuard>
                  } />
                  <Route path="/journal" element={
                    <AuthGuard>
                      <JournalPage />
                    </AuthGuard>
                  } />
                  <Route path="/community" element={
                    <AuthGuard>
                      <CommunityPage />
                    </AuthGuard>
                  } />
                  <Route path="/premium" element={
                    <AuthGuard>
                      <PremiumPage />
                    </AuthGuard>
                  } />
                  
                  {/* 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
