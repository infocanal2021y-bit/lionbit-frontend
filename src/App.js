import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./components/layout/Layout";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountsPage } from "./pages/AccountsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { WithdrawPage } from "./pages/WithdrawPage";
import { TransferPage } from "./pages/TransferPage";
import { KYCPage } from "./pages/KYCPage";

// Admin Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminTransactionsPage } from "./pages/admin/AdminTransactionsPage";
import { AdminWithdrawalsPage } from "./pages/admin/AdminWithdrawalsPage";
import { AdminKYCPage } from "./pages/admin/AdminKYCPage";
import { AdminTreasuryPage } from "./pages/admin/AdminTreasuryPage";
import { AdminCreditsPage } from "./pages/admin/AdminCreditsPage";
import { AdminCryptoPaymentsPage } from "./pages/admin/AdminCryptoPaymentsPage";
import { AdminCryptoStatsPage } from "./pages/admin/AdminCryptoStatsPage";

/* ---------------- PROTECTED ROUTE ---------------- */

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ---------------- PUBLIC ROUTE ---------------- */

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ---------------- ROUTES ---------------- */

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected Layout Wrapper */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="withdraw" element={<WithdrawPage />} />
        <Route path="transfer" element={<TransferPage />} />
        <Route path="kyc" element={<KYCPage />} />

        {/* Admin */}
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="admin/credits" element={<ProtectedRoute adminOnly><AdminCreditsPage /></ProtectedRoute>} />
        <Route path="admin/crypto-payments" element={<ProtectedRoute adminOnly><AdminCryptoPaymentsPage /></ProtectedRoute>} />
        <Route path="admin/crypto-stats" element={<ProtectedRoute adminOnly><AdminCryptoStatsPage /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
        <Route path="admin/transactions" element={<ProtectedRoute adminOnly><AdminTransactionsPage /></ProtectedRoute>} />
        <Route path="admin/withdrawals" element={<ProtectedRoute adminOnly><AdminWithdrawalsPage /></ProtectedRoute>} />
        <Route path="admin/kyc" element={<ProtectedRoute adminOnly><AdminKYCPage /></ProtectedRoute>} />
        <Route path="admin/treasury" element={<ProtectedRoute adminOnly><AdminTreasuryPage /></ProtectedRoute>} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

/* ---------------- MAIN APP ---------------- */

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
