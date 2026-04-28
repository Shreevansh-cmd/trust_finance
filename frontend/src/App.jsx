import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { LayoutDashboard, Shield, Bell, Search, UserCircle, Settings } from 'lucide-react';
import clsx from 'clsx';

function Sidebar() {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Admin Portal', path: '/admin', icon: Shield },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex border-r border-slate-800">
      <div className="p-6">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-2">
          <Shield className="text-blue-500" />
          TrustFinance
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                isActive 
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full rounded-xl hover:bg-slate-800 transition-colors">
          <Settings size={20} />
          Settings
        </button>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
        <Search className="text-slate-400 mr-2" size={20} />
        <input 
          type="text" 
          placeholder="Search transactions, users, or alerts..." 
          className="bg-transparent border-none outline-none w-full text-slate-700 text-sm"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={24} />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">John Doe</p>
            <p className="text-xs text-slate-500 font-medium">Premium Member</p>
          </div>
          <UserCircle size={40} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-900 font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
