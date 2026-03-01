import axios from "axios";

/*
  🔥 CONFIGURACIÓN INTELIGENTE
  1. Usa variable de entorno si existe
  2. Si no existe, usa URL fija (fallback seguro)
*/

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://TU-BACKEND-REAL.up.railway.app"; // 👈 CAMBIA ESTO

const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   REQUEST INTERCEPTOR
============================ */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response || error);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

/* ============================
   AUTH API
============================ */

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

/* ============================
   KYC API
============================ */

export const kycAPI = {
  submit: (data) => api.post("/kyc/submit", data),
  getStatus: () => api.get("/kyc/status"),
};

/* ============================
   ACCOUNTS API
============================ */

export const accountsAPI = {
  getAll: () => api.get("/accounts"),
  getById: (id) => api.get(`/accounts/${id}`),
  getSummary: () => api.get("/accounts/summary/total"),
};

/* ============================
   TRANSACTIONS API
============================ */

export const transactionsAPI = {
  create: (data) => api.post("/transactions", data),
  getAll: (params) => api.get("/transactions", { params }),
  getAllHistory: () => api.get("/transactions/all"),
  getStats: () => api.get("/transactions/stats"),
  exportCSV: () =>
    api.get("/transactions/export/csv", { responseType: "blob" }),
  payTax: (id, data) =>
    api.post(`/transactions/${id}/pay-tax`, data),
  getReceipt: (id) =>
    api.get(`/transactions/${id}/receipt`, { responseType: "blob" }),

  // Crypto
  getCryptoWallets: () => api.get("/crypto-wallets"),
  submitCryptoPayment: (id, data) =>
    api.post(`/transactions/${id}/pay-tax-crypto`, data),
  getCryptoPaymentStatus: (id) =>
    api.get(`/transactions/${id}/crypto-payment`),
};

/* ============================
   NOTIFICATIONS API
============================ */

export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

/* ============================
   ADMIN API
============================ */

export const adminAPI = {
  getUsers: () => api.get("/admin/users"),
  getTransactions: (status) =>
    api.get("/admin/transactions", { params: { status } }),
  getPendingWithdrawals: () =>
    api.get("/admin/withdrawals/pending"),
  approveWithdrawal: (id) =>
    api.post(`/admin/withdrawals/approve/${id}`),
  rejectWithdrawal: (id) =>
    api.post(`/admin/withdrawals/reject/${id}`),
  updateBalance: (data) =>
    api.put("/admin/balance", data),
  updateTransactionStatus: (data) =>
    api.put("/admin/transaction-status", data),
  updateUserRole: (data) =>
    api.put("/admin/user-role", data),

  // KYC
  getPendingKYC: () => api.get("/admin/kyc/pending"),
  kycAction: (data) =>
    api.post("/admin/kyc/action", data),

  // User management
  suspendUser: (data) =>
    api.post("/admin/user/suspend", data),

  // Transfers
  forceRelease: (data) =>
    api.post("/admin/transfer/force-release", data),

  // Treasury
  getTreasury: () => api.get("/admin/treasury"),

  // Credits
  addBalance: (data) =>
    api.post("/admin/add-balance", data),
  getCredits: () => api.get("/admin/credits"),

  // Crypto payments
  getPendingCryptoPayments: () =>
    api.get("/admin/crypto-payments/pending"),
  cryptoPaymentAction: (data) =>
    api.post("/admin/crypto-payments/action", data),
  getCryptoPaymentProof: (id) =>
    api.get(`/admin/crypto-payments/${id}/proof`),
  getCryptoPaymentsHistory: () =>
    api.get("/admin/crypto-payments/history"),
  getCryptoPaymentsStats: () =>
    api.get("/admin/crypto-payments/stats"),
};

/* ============================
   EXCHANGE RATES
============================ */

export const getExchangeRates = () =>
  api.get("/exchange-rates");

export default api;
