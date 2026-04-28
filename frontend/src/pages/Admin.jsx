import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

// ── Helpers ──────────────────────────────────────────────────────────────────

const RiskBadge = ({ level }) => {
  const map = {
    low: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    medium: "bg-yellow-500/15 text-yellow-600 border border-yellow-500/30",
    high: "bg-red-500/15 text-red-600 border border-red-500/30",
  };
  const key = (level ?? "low").toLowerCase();
  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${map[key] ?? map.low}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${key === "high" ? "bg-red-500" : key === "medium" ? "bg-yellow-500" : "bg-emerald-500"}`} />
      {level ?? "Low"}
    </motion.span>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    active: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    inactive: "bg-slate-100 text-slate-600 border border-slate-200",
    suspended: "bg-red-100 text-red-700 border border-red-200",
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
    score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  const textColor =
    score >= 75 ? "text-emerald-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
    
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`} 
        />
      </div>
      <span className={`text-sm font-bold tabular-nums ${textColor}`}>
        {score}
      </span>
    </div>
  );
};

// ── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 10}%` }} />
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
    if (sortConfig.key !== col) return <span className="text-slate-400 ml-1">↕</span>;
    return <span className="text-indigo-600 ml-1">{sortConfig.dir === "asc" ? "↑" : "↓"}</span>;
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full"
    >
      <div className="relative max-w-7xl mx-auto py-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-indigo-600 text-sm font-medium">TrustLend · Admin</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">User Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {users.length} total users · {highRiskCount} flagged high-risk
            </p>
          </div>

          {/* Stats chips */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Low Risk", count: users.filter(u => (u.risk_level ?? "low").toLowerCase() === "low").length, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
              { label: "Medium Risk", count: users.filter(u => (u.risk_level ?? "").toLowerCase() === "medium").length, color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
              { label: "High Risk", count: highRiskCount, color: "text-red-700 bg-red-50 border-red-200" },
            ].map(({ label, count, color }, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                key={label} 
                className={`border rounded-xl px-4 py-2 text-center min-w-[90px] ${color} shadow-sm`}
              >
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs opacity-80">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Risk Alert Banner ── */}
        <AnimatePresence>
          {!alertDismissed && highRiskCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-start justify-between gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠</span>
                <div>
                  <p className="text-red-800 font-semibold text-sm">Risk Alert: Increased by 20%</p>
                  <p className="text-red-600 text-xs mt-0.5">
                    {highRiskCount} user{highRiskCount !== 1 ? "s" : ""} flagged as high-risk. Review and take action immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAlertDismissed(true)}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5"
                aria-label="Dismiss alert"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition shadow-sm"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition shadow-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        {/* ── Table ── */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    { label: "#", key: null },
                    { label: "Name", key: "name" },
                    { label: "Trust Score", key: "trust_score" },
                    { label: "Risk Level", key: "risk_level" },
                    { label: "Status", key: "status" },
                    { label: "Fraud Alert", key: "fraud_detected" },
                    { label: "Actions", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={() => key && handleSort(key)}
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500 select-none ${key ? "cursor-pointer hover:text-slate-800 transition-colors" : ""}`}
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
                        <p className="text-red-600 font-semibold">{error}</p>
                        <p className="text-slate-500 text-xs">Check your backend connection and try again.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">🔍</span>
                        <p className="text-slate-500 font-medium">No users match your filters.</p>
                        <button onClick={() => { setSearch(""); setRiskFilter("all"); }} className="text-indigo-600 text-xs hover:underline mt-1">Clear filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((user, idx) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={user.id ?? idx}
                        className={`border-b border-slate-100 hover:shadow-sm hover:z-10 relative transition-colors group ${user.fraud?.detected ? "bg-red-50/50 hover:bg-red-50" : "bg-white hover:bg-slate-50"}`}
                      >
                        {/* Index */}
                        <td className="px-6 py-4 text-slate-500 tabular-nums">{idx + 1}</td>

                        {/* Name + Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                              {((user.name || user.username) ?? "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-slate-800 font-medium leading-tight">{(user.name || user.username) ?? "—"}</p>
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
                          <StatusPill status={user.status || (user.loan_status ? "active" : "inactive")} />
                        </td>

                        {/* Fraud Status */}
                        <td className="px-6 py-4">
                          {user.fraud?.detected ? (
                            <div className={`group/fraud relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide cursor-help ${
                              user.fraud.severity === "High" ? "bg-red-100 text-red-700 border border-red-200" :
                              user.fraud.severity === "Medium" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                              "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${user.fraud.severity === "High" ? "bg-red-500" : "bg-yellow-500"}`} />
                              {user.fraud.severity} Fraud Risk
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/fraud:opacity-100 group-hover/fraud:visible transition-all z-50 normal-case tracking-normal text-left font-normal">
                                <p className="font-bold mb-1 text-slate-100 text-sm">{user.fraud.type}</p>
                                <p className="text-slate-300 mb-2 leading-relaxed">{user.fraud.reason}</p>
                                <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                                  <span className="font-semibold text-slate-200">Recommendation:</span> <span className="text-slate-300">{user.fraud.recommendation}</span>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              title="View user"
                              className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition hover:scale-110"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              title="Flag user"
                              className="w-8 h-8 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 flex items-center justify-center transition hover:scale-110"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0l9-2 9 2v13l-9 2-9-2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <p className="text-slate-500 text-xs">
                Showing <span className="text-slate-700 font-medium">{filtered.length}</span> of <span className="text-slate-700 font-medium">{users.length}</span> users
              </p>
              <p className="text-slate-400 text-xs">TrustLend Admin · {new Date().toLocaleDateString("en-IN")}</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
