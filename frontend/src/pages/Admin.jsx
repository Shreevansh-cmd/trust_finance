import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const RiskBadge = ({ level }) => {
  const map = {
    low: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    medium: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
    high: "bg-red-500/15 text-red-300 border border-red-500/30",
  };
  const key = (level ?? "low").toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${map[key] ?? map.low}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${key === "high" ? "bg-red-400" : key === "medium" ? "bg-yellow-400" : "bg-emerald-400"}`} />
      {level ?? "Low"}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    active: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
    inactive: "bg-slate-500/15 text-slate-400 border border-slate-600/30",
    suspended: "bg-red-500/15 text-red-300 border border-red-500/30",
  };
  const key = (status ?? "active").toLowerCase();
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[key] ?? map.active}`}>
      {status ?? "Active"}
    </span>
  );
};

const TrustBar = ({ score }) => {
  const color =
    score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold tabular-nums ${score >= 75 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
        {score}
      </span>
    </div>
  );
};

// ── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-slate-700/50">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-700/60 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
      </td>
    ))}
  </tr>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "trust_score", dir: "desc" });

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load user data."))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <span className="text-slate-600 ml-1">↕</span>;
    return <span className="text-indigo-400 ml-1">{sortConfig.dir === "asc" ? "↑" : "↓"}</span>;
  };

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = u.name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchRisk = riskFilter === "all" || (u.risk_level ?? "low").toLowerCase() === riskFilter;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      const val = (x) => {
        if (sortConfig.key === "trust_score") return x.trust_score ?? 0;
        if (sortConfig.key === "name") return x.name ?? "";
        if (sortConfig.key === "risk_level") return x.risk_level ?? "";
        return x[sortConfig.key] ?? "";
      };
      const av = val(a);
      const bv = val(b);
      if (av < bv) return sortConfig.dir === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });

  const highRiskCount = users.filter((u) => (u.risk_level ?? "").toLowerCase() === "high").length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-indigo-400 text-sm font-medium">TrustLend · Admin</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {users.length} total users · {highRiskCount} flagged high-risk
            </p>
          </div>

          {/* Stats chips */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Low Risk", count: users.filter(u => (u.risk_level ?? "low").toLowerCase() === "low").length, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Medium Risk", count: users.filter(u => (u.risk_level ?? "").toLowerCase() === "medium").length, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
              { label: "High Risk", count: highRiskCount, color: "text-red-400 bg-red-500/10 border-red-500/20" },
            ].map(({ label, count, color }) => (
              <div key={label} className={`border rounded-xl px-4 py-2 text-center min-w-[90px] ${color}`}>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs opacity-80">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Risk Alert Banner ── */}
        {!alertDismissed && highRiskCount > 0 && (
          <div className="flex items-start justify-between gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 mb-6 animate-pulse-once">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠</span>
              <div>
                <p className="text-red-300 font-semibold text-sm">Risk Alert: Increased by 20%</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {highRiskCount} user{highRiskCount !== 1 ? "s" : ""} flagged as high-risk. Review and take action immediately.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAlertDismissed(true)}
              className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
              aria-label="Dismiss alert"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/80">
                  {[
                    { label: "#", key: null },
                    { label: "Name", key: "name" },
                    { label: "Trust Score", key: "trust_score" },
                    { label: "Risk Level", key: "risk_level" },
                    { label: "Status", key: "status" },
                    { label: "Actions", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={() => key && handleSort(key)}
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-400 select-none ${key ? "cursor-pointer hover:text-white transition-colors" : ""}`}
                    >
                      {label}
                      {key && <SortIcon col={key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">⚡</span>
                        <p className="text-red-400 font-semibold">{error}</p>
                        <p className="text-slate-500 text-xs">Check your backend connection and try again.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">🔍</span>
                        <p className="text-slate-400 font-medium">No users match your filters.</p>
                        <button onClick={() => { setSearch(""); setRiskFilter("all"); }} className="text-indigo-400 text-xs hover:underline mt-1">Clear filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, idx) => (
                    <tr
                      key={user.id ?? idx}
                      className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors group"
                    >
                      {/* Index */}
                      <td className="px-6 py-4 text-slate-500 tabular-nums">{idx + 1}</td>

                      {/* Name + Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
                            {((user.name || user.username) ?? "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium leading-tight">{(user.name || user.username) ?? "—"}</p>
                            {user.email && <p className="text-slate-500 text-xs">{user.email}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Trust Score */}
                      <td className="px-6 py-4 min-w-[140px]">
                        <TrustBar score={user.trust_score ?? 0} />
                      </td>

                      {/* Risk Level */}
                      <td className="px-6 py-4">
                        <RiskBadge level={user.risk_level} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusPill status={user.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="View user"
                            className="w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 flex items-center justify-center transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            title="Flag user"
                            className="w-8 h-8 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-400 flex items-center justify-center transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0l9-2 9 2v13l-9 2-9-2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-700/40 flex items-center justify-between">
              <p className="text-slate-500 text-xs">
                Showing <span className="text-slate-300">{filtered.length}</span> of <span className="text-slate-300">{users.length}</span> users
              </p>
              <p className="text-slate-600 text-xs">TrustLend Admin · {new Date().toLocaleDateString("en-IN")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
