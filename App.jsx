import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import WorkerApp from './pages/WorkerApp';
import WorkerClaims from './pages/WorkerClaims';
import WorkerAnalytics from './pages/WorkerAnalytics';
import WorkerSettings from './pages/WorkerSettings';
import AdminDashboard from './pages/AdminDashboard';
import AdminClaims from './pages/AdminClaims';
import AdminSettings from './pages/AdminSettings';
import Analytics from './pages/Analytics';

const RequireAuth = ({ children, role }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }

    if (role && user?.role !== role) {
        const fallback = user?.role === 'admin' ? '/admin' : '/worker';
        return <Navigate to={fallback} replace />;
    }

    return children;
};

const AuthenticatedApp = () => {
    const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

    // Show loading spinner while checking app public settings or auth
    if (isLoadingPublicSettings || isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Handle authentication errors
    if (authError) {
        if (authError.type === 'user_not_registered') {
            return <UserNotRegisteredError />;
        } else if (authError.type === 'auth_required') {
            // Redirect to login automatically
            navigateToLogin();
            return null;
        }
    }

    // Render the main app
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/worker" element={<RequireAuth role="worker"><WorkerApp /></RequireAuth>} />
            <Route path="/worker/claims" element={<RequireAuth role="worker"><WorkerClaims /></RequireAuth>} />
            <Route path="/worker/analytics" element={<RequireAuth role="worker"><WorkerAnalytics /></RequireAuth>} />
            <Route path="/worker/settings" element={<RequireAuth role="worker"><WorkerSettings /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/claims" element={<RequireAuth role="admin"><AdminClaims /></RequireAuth>} />
            <Route path="/admin/analytics" element={<RequireAuth role="admin"><Analytics /></RequireAuth>} />
            <Route path="/admin/settings" element={<RequireAuth role="admin"><AdminSettings /></RequireAuth>} />
            <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};


function App() {

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <Router>
                    <AuthenticatedApp />
                </Router>
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}

export default App
