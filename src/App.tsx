import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import Dashboard from '@/pages/dashboard';
import TherapyDashboard from '@/pages/therapy/index';
import MoodHistoryPage from '@/pages/MoodHistoryPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/ui/app-shell';
import { useTherapyData } from '@/contexts/TherapyDataProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Route guard for protected routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Show loading indicator while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
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
              
              {/* Redirect root to dashboard if logged in, otherwise to login */}
              <Route 
                path="/" 
                element={<Navigate to="/dashboard" replace />} 
              />
              
              {/* Catch all route - redirect to dashboard */}
              <Route 
                path="*" 
                element={<Navigate to="/dashboard" replace />} 
              />
            </Routes>
          </Router>
          
          {/* Toast notifications */}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
