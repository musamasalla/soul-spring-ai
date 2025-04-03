import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import AuthGuard from "./components/AuthGuard";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageSkeleton } from "@/components/ui/skeletons/CardSkeleton";

// Import non-lazy components that are critical
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Lazy load other page components
const Index = lazy(() => import("./pages/Index"));
const AITherapyPage = lazy(() => import("./pages/AITherapyPage"));
const MeditationPage = lazy(() => import("./pages/MeditationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
const MoodHistoryPage = lazy(() => import("./pages/MoodHistoryPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const DemoMeditationPage = lazy(() => import("./components/DemoMeditationPage"));

const App = () => {
  // Create a client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Router>
                    <Header />
                    <main className="pt-[57px] md:pt-[73px]">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/" element={
                          <ErrorBoundary>
                            <Suspense fallback={<PageSkeleton />}>
                              <Index />
                            </Suspense>
                          </ErrorBoundary>
                        } />
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
                        <Route path="/demo-meditation" element={
                          <ErrorBoundary>
                            <Suspense fallback={<PageSkeleton />}>
                              <DemoMeditationPage />
                            </Suspense>
                          </ErrorBoundary>
                        } />

                        <Route path="/dashboard" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <DashboardPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/ai-therapy" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <AITherapyPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/meditation" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <MeditationPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/mood-history" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <MoodHistoryPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/recommendations" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <RecommendationsPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/settings" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <SettingsPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/journal" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <JournalPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/community" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <CommunityPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        <Route path="/premium" element={
                          <AuthGuard>
                            <ErrorBoundary>
                              <Suspense fallback={<PageSkeleton />}>
                                <PremiumPage />
                              </Suspense>
                            </ErrorBoundary>
                          </AuthGuard>
                        } />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </Router>
                </div>
              </TooltipProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
