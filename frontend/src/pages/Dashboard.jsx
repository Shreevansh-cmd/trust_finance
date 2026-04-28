import React, { useEffect, useState } from "react";
import { getUserDashboard, applyLoan, updateFinancials, simulateRiskEvent } from "../services/api";

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
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">{children}</h2>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  const loadData = () => {
    if (!userId) return;
    setLoading(true);
    getUserDashboard(userId)
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleApplyLoan = async () => {
    try {
      await applyLoan(userId, 5000, "Personal Expense");
      loadData();
      alert("Loan application submitted!");
    } catch (err) {
      alert("Failed to apply for loan: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const handleSimulateBehavior = async () => {
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

      const riskRes = await simulateRiskEvent(userId, prevData, currData);
      alert(`Risk Alert Level: ${riskRes.risk_level}\n` + riskRes.message.join(", "));
      
      loadData();
    } catch (err) {
      alert("Failed to simulate behavior");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="min-h-full">
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
              onClick={handleSimulateBehavior}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium text-sm shadow-sm"
            >
              Simulate Bad Behavior
            </button>
            <button 
              onClick={handleApplyLoan}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium text-sm shadow-sm"
            >
              Apply for Loan
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Trust Score ── */}
          <Card className={`lg:row-span-2 ${badge.bg} flex flex-col items-center justify-center text-center gap-6`}>
            <SectionTitle>Trust Score</SectionTitle>
            <div className={`relative flex items-center justify-center w-44 h-44 rounded-full ring-4 ${badge.ring} ring-offset-4 ring-offset-white bg-white`}>
              <div>
                <p className={`text-6xl font-extrabold ${badge.color}`}>{score}</p>
                <p className="text-slate-500 text-xs mt-1">out of 100</p>
              </div>
            </div>
            <div>
              <span className={`text-xl font-semibold ${badge.color}`}>{badge.label}</span>
              <p className="text-slate-600 text-sm mt-2 max-w-xs">
                {score >= 75
                  ? "You have an excellent credit profile. Keep it up!"
                  : score >= 50
                  ? "Your profile is in good shape with room to improve."
                  : "Your trust score needs attention. Check suggestions below."}
              </p>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </Card>

          {/* ── Loan Status ── */}
          <Card>
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
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due: {new Date(data.loan_status.due_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </div>
            )}
          </Card>

          {/* ── Loan Limit ── */}
          <Card>
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
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{
                    width: data?.loan_status?.amount && data?.loan_limit
                      ? `${Math.min(100, Math.round((data.loan_status.amount / data.loan_limit) * 100))}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </Card>

          {/* ── Financial Summary ── */}
          <Card className="lg:col-span-2">
            <SectionTitle>Financial Summary</SectionTitle>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Income", value: income, color: "text-emerald-600", bg: "bg-emerald-50", icon: "↑" },
                { label: "Spending", value: spending, color: "text-red-600", bg: "bg-red-50", icon: "↓" },
                { label: "Savings", value: savings, color: "text-indigo-600", bg: "bg-indigo-50", icon: "◈" },
              ].map(({ label, value, color, bg, icon }) => (
                <div key={label} className={`${bg} rounded-xl p-4 text-center border border-slate-100`}>
                  <p className={`text-xl font-bold ${color}`}>{icon}</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1">₹{value.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-5">
              <MetricBar label="Income vs Max" value={income} max={maxRef} color="bg-emerald-500" />
              <MetricBar label="Spending vs Max" value={spending} max={maxRef} color="bg-red-500" />
              <MetricBar label="Savings vs Max" value={savings} max={maxRef} color="bg-indigo-500" />
            </div>
          </Card>
        </div>

        {/* ── Explanation Section ── */}
        {(reasons.length > 0 || suggestions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {reasons.length > 0 && (
              <Card>
                <SectionTitle>Why Your Score Is This</SectionTitle>
                <ul className="space-y-3">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold">!</span>
                      <span className="text-slate-700 text-sm leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {suggestions.length > 0 && (
              <Card>
                <SectionTitle>Suggestions to Improve</SectionTitle>
                <ul className="space-y-3">
                  {suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                      <span className="text-slate-700 text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
