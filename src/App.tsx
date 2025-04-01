
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";

import Index from "./pages/Index";
import AITherapyPage from "./pages/AITherapyPage";
import MeditationPage from "./pages/MeditationPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

const App = () => {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
