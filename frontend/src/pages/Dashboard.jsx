import React, { useEffect, useState, useCallback } from "react";
import { getUserDashboard, applyLoan, updateFinancials, simulateRiskEvent, resetFinancials } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import toast from "react-hot-toast";
import Chatbot from "../components/Chatbot";

const TrustBadge = ({ score }) => {
  if (score >= 75) return { label: "Excellent", color: "text-emerald-600", ring: "ring-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
  if (score >= 50) return { label: "Good", color: "text-yellow-600", ring: "ring-yellow-500", bg: "bg-yellow-50 border-yellow-200" };
  return { label: "At Risk", color: "text-red-600", ring: "ring-red-500", bg: "bg-red-50 border-red-200" };
};

const StatusPill = ({ status }) => {
  const map = {
    approved: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    rejected: "bg-red-100 text-red-700 border border-red-300",
    none: "bg-slate-100 text-slate-700 border border-slate-300",
  };
  const cls = map[(status || "none").toLowerCase()] ?? map.none;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${cls}`}>
      {status || "None"}
    </span>
  );
};

const MetricBar = ({ label, value, max, color }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-800 font-medium">₹{value?.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.01 }}
    className={`bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">{children}</h2>
);

// Skeleton loader
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-6 animate-pulse">
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="h-20 bg-slate-200 rounded-xl w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 bg-slate-200 rounded-2xl lg:row-span-2" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-80 bg-slate-200 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getUserDashboard(userId);
      setData(res);
      console.log("API response:", res);
      console.log("Trust Score:", res.trust_score);
      console.log("Fraud Severity:", res.fraud?.severity);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleReload = async () => {
    if (!userId) return;
    setIsRefreshing(true);
    setLoading(true);
    try {
      const res = await getUserDashboard(userId);
      setData(res);
      console.log("New dashboard data:", res);
      toast.success("Dashboard refreshed", { id: "refresh" });
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 15 seconds
    const interval = setInterval(() => loadData(), 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleApplyLoan = async () => {
    const tId = toast.loading("Processing loan application...");
    try {
      await applyLoan(userId, 5000, "Personal Expense");
      await loadData();
      toast.success("Loan application submitted successfully!", { id: tId });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to apply for loan", { id: tId });
    }
  };

  const handleSimulateBehavior = async () => {
    const tId = toast.loading("Simulating high risk behavior...");
    try {
      const prevData = {
        income: data.financial_summary.income,
        spending: data.financial_summary.spending
      };

      const currData = {
        income: data.financial_summary.income,
        spending: data.financial_summary.spending + 15000 // simulate spike
      };

      await updateFinancials(userId, {
        income: currData.income,
        spending: currData.spending,
        savings: data.financial_summary.savings - 5000
      });

      const riskRes = await simulateRiskEvent(userId);
      await loadData();
      if (riskRes.fraud?.detected) {
        toast.error(`⚠ Suspicious activity detected: ${riskRes.fraud.reason}`, { id: tId, duration: 4000 });
      } else {
        toast.error(`Risk Alert Level: ${riskRes.risk_level.toUpperCase()}\n${riskRes.message}`, { id: tId, duration: 4000 });
      }
    } catch (err) {
      toast.error("Failed to simulate behavior", { id: tId });
    }
  };

  const handleReset = async () => {
    const tId = toast.loading("Resetting data...");
    try {
      await resetFinancials(userId);
      await handleReload();
      toast.success("Data reset to normal", { id: tId });
    } catch (err) {
      toast.error("Failed to reset data", { id: tId });
    }
  };

  if (loading && !data) return <DashboardSkeleton />;

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-600 text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const score = data?.trust_score ?? 0;
  const badge = TrustBadge({ score });
  const reasons = data?.explanation?.reasons ?? [];
  const suggestions = data?.explanation?.suggestions ?? [];
  const income = data?.financial_summary?.income ?? 0;
  const spending = data?.financial_summary?.spending ?? 0;
  const savings = data?.financial_summary?.savings ?? 0;
  const maxRef = Math.max(income, 1);
  const history = data?.history || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full"
    >
      <div className="max-w-6xl mx-auto py-6">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l7-7 4 4 7-7" />
                </svg>
              </div>
              <span className="text-indigo-600 text-sm font-medium">TrustLend Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back, {data?.name || "User"}</h1>
            <p className="text-slate-500 text-sm mt-1">
              Your financial health overview · {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReload}
              disabled={isRefreshing}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleSimulateBehavior}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm"
            >
              Simulate Bad Behavior
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm"
            >
              Reset Data
            </button>
            <button
              onClick={handleApplyLoan}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 font-medium text-sm shadow-sm hover:scale-105"
            >
              Apply for Loan
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Fraud Alert Banner ── */}
          <AnimatePresence>
            {data?.fraud?.detected && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-1 lg:col-span-3 bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xl font-bold">⚠</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="text-red-800 font-bold text-lg leading-tight">Suspicious Activity Detected</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${data.fraud.severity === "High" ? "bg-red-200 text-red-800" :
                          data.fraud.severity === "Medium" ? "bg-yellow-200 text-yellow-800" : "bg-blue-100 text-blue-800"}
                      `}>
                        {data.fraud.severity} Severity
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <p className="text-sm">
                        <span className="font-semibold text-red-700">Type:</span> <span className="text-red-900">{data.fraud.type}</span>
                      </p>
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">Reason:</span> {data.fraud.reason}
                      </p>
                    </div>

                    <div className="bg-white/60 p-3 rounded-lg border border-red-100">
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">Recommendation:</span> {data.fraud.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Trust Score ── */}
          <Card delay={0.1} className={`lg:row-span-2 ${badge.bg} flex flex-col items-center justify-center text-center gap-6 bg-gradient-to-br from-white to-transparent`}>
            <SectionTitle>Trust Score</SectionTitle>
            <div className={`relative flex items-center justify-center w-48 h-48 rounded-full ring-4 ${badge.ring} ring-offset-4 ring-offset-white bg-white shadow-inner`}>
              <div>
                <motion.p
                  key={score}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`text-7xl font-extrabold ${badge.color}`}
                >
                  {score}
                </motion.p>
                <p className="text-slate-500 text-xs mt-1">out of 100</p>
              </div>
            </div>
            <div>
              <span className={`text-xl font-semibold ${badge.color}`}>{badge.label}</span>
              <p className={`text-sm mt-2 max-w-xs font-medium ${badge.color}`}>
                {data?.risk_message || "Spending is well within limits."}
              </p>
            </div>

            {/* Score trend mini chart */}
            {history.length > 0 && (
              <div className="w-full h-20 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={score >= 75 ? "#10b981" : score >= 50 ? "#eab308" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={score >= 75 ? "#10b981" : score >= 50 ? "#eab308" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="trust_score" stroke={score >= 75 ? "#10b981" : score >= 50 ? "#eab308" : "#ef4444"} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* ── Loan Status ── */}
          <Card delay={0.2}>
            <SectionTitle>Loan Status</SectionTitle>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800 mb-1">
                  {data?.loan_status?.amount ? `₹${Number(data.loan_status.amount).toLocaleString()}` : "—"}
                </p>
                <p className="text-slate-500 text-sm">
                  {data?.loan_status?.purpose ?? "No active loan"}
                </p>
              </div>
              <StatusPill status={data?.loan_status?.status} />
            </div>
            {data?.loan_status?.due_date && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due: {new Date(data.loan_status.due_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </div>
            )}
          </Card>

          {/* ── Loan Limit ── */}
          <Card delay={0.3}>
            <SectionTitle>Loan Limit</SectionTitle>
            <p className="text-3xl font-extrabold text-indigo-600">
              ₹{Number(data?.loan_limit ?? 0).toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm mt-1">Maximum eligible amount</p>
            <div className="mt-6 space-y-1">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Utilised</span>
                <span>{data?.loan_status?.amount ? Math.round((data.loan_status.amount / data.loan_limit) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: data?.loan_status?.amount && data?.loan_limit ? `${Math.min(100, Math.round((data.loan_status.amount / data.loan_limit) * 100))}%` : "0%" }}
                  transition={{ duration: 1 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>
          </Card>

          {/* ── Financial Summary ── */}
          <Card delay={0.4} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Financial Summary</SectionTitle>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Income", value: income, color: "text-emerald-600", bg: "bg-emerald-50", icon: "↑" },
                { label: "Spending", value: spending, color: "text-red-600", bg: "bg-red-50", icon: "↓" },
                { label: "Savings", value: savings, color: "text-indigo-600", bg: "bg-indigo-50", icon: "◈" },
              ].map(({ label, value, color, bg, icon }) => (
                <div key={label} className={`${bg} rounded-xl p-4 text-center border border-slate-100 transition-transform hover:scale-105`}>
                  <p className={`text-xl font-bold ${color}`}>{icon}</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1">₹{value.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Financial Chart */}
            {history.length > 0 && (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="spending" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="savings" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* ── Explanation Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {(reasons.length > 0 || suggestions.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {reasons.length > 0 && (
                <Card>
                  <SectionTitle>Why Your Score Is This</SectionTitle>
                  <ul className="space-y-3">
                    {reasons.map((r, i) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        key={i}
                        className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold">!</span>
                        <span className="text-slate-700 text-sm leading-relaxed">{r}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              )}

              {suggestions.length > 0 && (
                <Card>
                  <SectionTitle>Suggestions to Improve</SectionTitle>
                  <ul className="space-y-3">
                    {suggestions.map((s, i) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        key={i}
                        className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                        <span className="text-slate-700 text-sm leading-relaxed">{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </motion.div>

      </div>

      {/* AI Chatbot – floats bottom-right, receives live user data */}
      <Chatbot userData={{
        trust_score: data?.trust_score,
        income: data?.financial_summary?.income,
        spending: data?.financial_summary?.spending,
        savings: data?.financial_summary?.savings,
        risk_level: data?.risk_level
      }} />
    </motion.div>
  );
}
