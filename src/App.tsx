import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import Dashboard from '@/pages/dashboard';
import TherapyDashboard from '@/pages/therapy/index';
import MoodHistoryPage from '@/pages/MoodHistoryPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/ui/app-shell';
import { TherapyDataProvider, useTherapyData } from '@/contexts/TherapyDataProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import MeditationPage from '@/pages/MeditationPage';
import MeditationProgramsPage from '@/pages/MeditationProgramsPage';
import MeditationProgramDetailPage from '@/pages/MeditationProgramDetailPage';
import SettingsPage from '@/pages/SettingsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import JournalPage from '@/pages/JournalPage';
import CommunityPage from '@/pages/CommunityPage';
import AITherapyPage from '@/pages/AITherapyPage';
import PremiumPage from '@/pages/PremiumPage';
import NotFound from '@/pages/NotFound';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/ui/PageTransition';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Route guard for protected routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Show loading indicator while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading your account..." />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Route that redirects to dashboard if already logged in
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading your account..." />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Wrapper component that uses the therapy data context
function TherapyDataWrapper({ children }: { children: React.ReactNode }) {
  const { isUsingFallbackData } = useTherapyData();
  
  return (
    <AppShell isOffline={isUsingFallbackData}>
      {children}
    </AppShell>
  );
}

// AnimatePresence needs to be outside Routes but inside Router
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <AppShell showNav={false}>
                  <LoginPage />
                </AppShell>
              </PublicOnlyRoute>
            }
          />
          <Route 
            path="/signup" 
            element={
              <PublicOnlyRoute>
                <AppShell showNav={false}>
                  <SignupPage />
                </AppShell>
              </PublicOnlyRoute>
            }
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <Dashboard />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/therapy" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <TherapyDashboard />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/mood-history" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <MoodHistoryPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/meditation" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <MeditationPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/meditation-programs" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <MeditationProgramsPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/meditation-program/:id" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <MeditationProgramDetailPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <SettingsPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/recommendations" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <RecommendationsPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/journal" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <JournalPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/community" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <CommunityPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/ai-therapy" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <AITherapyPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          <Route 
            path="/premium" 
            element={
              <PrivateRoute>
                <TherapyDataWrapper>
                  <PremiumPage />
                </TherapyDataWrapper>
              </PrivateRoute>
            }
          />
          
          {/* Redirect root to dashboard if logged in, otherwise to login */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* Catch all route - Now using the standalone NotFound page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TherapyDataProvider>
            <Router>
              <AnimatedRoutes />
              <Toaster />
            </Router>
          </TherapyDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
