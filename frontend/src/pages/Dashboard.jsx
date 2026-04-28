import React, { useEffect, useState } from "react";
import { getUserDashboard } from "../services/api";

const TrustBadge = ({ score }) => {
  if (score >= 75) return { label: "Excellent", color: "text-emerald-400", ring: "ring-emerald-400", bg: "from-emerald-500/20 to-emerald-900/10" };
  if (score >= 50) return { label: "Good", color: "text-yellow-400", ring: "ring-yellow-400", bg: "from-yellow-500/20 to-yellow-900/10" };
  return { label: "At Risk", color: "text-red-400", ring: "ring-red-400", bg: "from-red-500/20 to-red-900/10" };
};

const StatusPill = ({ status }) => {
  const map = {
    approved: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    pending: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    rejected: "bg-red-500/20 text-red-300 border border-red-500/40",
    none: "bg-slate-500/20 text-slate-300 border border-slate-500/40",
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
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">₹{value?.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl p-6 ${className}`}>
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

  useEffect(() => {
    getUserDashboard(1)
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-slate-400 text-sm">{error}</p>
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l7-7 4 4 7-7" />
              </svg>
            </div>
            <span className="text-indigo-400 text-sm font-medium">TrustLend</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your financial health overview · {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Trust Score (spans 1 col, tall) ── */}
          <Card className={`lg:row-span-2 bg-gradient-to-br ${badge.bg} flex flex-col items-center justify-center text-center gap-6`}>
            <SectionTitle>Trust Score</SectionTitle>
            <div className={`relative flex items-center justify-center w-44 h-44 rounded-full ring-4 ${badge.ring} ring-offset-4 ring-offset-slate-900 bg-slate-900/60`}>
              <div>
                <p className={`text-6xl font-extrabold ${badge.color}`}>{score}</p>
                <p className="text-slate-400 text-xs mt-1">out of 100</p>
              </div>
            </div>
            <div>
              <span className={`text-xl font-semibold ${badge.color}`}>{badge.label}</span>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                {score >= 75
                  ? "You have an excellent credit profile. Keep it up!"
                  : score >= 50
                  ? "Your profile is in good shape with room to improve."
                  : "Your trust score needs attention. Check suggestions below."}
              </p>
            </div>

            {/* Score breakdown bar */}
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </Card>

          {/* ── Loan Status ── */}
          <Card>
            <SectionTitle>Loan Status</SectionTitle>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-white mb-1">
                  {data?.loan_status?.amount ? `₹${Number(data.loan_status.amount).toLocaleString()}` : "—"}
                </p>
                <p className="text-slate-400 text-sm">
                  {data?.loan_status?.purpose ?? "No active loan"}
                </p>
              </div>
              <StatusPill status={data?.loan_status?.status} />
            </div>
            {data?.loan_status?.due_date && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due: {new Date(data.loan_status.due_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </div>
            )}
          </Card>

          {/* ── Loan Limit ── */}
          <Card>
            <SectionTitle>Loan Limit</SectionTitle>
            <p className="text-3xl font-extrabold text-indigo-400">
              ₹{Number(data?.loan_limit ?? 0).toLocaleString()}
            </p>
            <p className="text-slate-400 text-sm mt-1">Maximum eligible amount</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Utilised</span>
                <span>{data?.loan_status?.amount ? Math.round((data.loan_status.amount / data.loan_limit) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
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
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Monthly Income", value: income, color: "text-emerald-400", icon: "↑" },
                { label: "Monthly Spending", value: spending, color: "text-red-400", icon: "↓" },
                { label: "Savings", value: savings, color: "text-indigo-400", icon: "◈" },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="bg-slate-700/40 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{icon}</p>
                  <p className="text-lg font-semibold text-white mt-1">₹{value.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <MetricBar label="Income" value={income} max={maxRef} color="bg-emerald-500" />
              <MetricBar label="Spending" value={spending} max={maxRef} color="bg-red-500" />
              <MetricBar label="Savings" value={savings} max={maxRef} color="bg-indigo-500" />
            </div>
          </Card>
        </div>

        {/* ── Explanation Section ── */}
        {(reasons.length > 0 || suggestions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Reasons */}
            {reasons.length > 0 && (
              <Card>
                <SectionTitle>Why Your Score Is This</SectionTitle>
                <ul className="space-y-3">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs">!</span>
                      <span className="text-slate-300 text-sm leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <SectionTitle>Suggestions to Improve</SectionTitle>
                <ul className="space-y-3">
                  {suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                      <span className="text-slate-300 text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-10">
          TrustLend · Data refreshed on login · Scores are indicative
        </p>
      </div>
    </div>
  );
}
